import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext(null);
const KEY = "excel_enquiry_cart";

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (item) => {
    setItems((prev) => {
      // unique key by product + size + type
      const key = `${item.product}|${item.size || ""}|${item.type || ""}`;
      if (prev.some((p) => `${p.product}|${p.size || ""}|${p.type || ""}` === key)) return prev;
      return [...prev, { uid: Date.now() + Math.random().toString(36).slice(2), quantity: "", ...item }];
    });
  };
  const removeItem = (uid) => setItems((prev) => prev.filter((p) => p.uid !== uid));
  const updateItem = (uid, patch) => setItems((prev) => prev.map((p) => (p.uid === uid ? { ...p, ...patch } : p)));
  const clear = () => setItems([]);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateItem, clear, count: items.length }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
