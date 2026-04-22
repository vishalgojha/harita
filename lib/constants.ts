export const categoryMeta = {
  EDA: { label: "Eco Design Approach", color: "bg-category-eda/15 text-category-eda" },
  WC: { label: "Water Conservation", color: "bg-category-wc/15 text-category-wc" },
  EE: { label: "Energy Efficiency", color: "bg-category-ee/15 text-category-ee" },
  IM: { label: "Interior Materials", color: "bg-category-im/15 text-category-im" },
  IE: { label: "Indoor Environment", color: "bg-category-ie/15 text-category-ie" },
  IID: { label: "Innovation", color: "bg-category-iid/15 text-category-iid" },
} as const;

export const creditStatuses = {
  pending: "bg-slate-200 text-slate-700",
  in_progress: "bg-sky-100 text-sky-700",
  blocked: "bg-rose-100 text-rose-700",
  complete: "bg-emerald-100 text-emerald-700",
} as const;

export const roleLabels = {
  owner: "Project Owner",
  consultant: "Consultant",
  admin: "Admin",
} as const;
