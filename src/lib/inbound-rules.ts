import { emailError, phoneError } from "./auth-rules";
import { PIECE_TYPES, FINISHES, BUDGETS } from "./custom-request";

type Validators = Record<string, (value: string) => string | null>;

/** Nome com letras (incluindo acentos em português), espaços, ponto, apóstrofo e hífen. */
export const PERSON_NAME_RE = /^\p{L}[\p{L}\p{M} .'-]*$/u;

export function personNameError(value: string): string | null {
  const v = value.trim();
  if (!v) return "Informe seu nome";
  if (!PERSON_NAME_RE.test(v)) return /\s{2,}/.test(v) ? "Use apenas um espaço entre palavras" : "Use apenas letras";
  const letters = v.replace(/\s+/g, "").length;
  if (letters < 2) return "O nome precisa ter pelo menos 2 letras";
  if (letters > 60) return "O nome pode ter no máximo 60 letras";
  return null;
}

const oneOf = (options: readonly string[], message: string) => (v: string) => (options.includes(v) ? null : message);
const optional = (rule: (v: string) => string | null) => (v: string) => (v.trim() ? rule(v) : null);
const maxLen = (n: number, message: string) => (v: string) => (v.trim().length > n ? message : null);
const textBetween = (min: number, max: number, short: string) => (v: string) => {
  const t = v.trim();
  if (t.length < min) return short;
  if (t.length > max) return `Máximo de ${max.toLocaleString("pt-BR")} caracteres`;
  return null;
};

export const CUSTOM_VALIDATORS: Validators = {
  name: personNameError,
  email: emailError,
  phone: phoneError,
  pieceType: oneOf(PIECE_TYPES, "Escolha o que você precisa"),
  finish: oneOf(FINISHES, "Escolha um acabamento"),
  budget: oneOf(BUDGETS, "Escolha uma faixa de orçamento"),
  neededBy: maxLen(60, "Máximo de 60 caracteres"),
  details: textBetween(10, 3000, "Conte um pouco sobre seu pedido (pelo menos uma frase)"),
};

export const CONTACT_VALIDATORS: Validators = {
  name: personNameError,
  email: emailError,
  phone: optional(phoneError),
  subject: maxLen(200, "Máximo de 200 caracteres"),
  message: textBetween(5, 5000, "Escreva uma mensagem breve (pelo menos 5 caracteres)"),
};

export function checkFields(rules: Validators, values: Record<string, string>) {
  const fields = Object.keys(rules).filter((k) => rules[k](values[k] ?? ""));
  return fields.length ? { fields, error: rules[fields[0]](values[fields[0]] ?? "")! } : null;
}
