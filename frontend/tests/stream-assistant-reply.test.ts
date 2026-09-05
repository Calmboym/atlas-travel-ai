import { afterEach, describe, expect, it, vi } from "vitest";
import { streamAssistantReply } from "@/lib/chat/stream-assistant-reply";

/**
 * ADDED — ATLAS-P1-CHAT-04. Every other test touching this module
 * (tests/use-chat-session.test.ts, tests/chat-page-content.test.tsx)
 * mocks it away entirely — appropriate for testing the *hook's* state
 * machine in isolation, but that means the actual SSE byte-parsing
 * logic in this file (buffering across reads, "\n\n" boundary
 * detection, discriminated "type" field handling) was never exercised
 * by any of them. This file drives a real ReadableStream through a
 * mocked global.fetch, so the parsing logic itself is genuinely
 * tested, not assumed correct because the higher-level tests pass.
 */

function sseFrame(payload: unknown): string {
  return `data: ${JSON.stringify(payload)}\n\n`;
}

function streamFromChunks(chunks: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  let index = 0;
  return new ReadableStream({
    pull(controller) {
      if (index >= chunks.length) {
        controller.close();
        return;
      }
      controller.enqueue(encoder.encode(chunks[index]));
      index += 1;
    },
  });
}

function mockFetchOnce(response: { ok?: boolean; body: ReadableStream<Uint8Array> | null }): void {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({ ok: true, ...response } as unknown as Response),
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("streamAssistantReply", () => {
  it("accumulates chunks split across multiple stream reads, then calls onDone", async () => {
    // Deliberately splits one SSE frame's own text across two chunks
    // (mid data-line) to prove the byte buffer correctly reassembles
    // it before looking for the "\n\n" boundary.
    mockFetchOnce({
      body: streamFromChunks([
        'data: {"type":"chunk","content":"Ro',
        'me"}\n\n',
        sseFrame({ type: "chunk", content: " is lovely." }),
        sseFrame({ type: "done" }),
      ]),
    });

    const onChunk = vi.fn();
    const onDone = vi.fn();
    const onError = vi.fn();

    streamAssistantReply({
      messages: [{ role: "user", content: "Tell me about Rome" }],
      onChunk,
      onDone,
      onError,
    });

    await vi.waitFor(() => expect(onDone).toHaveBeenCalledTimes(1));

    expect(onChunk).toHaveBeenNthCalledWith(1, "Rome");
    expect(onChunk).toHaveBeenNthCalledWith(2, "Rome is lovely.");
    expect(onDone).toHaveBeenCalledWith("Rome is lovely.");
    expect(onError).not.toHaveBeenCalled();
  });

  it("sends the exact request body the backend expects", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      body: streamFromChunks([sseFrame({ type: "done" })]),
    } as unknown as Response);
    vi.stubGlobal("fetch", fetchMock);

    streamAssistantReply({
      messages: [{ role: "user", content: "Hi" }],
      onChunk: vi.fn(),
      onDone: vi.fn(),
      onError: vi.fn(),
    });

    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toMatch(/\/api\/v1\/chat\/completions\/stream$/);
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body as string)).toEqual({
      messages: [{ role: "user", content: "Hi" }],
    });
  });

  it("calls onError, not onDone, when the backend reports an SSE error event", async () => {
    mockFetchOnce({
      body: streamFromChunks([
        sseFrame({ type: "chunk", content: "Ro" }),
        sseFrame({ type: "error", message: "backend says this, but is ignored" }),
      ]),
    });

    const onDone = vi.fn();
    const onError = vi.fn();

    streamAssistantReply({
      messages: [{ role: "user", content: "Hi" }],
      onChunk: vi.fn(),
      onDone,
      onError,
    });

    await vi.waitFor(() => expect(onError).toHaveBeenCalledTimes(1));
    expect(onDone).not.toHaveBeenCalled();
    // No message argument — the caller owns its own static, translated
    // fallback text (see this module's own StreamAssistantReplyOptions
    // docstring); the server's own wording is never threaded through.
    expect(onError).toHaveBeenCalledWith();
  });

  it("calls onError when the HTTP response itself is not ok", async () => {
    mockFetchOnce({ ok: false, body: null });

    const onError = vi.fn();
    streamAssistantReply({
      messages: [{ role: "user", content: "Hi" }],
      onChunk: vi.fn(),
      onDone: vi.fn(),
      onError,
    });

    await vi.waitFor(() => expect(onError).toHaveBeenCalledTimes(1));
  });

  it("calls onDone with whatever text arrived if the stream closes with no explicit done/error event", async () => {
    mockFetchOnce({
      body: streamFromChunks([sseFrame({ type: "chunk", content: "Partial only" })]),
    });

    const onDone = vi.fn();
    streamAssistantReply({
      messages: [{ role: "user", content: "Hi" }],
      onChunk: vi.fn(),
      onDone,
      onError: vi.fn(),
    });

    await vi.waitFor(() => expect(onDone).toHaveBeenCalledTimes(1));
    expect(onDone).toHaveBeenCalledWith("Partial only");
  });

  it("skips an unparseable event instead of crashing the whole stream", async () => {
    mockFetchOnce({
      body: streamFromChunks([
        "data: {not valid json\n\n",
        sseFrame({ type: "chunk", content: "Still works" }),
        sseFrame({ type: "done" }),
      ]),
    });

    const onDone = vi.fn();
    const onError = vi.fn();
    streamAssistantReply({
      messages: [{ role: "user", content: "Hi" }],
      onChunk: vi.fn(),
      onDone,
      onError,
    });

    await vi.waitFor(() => expect(onDone).toHaveBeenCalledTimes(1));
    expect(onDone).toHaveBeenCalledWith("Still works");
    expect(onError).not.toHaveBeenCalled();
  });

  it("stop() aborts the request and never calls onError for the resulting abort", async () => {
    const encoder = new TextEncoder();
    let controllerRef: ReadableStreamDefaultController<Uint8Array> | undefined;
    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        controllerRef = controller;
        controller.enqueue(encoder.encode(sseFrame({ type: "chunk", content: "Ro" })));
        // Deliberately never closes — stop() must be what ends this.
      },
      cancel() {
        // A real fetch's body stream is cancelled when the request is
        // aborted — simulate that same outcome here.
        controllerRef = undefined;
      },
    });
    mockFetchOnce({ body });

    const onChunk = vi.fn();
    const onError = vi.fn();
    const onDone = vi.fn();
    const handle = streamAssistantReply({
      messages: [{ role: "user", content: "Hi" }],
      onChunk,
      onDone,
      onError,
    });

    await vi.waitFor(() => expect(onChunk).toHaveBeenCalledTimes(1));
    handle.stop();

    // Give the aborted read() a tick to reject/settle.
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(onError).not.toHaveBeenCalled();
    expect(onDone).not.toHaveBeenCalled();
  });
});
