import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/ledger/PageHeader";
import { PhotoUpload } from "@/components/PhotoUpload";
import { useApp } from "@/store/app-store";

const EMOJIS = ["📦", "🍞", "🥫", "🧃", "🧂", "🍫", "🧻", "🍿", "🥛", "🍺"];

export const Route = createFileRoute("/_app/estoque/novo")({
  component: NovoProduto,
});

function NovoProduto() {
  const addProduct = useApp((s) => s.addProduct);
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [qty, setQty] = useState("");
  const [photo, setPhoto] = useState<string>("");

  const handlePhotoCapture = (base64: string) => {
    setPhoto(base64);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const parsedPrice = parseFloat(price.replace(",", "."));
    const parsedQty = parseInt(qty, 10);
    if (!name.trim() || !parsedPrice || !parsedQty) {
      toast.error("Preencha nome, preço e quantidade.");
      return;
    }
    addProduct({
      name: name.trim(),
      price: parsedPrice,
      qty: parsedQty,
      emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
      photo: photo || undefined,
    });
    toast.success(`${name.trim()} cadastrado no estoque.`);
    navigate({ to: "/estoque" });
  };

  return (
    <div>
      <PageHeader title="Novo Produto" subtitle="Cadastro rápido" back="/estoque" />

      <form onSubmit={submit} className="animate-entry space-y-4">
        <PhotoUpload 
          onPhotoCapture={handlePhotoCapture}
          hasPhoto={!!photo}
          photoPreview={photo}
        />

        <label className="block">
          <span className="mb-1.5 block font-mono text-[11px] font-bold uppercase tracking-widest text-ink/60">
            Nome / Descrição
          </span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Biscoito de polvilho 100g"
            className="h-14 w-full rounded-xl border-2 border-ink/10 bg-white px-4 text-base font-medium outline-none focus:border-ink"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block font-mono text-[11px] font-bold uppercase tracking-widest text-ink/60">
            Preço de Venda (R$)
          </span>
          <input
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0,00"
            inputMode="decimal"
            className="h-14 w-full rounded-xl border-2 border-ink/10 bg-white px-4 text-base font-medium outline-none focus:border-ink"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block font-mono text-[11px] font-bold uppercase tracking-widest text-ink/60">
            Quantidade Inicial
          </span>
          <input
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            placeholder="0"
            inputMode="numeric"
            className="h-14 w-full rounded-xl border-2 border-ink/10 bg-white px-4 text-base font-medium outline-none focus:border-ink"
          />
        </label>

        <button
          type="submit"
          className="flex h-16 w-full items-center justify-center rounded-2xl bg-ledger-green font-black uppercase tracking-tight text-white active:scale-[0.98]"
        >
          Cadastrar Produto
        </button>
      </form>
    </div>
  );
}