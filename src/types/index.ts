export interface FastFoodBrand {
  id: string;
  name: string;
  alias?: string;
  category: "Burgers" | "Chicken" | "Mexican" | "Sandwiches" | "Late Night";
  totalScore: number;
  totalBoosts: number;
  totalSabotages: number;
  currentSlogan: string;
  sloganAuthor: string;
  authorAvatar?: string;
  location?: string;
  updatedAt: string;
  clicks: number;
  accentColor: string;
  status?: "approved" | "hidden";
}

export type ActionType = "BOOST" | "SABOTAGE";

export interface Transaction {
  id: string;
  brandId: string;
  brandName: string;
  actionType: ActionType;
  amount: number;
  message: string;
  author: string;
  authorAvatar?: string;
  location?: string;
  timestamp: string;
  receiptNumber: string;
  replyToAuthor?: string;
  status?: "approved" | "hidden";
}

export type CRTColorTheme = "green" | "amber";
