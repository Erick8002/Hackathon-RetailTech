export type Product = {
  id: string;
  name: string;
  price: number;
  qty: number;
  emoji: string;
  photo?: string; // base64 encoded image
};

export type LedgerEntry = {
  id: string;
  date: string; // ISO
  description: string;
  amount: number; // positive = compra (aumenta dívida), negative = pagamento
};

export type Client = {
  id: string;
  name: string;
  phone: string; // digits with country code, e.g. 5511987654321
  purchases: number;
  debt: number;
  overdueDays: number;
  ledger: LedgerEntry[];
};

export const seedProducts: Product[] = [
  { id: "p1", name: "Café Tradicional 500g", price: 18.9, qty: 12, emoji: "☕" },
  { id: "p2", name: "Arroz Agulhinha 5kg", price: 27.5, qty: 4, emoji: "🍚" },
  { id: "p3", name: "Feijão Carioca 1kg", price: 9.9, qty: 20, emoji: "🫘" },
  { id: "p4", name: "Óleo de Soja 900ml", price: 8.9, qty: 3, emoji: "🛢️" },
  { id: "p5", name: "Açúcar Refinado 1kg", price: 5.5, qty: 15, emoji: "🍬" },
  { id: "p6", name: "Farinha de Trigo 1kg", price: 6.2, qty: 2, emoji: "🌾" },
  { id: "p7", name: "Detergente 500ml", price: 2.5, qty: 30, emoji: "🧴" },
  { id: "p8", name: "Refrigerante 2L", price: 9.5, qty: 8, emoji: "🥤" },
];

const today = new Date();
const daysAgo = (d: number) => new Date(today.getTime() - d * 86400000).toISOString();

export const seedClients: Client[] = [
  {
    id: "c1",
    name: "Dona Maria da Silva",
    phone: "5511987650001",
    purchases: 24,
    debt: 120,
    overdueDays: 32,
    ledger: [
      { id: "e1", date: daysAgo(32), description: "Compra no balcão", amount: 80 },
      { id: "e2", date: daysAgo(20), description: "Compra no balcão", amount: 60 },
      { id: "e3", date: daysAgo(10), description: "Pagamento parcial", amount: -20 },
    ],
  },
  {
    id: "c2",
    name: "Seu Manoel Pereira",
    phone: "5511987650002",
    purchases: 14,
    debt: 0,
    overdueDays: 0,
    ledger: [
      { id: "e4", date: daysAgo(45), description: "Compra no balcão", amount: 50 },
      { id: "e5", date: daysAgo(40), description: "Pagamento total", amount: -50 },
    ],
  },
  {
    id: "c3",
    name: "Sebastião Oliveira",
    phone: "5511987650003",
    purchases: 18,
    debt: 180,
    overdueDays: 45,
    ledger: [
      { id: "e6", date: daysAgo(45), description: "Compra no balcão", amount: 120 },
      { id: "e7", date: daysAgo(15), description: "Compra no balcão", amount: 60 },
    ],
  },
  {
    id: "c4",
    name: "Tiago Souza",
    phone: "5511987650004",
    purchases: 2,
    debt: 0,
    overdueDays: 0,
    ledger: [{ id: "e8", date: daysAgo(3), description: "Compra à vista", amount: 0 }],
  },
  {
    id: "c5",
    name: "Ana Beatriz Lima",
    phone: "5511987650005",
    purchases: 9,
    debt: 45,
    overdueDays: 40,
    ledger: [{ id: "e9", date: daysAgo(40), description: "Compra no balcão", amount: 45 }],
  },
  {
    id: "c6",
    name: "Carlos Eduardo",
    phone: "5511987650006",
    purchases: 7,
    debt: 0,
    overdueDays: 0,
    ledger: [],
  },
  {
    id: "c7",
    name: "Juliana Ferreira",
    phone: "5511987650007",
    purchases: 3,
    debt: 0,
    overdueDays: 0,
    ledger: [],
  },
];

// Cash box do dia (bate com a UI da Home)
export const seedCashToday = 450;
export const seedReceivable = seedClients.reduce((s, c) => s + c.debt, 0);