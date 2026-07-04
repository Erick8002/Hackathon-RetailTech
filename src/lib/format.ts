export const brl = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

export const onlyDigits = (s: string) => s.replace(/\D/g, "");
