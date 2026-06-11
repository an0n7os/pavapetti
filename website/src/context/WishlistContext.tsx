import { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface WishlistItem {
  productId: number;
  name: string;
  price: number;
  imageUrl: string;
  categoryName?: string;
}

interface WishlistContextValue {
  items: WishlistItem[];
  count: number;
  addItem: (item: WishlistItem) => void;
  removeItem: (productId: number) => void;
  toggleItem: (item: WishlistItem) => void;
  isWishlisted: (productId: number) => boolean;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);
const KEY = "pavapetti-wishlist";

function load(): WishlistItem[] {
  try { return JSON.parse(localStorage.getItem(KEY) ?? "[]"); } catch { return []; }
}

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>(load);

  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(items)); }, [items]);

  const count = items.length;

  const addItem = useCallback((item: WishlistItem) => {
    setItems((prev) => prev.some((i) => i.productId === item.productId) ? prev : [...prev, item]);
  }, []);

  const removeItem = useCallback((productId: number) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const toggleItem = useCallback((item: WishlistItem) => {
    setItems((prev) =>
      prev.some((i) => i.productId === item.productId)
        ? prev.filter((i) => i.productId !== item.productId)
        : [...prev, item]
    );
  }, []);

  const isWishlisted = useCallback(
    (productId: number) => items.some((i) => i.productId === productId),
    [items]
  );

  return (
    <WishlistContext.Provider value={{ items, count, addItem, removeItem, toggleItem, isWishlisted }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
