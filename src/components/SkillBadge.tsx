interface SkillBadgeProps {
  name: string;
}

export function SkillBadge({ name }: SkillBadgeProps) {
  return (
    <small className="inline-flex px-3 py-2 font-semibold text-white bg-accent border border-accent-dark rounded-[var(--radius-default)] text-sm transition-transform duration-200 hover:scale-105 cursor-default">
      {name}
    </small>
  );
}
