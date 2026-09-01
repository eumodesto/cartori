import { digitsOnly } from "@/lib/utils";

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function isValidPhone(value: string): boolean {
  const digits = digitsOnly(value);
  return digits.length === 10 || digits.length === 11;
}

function checksumCpf(digits: string): boolean {
  if (digits.length !== 11 || /^(\d)\1+$/.test(digits)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i += 1) sum += Number(digits[i]) * (10 - i);
  let rest = (sum * 10) % 11;
  if (rest === 10) rest = 0;
  if (rest !== Number(digits[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i += 1) sum += Number(digits[i]) * (11 - i);
  rest = (sum * 10) % 11;
  if (rest === 10) rest = 0;
  return rest === Number(digits[10]);
}

function checksumCnpj(digits: string): boolean {
  if (digits.length !== 14 || /^(\d)\1+$/.test(digits)) return false;

  const calc = (base: string, weights: number[]) => {
    const total = base
      .split("")
      .reduce((acc, digit, index) => acc + Number(digit) * weights[index], 0);
    const rest = total % 11;
    return rest < 2 ? 0 : 11 - rest;
  };

  const w1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const w2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const d1 = calc(digits.slice(0, 12), w1);
  const d2 = calc(digits.slice(0, 12) + String(d1), w2);
  return d1 === Number(digits[12]) && d2 === Number(digits[13]);
}

export function isValidCpf(value: string): boolean {
  return checksumCpf(digitsOnly(value));
}

export function isValidCnpj(value: string): boolean {
  return checksumCnpj(digitsOnly(value));
}

export function isValidCpfCnpj(value: string): boolean {
  const digits = digitsOnly(value);
  if (digits.length === 11) return isValidCpf(value);
  if (digits.length === 14) return isValidCnpj(value);
  return false;
}

export function identificationType(value: string): "CPF" | "CNPJ" {
  return digitsOnly(value).length > 11 ? "CNPJ" : "CPF";
}
