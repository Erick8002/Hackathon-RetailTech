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

type User = {
  email: string;
  password: string;
};

type State = {
  isAuthed: boolean;
  userEmail: string | null;
  users: User[];

  products: Product[];
  clients: Client[];

  cashToday: number;
  salesCount: number;

  cart: CartItem[];
  selectedClientId: string | null;
  cadernetaUnlocked: boolean;

  // auth
  login: (email: string, password: string) => { success: boolean; error?: string };
  register: (email: string, password: string, confirmPassword: string) => { success: boolean; error?: string };
  logout: () => void;

  // cart
  addToCart: (productId: string) => void;
  setQty: (productId: string, qty: number) => void;
  clearCart: () => void;
  cartTotal: () => number;

  // clients
  selectClient: (id: string | null) => void;
  receivePayment: (clientId: string, amount: number) => void;
  addClient: (name: string, phone: string, cpf: string) => void;

  // sale
  finalizeSale: (method: PaymentMethod) => void;

  // products
  addProduct: (p: Omit<Product, "id">) => void;

  setCadernetaUnlocked: (unlocked: boolean) => void;
};

const nid = () => Math.random().toString(36).slice(2, 10);

const loadAuthState = () => {
  if (typeof window === "undefined") return { isAuthed: false, userEmail: null, users: [] };
  
  try {
    const saved = localStorage.getItem("aesgp_auth");
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        isAuthed: parsed.isAuthed || false,
        userEmail: parsed.userEmail || null,
        users: parsed.users || [],
      };
    }
  } catch (e) {
    console.error("Erro ao carregar auth:", e);
  }
  
  return { isAuthed: false, userEmail: null, users: [] };
};

const saveAuthState = (state: { isAuthed: boolean; userEmail: string | null; users: User[] }) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("aesgp_auth", JSON.stringify(state));
  }
};

export const useApp = create<State>((set, get) => {
  const initialAuth = loadAuthState();
  
  return {
    isAuthed: initialAuth.isAuthed,
    userEmail: initialAuth.userEmail,
    users: initialAuth.users,
    products: seedProducts,
    clients: seedClients,
    cashToday: seedCashToday,
    salesCount: 12,
    cart: [],
    selectedClientId: null,
    cadernetaUnlocked: false,

    login: (email, password) => {
      const user = get().users.find((u) => u.email === email);
      if (!user) {
        return { success: false, error: "Email não encontrado" };
      }
      if (user.password !== password) {
        return { success: false, error: "Senha incorreta" };
      }
      const newState = { isAuthed: true, userEmail: email, users: get().users };
      set(newState);
      saveAuthState(newState);
      return { success: true };
    },

    register: (email, password, confirmPassword) => {
      if (!email.trim()) {
        return { success: false, error: "Email é obrigatório" };
      }
      if (!email.includes("@")) {
        return { success: false, error: "Email inválido" };
      }
      if (password.length < 6) {
        return { success: false, error: "Senha deve ter no mínimo 6 caracteres" };
      }
      if (password !== confirmPassword) {
        return { success: false, error: "Senhas não correspondem" };
      }
      if (get().users.some((u) => u.email === email)) {
        return { success: false, error: "Email já cadastrado" };
      }
      const newUsers = [...get().users, { email, password }];
      const newState = {
        users: newUsers,
        isAuthed: true,
        userEmail: email,
      };
      set(newState);
      saveAuthState(newState);
      return { success: true };
    },

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
    clearCart: () => set({ cart: [], selectedClientId: null, cadernetaUnlocked: false }),
    cartTotal: () => {
      const products = get().products;
      return get().cart.reduce((sum, item) => {
        const p = products.find((x) => x.id === item.productId);
        return sum + (p ? p.price * item.qty : 0);
      }, 0);
    },

    selectClient: (id) => set({ selectedClientId: id, cadernetaUnlocked: false }),

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

    addClient: (name, phone, cpf) =>
      set({
        clients: [
          ...get().clients,
          {
            id: nid(),
            name,
            phone,
            cpf,
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
      set({ cart: [], selectedClientId: null, cadernetaUnlocked: false });
    },

    addProduct: (p) => set({ products: [...get().products, { ...p, id: nid() }] }),

    setCadernetaUnlocked: (unlocked) => set({ cadernetaUnlocked: unlocked }),
  };
});

// Funções utilitárias globais
export const receivableTotal = (clients: Client[]) =>
  clients.reduce((s, c) => s + c.debt, 0);

export const overdueClients = (clients: Client[]) =>
  clients.filter((c) => c.debt > 0);