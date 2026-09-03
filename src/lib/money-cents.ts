import { Prisma } from "@prisma/client";

export function moneyToCents(value: Prisma.Decimal | number | string): number {
  const normalized = new Prisma.Decimal(value).toFixed(2);
  return new Prisma.Decimal(normalized).mul(100).toNumber();
}

export function chargeAmountNumber(value: Prisma.Decimal | number | string): number {
  return Number(new Prisma.Decimal(value).toFixed(2));
}
