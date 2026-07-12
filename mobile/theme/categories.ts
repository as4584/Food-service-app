/**
 * The 8 "food mood" categories that make up the spin wheel. `key` matches the
 * backend restaurant.category field so a landed slice maps to real restaurants.
 */
export interface WheelCategory {
  key: string;
  label: string;
  emoji: string;
  color: string;
}

export const WHEEL_CATEGORIES: WheelCategory[] = [
  { key: "pizza", label: "Pizza", emoji: "🍕", color: "#D62828" },
  { key: "tacos", label: "Tacos", emoji: "🌮", color: "#E58A2B" },
  { key: "seafood", label: "Seafood", emoji: "🦞", color: "#1C7C9C" },
  { key: "wings", label: "Wings", emoji: "🍗", color: "#E5A11B" },
  { key: "bbq", label: "BBQ", emoji: "🍖", color: "#8B3A2E" },
  { key: "sushi", label: "Sushi", emoji: "🍣", color: "#2FA86C" },
  { key: "deli", label: "Deli", emoji: "🥪", color: "#C8A96B" },
  { key: "dessert", label: "Dessert", emoji: "🍨", color: "#C86FA0" },
];

export const categoryByKey = (key: string | null | undefined) =>
  WHEEL_CATEGORIES.find((c) => c.key === key);
