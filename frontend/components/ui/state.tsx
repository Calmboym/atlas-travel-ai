import { type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface StateShellProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

function StateShell({
  icon,
  title,
  description,
  action,
  className,
}: StateShellProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 px-6 py-12 text-center",
        className,
      )}
    >
      {icon ? (
        <div className="text-text-muted" aria-hidden="true">
          {icon}
        </div>
      ) : null}
      <p className="text-lg font-semibold text-text-primary">{title}</p>
      {description ? (
        <p className="max-w-[420px] text-base leading-relaxed text-text-secondary">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}

/**
 * CONTENT_STRATEGY.md §Empty States structure: "What happened / Why it
 * matters / What to do next." `title` + `description` carry the first
 * two; `action` (a Button) carries the third. "Never dead ends" —
 * COMPONENT_INVENTORY.md §Common Rules echoes this for every empty
 * state, so `action` is intentionally not optional-feeling even though
 * it's a prop, not a required one at the type level (some empty states
 * genuinely have no action, e.g. read-only views).
 */
export function EmptyState(props: StateShellProps) {
  return <StateShell {...props} />;
}

/**
 * ACCESSIBILITY.md §Error Recovery + COPYWRITING_GUIDELINES.md §Error
 * Messages structure: "Problem / Reason (if known) / Recovery action."
 * Rendered as role="alert" — unlike EmptyState, an error state is
 * exactly the kind of thing ACCESSIBILITY.md's Live Regions guidance
 * says should interrupt (assertive), since it reflects something that
 * just went wrong, not routine, ambient page state.
 */
export function ErrorState({ className, ...rest }: StateShellProps) {
  return (
    <div role="alert">
      <StateShell {...rest} className={className} />
    </div>
  );
}
