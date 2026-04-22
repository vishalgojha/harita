export const categoryMeta = {
  EDA: { label: "Eco Design Approach", color: "bg-[var(--color-blue-light)] text-[var(--color-blue)] border-[var(--color-blue-light)]", dot: "bg-[var(--color-blue)]" },
  WC: { label: "Water Conservation", color: "bg-[var(--color-green-light)] text-[var(--color-green)] border-[var(--color-green-light)]", dot: "bg-[var(--color-green)]" },
  EE: { label: "Energy Efficiency", color: "bg-[var(--color-amber-light)] text-[var(--color-amber)] border-[var(--color-amber-light)]", dot: "bg-[var(--color-amber)]" },
  IM: { label: "Interior Materials", color: "bg-[var(--color-purple-light)] text-[var(--color-purple)] border-[var(--color-purple-light)]", dot: "bg-[var(--color-purple)]" },
  IE: { label: "Indoor Environment", color: "bg-[var(--color-red-light)] text-[var(--color-red)] border-[var(--color-red-light)]", dot: "bg-[var(--color-red)]" },
  IID: { label: "Innovation", color: "bg-[var(--color-olive-light)] text-[var(--color-olive)] border-[var(--color-olive-light)]", dot: "bg-[var(--color-olive)]" },
} as const;

export const creditStatuses = {
  pending: "border border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text-secondary)]",
  in_progress: "border border-[var(--color-blue-light)] bg-[var(--color-blue-light)] text-[var(--color-blue)]",
  blocked: "border border-[var(--color-red-light)] bg-[var(--color-red-light)] text-[var(--color-red)]",
  complete: "border border-[var(--color-green-light)] bg-[var(--color-green-light)] text-[var(--color-green)]",
} as const;

export const roleLabels = {
  owner: "Project Owner",
  consultant: "Consultant",
  admin: "Admin",
} as const;
