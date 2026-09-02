/**
 * WHY THIS FILE EXISTS (root cause, confirmed empirically before
 * writing this — not assumed): `next-intl/server`'s real
 * `getTranslations` throws unconditionally under Vitest —
 * `Error: \`getTranslations\` is not supported in Client Components.`
 * — because next-intl's package resolution picks its
 * `react-client` build whenever a browser-like (jsdom) environment is
 * detected, regardless of whether the *calling* component is actually
 * an async Server Component. This blocked every async Server
 * Component using this pattern (Footer, this task; AuthLayout,
 * AUTH-01 — which has no test file at all, apparently for this exact
 * unaddressed reason) from being unit-tested at all, with no way to
 * "await it into a resolved element first" — the failure happens
 * inside the function body itself, before anything async completes.
 *
 * This mock reproduces `getTranslations`'s real shape (`t(key,
 * values?)` / `t.raw(key)`, namespace-scoped, dot-path nested key
 * lookup) closely enough for component tests, reading directly from
 * the real `messages/en.json` rather than a hand-maintained fixture,
 * so translation-key typos still surface as test failures. English
 * only, matching `layout-test-utils.tsx`'s own default test locale —
 * this file does not attempt to replicate next-intl's real per-request
 * locale resolution, which has no equivalent in a Vitest environment
 * with no actual HTTP request.
 *
 * Aliased in `vitest.config.ts` (`resolve.alias`), same mechanism
 * already used for `next/navigation` → `tests/mocks/next-navigation.ts`
 * — not a `vi.mock()` call, because (as that file's own comment
 * explains) the failure happens while Vite statically pre-processes
 * next-intl's module graph, before a `vi.mock` registry would be
 * consulted.
 */
import enMessages from "@/messages/en.json";

type MessageTree = Record<string, unknown>;

function resolvePath(tree: unknown, path: string): unknown {
  return path
    .split(".")
    .reduce<unknown>(
      (node, segment) =>
        node && typeof node === "object"
          ? (node as MessageTree)[segment]
          : undefined,
      tree,
    );
}

function interpolate(
  template: string,
  values?: Record<string, string | number>,
): string {
  if (!values) return template;
  return Object.entries(values).reduce(
    (acc, [key, value]) => acc.replaceAll(`{${key}}`, String(value)),
    template,
  );
}

export interface MockTranslator {
  (key: string, values?: Record<string, string | number>): string;
  raw: (key: string) => unknown;
}

function createTranslator(scope: unknown): MockTranslator {
  const t = ((key: string, values?: Record<string, string | number>) => {
    const raw = resolvePath(scope, key);
    if (typeof raw !== "string") {
      throw new Error(
        `[next-intl-server mock] Missing or non-string message for key "${key}"`,
      );
    }
    return interpolate(raw, values);
  }) as MockTranslator;
  t.raw = (key: string) => resolvePath(scope, key);
  return t;
}

export async function getTranslations(
  namespace?: string,
): Promise<MockTranslator> {
  const scope = namespace
    ? resolvePath(enMessages as MessageTree, namespace)
    : enMessages;
  if (scope === undefined) {
    throw new Error(
      `[next-intl-server mock] Unknown namespace "${namespace}" — not present in messages/en.json`,
    );
  }
  return createTranslator(scope);
}

export async function getLocale(): Promise<string> {
  return "en";
}
