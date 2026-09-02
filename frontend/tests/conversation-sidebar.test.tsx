import { describe, expect, it, vi } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import { renderWithProviders } from "@/tests/layout-test-utils";
import { ConversationSidebar } from "@/components/chat/conversation-sidebar";
import type { Conversation } from "@/lib/chat/types";

const conversations: Conversation[] = [
  { id: "conv-1", title: "Trip to Lisbon", messages: [], createdAt: "2026-01-01T00:00:00.000Z" },
  { id: "conv-2", title: null, messages: [], createdAt: "2026-01-02T00:00:00.000Z" },
];

describe("ConversationSidebar", () => {
  it("shows its heading by default", () => {
    renderWithProviders(
      <ConversationSidebar
        conversations={conversations}
        activeConversationId="conv-1"
        onSelect={vi.fn()}
        onNewChat={vi.fn()}
      />,
    );
    expect(screen.getByRole("heading", { name: "Conversations" })).toBeInTheDocument();
  });

  it("hides its heading when showHeading is false (SheetContent already renders one)", () => {
    renderWithProviders(
      <ConversationSidebar
        conversations={conversations}
        activeConversationId="conv-1"
        onSelect={vi.fn()}
        onNewChat={vi.fn()}
        showHeading={false}
      />,
    );
    expect(screen.queryByRole("heading", { name: "Conversations" })).not.toBeInTheDocument();
  });

  it("lists every conversation, falling back to a generic label when untitled", () => {
    renderWithProviders(
      <ConversationSidebar
        conversations={conversations}
        activeConversationId="conv-1"
        onSelect={vi.fn()}
        onNewChat={vi.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: "Trip to Lisbon" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "New conversation" })).toBeInTheDocument();
  });

  it("marks only the active conversation as current", () => {
    renderWithProviders(
      <ConversationSidebar
        conversations={conversations}
        activeConversationId="conv-1"
        onSelect={vi.fn()}
        onNewChat={vi.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: "Trip to Lisbon" })).toHaveAttribute(
      "aria-current",
      "true",
    );
    expect(screen.getByRole("button", { name: "New conversation" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("calls onSelect with the clicked conversation's id", () => {
    const onSelect = vi.fn();
    renderWithProviders(
      <ConversationSidebar
        conversations={conversations}
        activeConversationId="conv-1"
        onSelect={onSelect}
        onNewChat={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "New conversation" }));
    expect(onSelect).toHaveBeenCalledWith("conv-2");
  });

  it("calls onNewChat when the new-chat button is pressed", () => {
    const onNewChat = vi.fn();
    renderWithProviders(
      <ConversationSidebar
        conversations={conversations}
        activeConversationId="conv-1"
        onSelect={vi.fn()}
        onNewChat={onNewChat}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Start new chat" }));
    expect(onNewChat).toHaveBeenCalledOnce();
  });
});
