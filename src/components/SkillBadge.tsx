interface SkillBadgeProps {
  name: string;
}

export function SkillBadge({ name }: SkillBadgeProps) {
  return (
    <small className="inline-flex items-center px-2.5 py-1 text-xs font-medium text-[var(--color-text-primary)] bg-[var(--color-bg-secondary)] border border-[var(--color-bg-tertiary)]/70 hover:border-accent hover:text-accent rounded-md transition-all duration-200 cursor-default select-none shadow-xs">
      {name}
    </small>
  );
}
