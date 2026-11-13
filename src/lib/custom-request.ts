// Opções para o formulário de pedido sob medida / corporativo.
export const PIECE_TYPES = ["Mesas", "Cadeiras", "Bancos", "Banquetas", "Conjuntos de jantar", "Projeto corporativo", "Outro"] as const;
export const FINISHES = ["Aço preto fosco", "Madeira maciça", "Policarbonato / colorido", "Tampo estampado", "Ainda não defini"] as const;
export const BUDGETS = ["Até R$ 500", "R$ 500 – R$ 1.500", "R$ 1.500 – R$ 3.500", "Acima de R$ 3.500", "Ainda não defini"] as const;

export const MAX_REFERENCE_PHOTOS = 3;
export const MAX_REFERENCE_BYTES = 3 * 1024 * 1024;
export const REFERENCE_PHOTOS_HEADING = "Fotos de referência:";

const OWN_REFERENCE_URL =
  /^(\/uploads\/references\/[a-z0-9-]+\.(jpg|png|webp|avif)|https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com\/references\/[a-z0-9-]+\.(jpg|png|webp|avif))$/;

export function splitReferencePhotos(message: string): { text: string; photos: string[] } {
  const at = message.lastIndexOf(`\n${REFERENCE_PHOTOS_HEADING}\n`);
  if (at === -1) return { text: message, photos: [] };
  const lines = message.slice(at + REFERENCE_PHOTOS_HEADING.length + 2).split("\n").map((l) => l.trim());
  const photos = lines.filter((l) => OWN_REFERENCE_URL.test(l));
  if (photos.length === 0 || photos.length !== lines.filter(Boolean).length) return { text: message, photos: [] };
  return { text: message.slice(0, at).trimEnd(), photos };
}
