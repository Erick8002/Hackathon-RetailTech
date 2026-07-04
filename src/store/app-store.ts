import { create } from "zustand";
import {
  seedProducts,
  seedClients,
  seedCashToday,
  type Product,
  type Client,
  type LedgerEntry,
} from "@/lib/seed-data";

export type CartItem = { productId: string; qty: number };
export type PaymentMethod = "dinheiro" | "pix" | "cartao" | "caderneta";

type State = {
  isAuthed: boolean;
  userEmail: string | null;

  products: Product[];
  clients: Client[];

  cashToday: number;
  salesCount: number;

  cart: CartItem[];
  selectedClientId: string | null;

  // auth
  login: (email: string) => void;
  logout: () => void;

  // cart
  addToCart: (productId: string) => void;
  setQty: (productId: string, qty: number) => void;
  clearCart: () => void;
  cartTotal: () => number;

  // clients
  selectClient: (id: string | null) => void;
  receivePayment: (clientId: string, amount: number) => void;
  addClient: (name: string, phone: string) => void;

  // sale
  finalizeSale: (method: PaymentMethod) => void;

  // products
  addProduct: (p: Omit<Product, "id">) => void;
};

const nid = () => Math.random().toString(36).slice(2, 10);

export const useApp = create<State>((set, get) => ({
  isAuthed: false,
  userEmail: null,
  products: seedProducts,
  clients: seedClients,
  cashToday: seedCashToday,
  salesCount: 12,
  cart: [],
  selectedClientId: null,

  login: (email) => set({ isAuthed: true, userEmail: email }),
  logout: () => set({ isAuthed: false, userEmail: null }),

  addToCart: (productId) => {
    const existing = get().cart.find((c) => c.productId === productId);
    if (existing) {
      set({
        cart: get().cart.map((c) =>
          c.productId === productId ? { ...c, qty: c.qty + 1 } : c,
        ),
      });
    } else {
      set({ cart: [...get().cart, { productId, qty: 1 }] });
    }
  },
  setQty: (productId, qty) => {
    if (qty <= 0) {
      set({ cart: get().cart.filter((c) => c.productId !== productId) });
    } else {
      const existing = get().cart.find((c) => c.productId === productId);
      if (existing) {
        set({
          cart: get().cart.map((c) => (c.productId === productId ? { ...c, qty } : c)),
        });
      } else {
        set({ cart: [...get().cart, { productId, qty }] });
      }
    }
  },
  clearCart: () => set({ cart: [], selectedClientId: null }),
  cartTotal: () => {
    const products = get().products;
    return get().cart.reduce((sum, item) => {
      const p = products.find((x) => x.id === item.productId);
      return sum + (p ? p.price * item.qty : 0);
    }, 0);
  },

  selectClient: (id) => set({ selectedClientId: id }),

  receivePayment: (clientId, amount) => {
    set({
      cashToday: get().cashToday + amount,
      clients: get().clients.map((c) => {
        if (c.id !== clientId) return c;
        const newDebt = Math.max(0, c.debt - amount);
        const entry: LedgerEntry = {
          id: nid(),
          date: new Date().toISOString(),
          description: "Pagamento recebido",
          amount: -amount,
        };
        return {
          ...c,
          debt: newDebt,
          overdueDays: newDebt === 0 ? 0 : c.overdueDays,
          ledger: [entry, ...c.ledger],
        };
      }),
    });
  },

  addClient: (name, phone) =>
    set({
      clients: [
        ...get().clients,
        {
          id: nid(),
          name,
          phone,
          debt: 0,
          overdueDays: 0,
          purchases: 0,
          ledger: [],
        },
      ],
    }),

  finalizeSale: (method) => {
    const total = get().cartTotal();
    const cart = get().cart;
    const clientId = get().selectedClientId;

    // baixar estoque
    set({
      products: get().products.map((p) => {
        const item = cart.find((c) => c.productId === p.id);
        return item ? { ...p, qty: Math.max(0, p.qty - item.qty) } : p;
      }),
      salesCount: get().salesCount + 1,
    });

    if (method === "caderneta" && clientId) {
      set({
        clients: get().clients.map((c) => {
          if (c.id !== clientId) return c;
          const entry: LedgerEntry = {
            id: nid(),
            date: new Date().toISOString(),
            description: "Compra no balcão",
            amount: total,
          };
          return {
            ...c,
            debt: c.debt + total,
            purchases: c.purchases + 1,
            ledger: [entry, ...c.ledger],
          };
        }),
      });
    } else {
      set({ cashToday: get().cashToday + total });
      if (clientId) {
        set({
          clients: get().clients.map((c) =>
            c.id === clientId ? { ...c, purchases: c.purchases + 1 } : c,
          ),
        });
      }
    }
    set({ cart: [], selectedClientId: null });
  },

  addProduct: (p) => set({ products: [...get().products, { ...p, id: nid() }] }),
}));

export const receivableTotal = (clients: Client[]) =>
  clients.reduce((s, c) => s + c.debt, 0);

export const overdueClients = (clients: Client[]) =>
  clients.filter((c) => c.overdueDays > 15);