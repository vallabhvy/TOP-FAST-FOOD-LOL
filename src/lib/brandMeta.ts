export interface BrandVisualMeta {
  emoji: string;
  gradient: string;
  bgGlow: string;
  borderColor: string;
  nickName?: string;
}

export const BRAND_VISUALS: Record<string, BrandVisualMeta> = {
  mcdonalds: {
    emoji: "🍟",
    gradient: "from-yellow-500 to-red-600",
    bgGlow: "rgba(234, 179, 8, 0.15)",
    borderColor: "#eab308",
    nickName: "The Golden Arches",
  },
  "taco-bell": {
    emoji: "🌮",
    gradient: "from-purple-500 to-violet-700",
    bgGlow: "rgba(168, 85, 247, 0.15)",
    borderColor: "#a855f7",
    nickName: "Fourth Meal HQ",
  },
  wendys: {
    emoji: "🍔",
    gradient: "from-red-500 to-rose-700",
    bgGlow: "rgba(239, 68, 68, 0.15)",
    borderColor: "#ef4444",
    nickName: "Fresh Never Frozen",
  },
  "in-n-out": {
    emoji: "🌴",
    gradient: "from-amber-400 to-red-600",
    bgGlow: "rgba(245, 158, 11, 0.15)",
    borderColor: "#f59e0b",
    nickName: "Animal Style",
  },
  "chick-fil-a": {
    emoji: "🐔",
    gradient: "from-red-600 to-rose-800",
    bgGlow: "rgba(225, 29, 72, 0.15)",
    borderColor: "#e11d48",
    nickName: "My Pleasure",
  },
  popeyes: {
    emoji: "🍗",
    gradient: "from-orange-500 to-amber-700",
    bgGlow: "rgba(249, 115, 22, 0.15)",
    borderColor: "#f97316",
    nickName: "Louisiana Fast",
  },
  "five-guys": {
    emoji: "🥜",
    gradient: "from-red-600 to-zinc-800",
    bgGlow: "rgba(220, 38, 38, 0.15)",
    borderColor: "#dc2626",
    nickName: "Extra Fries in the Bag",
  },
  "burger-king": {
    emoji: "👑",
    gradient: "from-amber-500 to-red-700",
    bgGlow: "rgba(245, 158, 11, 0.15)",
    borderColor: "#f59e0b",
    nickName: "Home of the Whopper",
  },
  "raising-canes": {
    emoji: "🥖",
    gradient: "from-amber-600 to-yellow-500",
    bgGlow: "rgba(217, 119, 6, 0.15)",
    borderColor: "#d97706",
    nickName: "Cane's Sauce Central",
  },
  culvers: {
    emoji: "🍦",
    gradient: "from-blue-500 to-cyan-600",
    bgGlow: "rgba(59, 130, 246, 0.15)",
    borderColor: "#3b82f6",
    nickName: "ButterBurgers & Custard",
  },
  "panda-express": {
    emoji: "🥡",
    gradient: "from-red-600 to-amber-600",
    bgGlow: "rgba(220, 38, 38, 0.15)",
    borderColor: "#dc2626",
    nickName: "Orange Chicken Depot",
  },
  subway: {
    emoji: "🥖",
    gradient: "from-emerald-500 to-yellow-500",
    bgGlow: "rgba(16, 185, 129, 0.15)",
    borderColor: "#10b981",
    nickName: "Eat Fresh",
  },
  arbys: {
    emoji: "🥩",
    gradient: "from-rose-600 to-red-800",
    bgGlow: "rgba(225, 29, 72, 0.15)",
    borderColor: "#e11d48",
    nickName: "We Have The Meats",
  },
  sonic: {
    emoji: "🥤",
    gradient: "from-blue-600 to-red-500",
    bgGlow: "rgba(37, 99, 235, 0.15)",
    borderColor: "#2563eb",
    nickName: "America's Drive-In",
  },
  "white-castle": {
    emoji: "🏰",
    gradient: "from-blue-500 to-indigo-700",
    bgGlow: "rgba(99, 102, 241, 0.15)",
    borderColor: "#6366f1",
    nickName: "The Crave",
  },
  dominos: {
    emoji: "🍕",
    gradient: "from-blue-600 to-red-600",
    bgGlow: "rgba(37, 99, 235, 0.15)",
    borderColor: "#2563eb",
    nickName: "30 Mins or Less",
  },
  "pizza-hut": {
    emoji: "🍕",
    gradient: "from-red-600 to-yellow-600",
    bgGlow: "rgba(220, 38, 38, 0.15)",
    borderColor: "#dc2626",
    nickName: "No One OutPizzas The Hut",
  },
  chipotle: {
    emoji: "🌯",
    gradient: "from-amber-700 to-red-800",
    bgGlow: "rgba(180, 83, 9, 0.15)",
    borderColor: "#b45309",
    nickName: "Guac is Extra",
  },
  starbucks: {
    emoji: "☕",
    gradient: "from-emerald-600 to-teal-800",
    bgGlow: "rgba(5, 150, 105, 0.15)",
    borderColor: "#059669",
    nickName: "Liquid Caffeine",
  },
  dunkin: {
    emoji: "🍩",
    gradient: "from-pink-500 to-amber-500",
    bgGlow: "rgba(236, 72, 153, 0.15)",
    borderColor: "#ec4899",
    nickName: "America Runs on Dunkin",
  },
  "shake-shack": {
    emoji: "🍔",
    gradient: "from-emerald-500 to-green-700",
    bgGlow: "rgba(16, 185, 129, 0.15)",
    borderColor: "#10b981",
    nickName: "ShackBurger Central",
  },
  whataburger: {
    emoji: "🍔",
    gradient: "from-orange-500 to-amber-600",
    bgGlow: "rgba(249, 115, 22, 0.15)",
    borderColor: "#f97316",
    nickName: "Just Like You Like It",
  },
  wingstop: {
    emoji: "🍗",
    gradient: "from-emerald-600 to-teal-700",
    bgGlow: "rgba(5, 150, 105, 0.15)",
    borderColor: "#059669",
    nickName: "The Wing Experts",
  },
  kfc: {
    emoji: "🍗",
    gradient: "from-red-600 to-rose-700",
    bgGlow: "rgba(225, 29, 72, 0.15)",
    borderColor: "#e11d48",
    nickName: "Finger Lickin' Good",
  },
  "dairy-queen": {
    emoji: "🍦",
    gradient: "from-blue-500 to-red-500",
    bgGlow: "rgba(59, 130, 246, 0.15)",
    borderColor: "#3b82f6",
    nickName: "Blizzard Territory",
  },
};

