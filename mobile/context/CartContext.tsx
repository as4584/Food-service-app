import { createContext, useContext, useMemo, useState, ReactNode } from "react";
import type { MenuItem } from "../services/api";

export interface CartLine {
  menuItem: MenuItem;
  quantity: number;
}

export interface RestaurantCoords {
  lat: number | null;
  lng: number | null;
}

interface CartState {
  restaurantId: string | null;
  restaurantName: string | null;
  restaurantCoords: RestaurantCoords | null;
  lines: CartLine[];
  addItem: (
    restaurantId: string,
    restaurantName: string,
    item: MenuItem,
    coords?: RestaurantCoords
  ) => void;
  removeItem: (menuItemId: string) => void;
  setQuantity: (menuItemId: string, quantity: number) => void;
  clearCart: () => void;
  subtotal: number;
  itemCount: number;
}

const CartContext = createContext<CartState | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [restaurantName, setRestaurantName] = useState<string | null>(null);
  const [restaurantCoords, setRestaurantCoords] = useState<RestaurantCoords | null>(null);
  const [lines, setLines] = useState<CartLine[]>([]);

  const addItem = (rId: string, rName: string, item: MenuItem, coords?: RestaurantCoords) => {
    if (restaurantId && restaurantId !== rId) {
      setLines([]);
    }
    setRestaurantId(rId);
    setRestaurantName(rName);
    setRestaurantCoords(coords ?? null);
    setLines((prev) => {
      const base = restaurantId && restaurantId !== rId ? [] : prev;
      const existing = base.find((l) => l.menuItem.id === item.id);
      if (existing) {
        return base.map((l) =>
          l.menuItem.id === item.id ? { ...l, quantity: l.quantity + 1 } : l
        );
      }
      return [...base, { menuItem: item, quantity: 1 }];
    });
  };

  const removeItem = (menuItemId: string) =>
    setLines((prev) => prev.filter((l) => l.menuItem.id !== menuItemId));

  const setQuantity = (menuItemId: string, quantity: number) =>
    setLines((prev) =>
      quantity <= 0
        ? prev.filter((l) => l.menuItem.id !== menuItemId)
        : prev.map((l) => (l.menuItem.id === menuItemId ? { ...l, quantity } : l))
    );

  const clearCart = () => {
    setLines([]);
    setRestaurantId(null);
    setRestaurantName(null);
    setRestaurantCoords(null);
  };

  const subtotal = useMemo(
    () => lines.reduce((sum, l) => sum + Number(l.menuItem.price) * l.quantity, 0),
    [lines]
  );
  const itemCount = useMemo(() => lines.reduce((sum, l) => sum + l.quantity, 0), [lines]);

  return (
    <CartContext.Provider
      value={{
        restaurantId,
        restaurantName,
        restaurantCoords,
        lines,
        addItem,
        removeItem,
        setQuantity,
        clearCart,
        subtotal,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
