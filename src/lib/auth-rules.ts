// Regras de validação compartilhadas entre formulários e server actions.

export const MIN_PASSWORD = 8;

export const EMAIL_RE =
  /^[a-z0-9_%+-]+(?:\.[a-z0-9_%+-]+)*@(?:[a-z](?:[a-z-]{0,61}[a-z])?\.)+[a-z]{2,24}$/i;

const GENERIC_TLDS = new Set(
  "com net org edu gov mil int info biz name pro mobi asia aero coop jobs travel io co app dev me tv cc ai xyz online site store shop tech cloud live email digital agency studio design media news blog website space world life today company services solutions group global network systems academy center consulting".split(" ")
);
const TLD_TYPOS = new Set(["co", "cm", "om", "con", "cmo", "ocm", "comm", "coom", "vom", "xom", "cpm", "clm", "cim", "comn", "coml", "net1"]);

const PROVIDERS = [
  "gmail.com", "googlemail.com", "yahoo.com", "ymail.com", "rocketmail.com", "hotmail.com", "outlook.com",
  "live.com", "msn.com", "icloud.com", "me.com", "aol.com", "protonmail.com", "proton.me", "mail.com", "zoho.com",
  "email.com", "gmx.com", "yandex.com", "uol.com.br", "bol.com.br", "terra.com.br",
];

function editDistance(a: string, b: string): number {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++) {
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
    }
  return d[a.length][b.length];
}

export function emailSuggestion(value: string): string | null {
  const v = value.trim().toLowerCase();
  const at = v.lastIndexOf("@");
  if (at < 1) return null;
  const domain = v.slice(at + 1);
  if (!domain || PROVIDERS.includes(domain)) return null;
  const sld = domain.split(".")[0];
  const tld = domain.slice(sld.length + 1);
  let best: string | null = null;
  let bestScore = Infinity;
  for (const p of PROVIDERS) {
    const pSld = p.split(".")[0];
    if (sld === pSld && tld !== p.slice(pSld.length + 1) && (TLD_TYPOS.has(tld) || tld.startsWith("com") || tld === "")) return v.slice(0, at + 1) + p;
    if (pSld.length >= 5 && sld.length >= 4 && (tld === p.slice(pSld.length + 1) || TLD_TYPOS.has(tld))) {
      const dist = editDistance(sld, pSld);
      if (dist > 0 && dist <= 2 && dist < bestScore) [best, bestScore] = [p, dist];
    }
  }
  return best ? v.slice(0, at + 1) + best : null;
}

export function emailError(value: string): string | null {
  const v = value.trim();
  if (!v) return "Informe seu e-mail";
  if (/\s/.test(v)) return "O e-mail não pode conter espaços";
  const at = v.split("@").length - 1;
  if (at === 0) return "Falta o @, por exemplo nome@exemplo.com.br";
  if (at > 1) return "O e-mail só pode ter um @";
  const [local, domain] = v.split("@");
  if (!local) return "Digite seu nome antes do @";
  if (!domain) return "Informe o domínio após o @, por exemplo gmail.com";
  if (/[^a-z.-]/i.test(domain)) return "Use apenas letras e pontos após o @, ex.: gmail.com";
  if (!domain.includes(".")) return "Falta a terminação do domínio, ex.: .com ou .com.br";
  if (v.length > 200 || local.length > 64 || !EMAIL_RE.test(v)) return "Informe um e-mail válido, ex.: nome@exemplo.com.br";
  const tld = domain.slice(domain.lastIndexOf(".") + 1).toLowerCase();
  const fix = emailSuggestion(v);
  if (fix) return `Você quis dizer ${fix}?`;
  if (tld.length !== 2 && !GENERIC_TLDS.has(tld)) return `".${tld}" não é um domínio válido: confira (ex.: .com, .br)`;
  return null;
}

export const NAME_RE = /^\p{L}[\p{L}\p{M} .'-]*$/u;

export function nameError(value: string): string | null {
  const v = value.trim();
  if (!v) return "Informe seu nome";
  if (v.length < 2) return "O nome está muito curto";
  if (v.length > 120) return "O nome está muito longo";
  if (!NAME_RE.test(v)) return "Use apenas letras (espaços, . ' - são permitidos)";
  return null;
}

// Telefone / WhatsApp (Brasil: +55 DDD + 8 ou 9 dígitos, ou E.164).
export const PHONE_RE = /^\+[1-9]\d{7,14}$/;

/** Normaliza números brasileiros (ex.: (11) 99999-9999 → +5511999999999). */
export function normalizePhone(value: string): string {
  const v = value.trim().replace(/[\s()-]/g, "");
  if (/^0\d{10,11}$/.test(v)) return `+55${v.slice(1)}`;
  if (/^\d{10,11}$/.test(v)) return `+55${v}`;
  if (/^55\d{10,11}$/.test(v)) return `+${v}`;
  return v;
}

export function phoneError(value: string): string | null {
  const v = value.trim().replace(/[\s()-]/g, "");
  if (!v) return "Informe seu telefone ou WhatsApp";
  if (!/^\+?\d+$/.test(v)) return "Use apenas números (ou + no início)";
  if (/^0\d{10,11}$/.test(v)) return null;
  if (/^\d{10,11}$/.test(v)) return null;
  if (/^55\d{10,11}$/.test(v)) return null;
  if (v.startsWith("+55")) return /^\+55\d{10,11}$/.test(v) ? null : "Formato Brasil: +55 DDD + 8 ou 9 dígitos, ex.: (11) 99999-9999";
  if (!v.startsWith("+")) return "Informe o DDD + número (ex.: (11) 99999-9999) ou código do país (+55)";
  return PHONE_RE.test(v) ? null : "Informe o telefone completo, ex.: (11) 99999-9999";
}

export function passwordRules(value: string) {
  return [
    { id: "length", label: `Pelo menos ${MIN_PASSWORD} caracteres`, ok: value.length >= MIN_PASSWORD },
    { id: "letter", label: "Uma letra", ok: /\p{L}/u.test(value) },
    { id: "number", label: "Um número", ok: /\d/.test(value) },
  ];
}

export function newPasswordError(value: string): string | null {
  if (!value) return "Escolha uma senha";
  if (value.length > 200) return "A senha está muito longa";
  const missing = passwordRules(value).find((r) => !r.ok);
  return missing ? `A senha precisa de ${missing.label.toLowerCase()}` : null;
}

export function passwordStrength(value: string): number {
  if (!value) return 0;
  const met = passwordRules(value).filter((r) => r.ok).length;
  let score = met;
  if (met === 3 && (value.length >= 12 || /[^\p{L}\d]/u.test(value))) score = 4;
  return score;
}