export function getBrandVisual(brandId: string, category: string = "Burgers"): BrandVisualMeta {
  const normalizedId = brandId.toLowerCase().replace(/[^a-z0-9-]/g, "");
  
  // Direct match
  if (BRAND_VISUALS[normalizedId]) {
    return BRAND_VISUALS[normalizedId];
  }

  // Partial match
  for (const [key, visual] of Object.entries(BRAND_VISUALS)) {
    if (normalizedId.includes(key) || key.includes(normalizedId)) {
      return visual;
    }
  }

  // Fallback by category
  switch (category.toLowerCase()) {
    case "pizza":
      return { emoji: "🍕", gradient: "from-red-500 to-amber-600", bgGlow: "rgba(239, 68, 68, 0.15)", borderColor: "#ef4444" };
    case "chicken":
      return { emoji: "🍗", gradient: "from-amber-500 to-orange-600", bgGlow: "rgba(245, 158, 11, 0.15)", borderColor: "#f59e0b" };
    case "mexican":
      return { emoji: "🌮", gradient: "from-purple-500 to-pink-600", bgGlow: "rgba(168, 85, 247, 0.15)", borderColor: "#a855f7" };
    case "sandwiches":
      return { emoji: "🥪", gradient: "from-emerald-500 to-teal-600", bgGlow: "rgba(16, 185, 129, 0.15)", borderColor: "#10b981" };
    case "dessert":
      return { emoji: "🍦", gradient: "from-pink-500 to-rose-600", bgGlow: "rgba(236, 72, 153, 0.15)", borderColor: "#ec4899" };
    case "late night":
      return { emoji: "🍟", gradient: "from-violet-500 to-indigo-700", bgGlow: "rgba(139, 92, 246, 0.15)", borderColor: "#8b5cf6" };
    default:
      return { emoji: "🍔", gradient: "from-amber-500 to-red-600", bgGlow: "rgba(245, 158, 11, 0.15)", borderColor: "#f59e0b" };
  }
}
