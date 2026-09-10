import { z } from "zod";

export const moneyInputSchema = z.object({
  description: z.string().trim().min(1).max(300),
  quantity: z.coerce.number().int().min(1).max(10_000),
  unitAmountMinor: z.coerce.number().int().min(0).max(1_000_000_000),
});

export type MoneyItem = z.infer<typeof moneyInputSchema>;

export function calculateQuoteTotal(items: MoneyItem[]) {
  return items.reduce((total, item) => {
    const line = BigInt(item.quantity) * BigInt(item.unitAmountMinor);
    const next = BigInt(total) + line;
    if (next > BigInt(Number.MAX_SAFE_INTEGER)) throw new Error("Quote total exceeds safe limit");
    return Number(next);
  }, 0);
}

export function formatMoney(amountMinor: number, currency: string) {
  return new Intl.NumberFormat("en", { style: "currency", currency }).format(amountMinor / 100);
}
