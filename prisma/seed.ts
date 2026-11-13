import { PrismaClient, Prisma } from "@prisma/client";

type SeedProduct = {
  name: string;
  slug: string;
  sku?: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  material?: string;
  brand: string;
  categorySlug: string;
  contents?: string;
  details?: string;
  stock: number;
  images: string[];
  featured?: boolean;
};

const prisma = new PrismaClient();

// Inbramet — catálogo inicial de móveis (mesas, cadeiras, bancos, banquetas, conjuntos).
// Categories are auto-created from the product data; duplicates are skipped.

const categories: { name: string; slug: string; description: string }[] = [
  { name: "Mesas", slug: "mesas", description: "Mesas retangulares, redondas e estampadas para sala de jantar, cozinha e escritório." },
  { name: "Cadeiras", slug: "cadeiras", description: "Cadeiras dobráveis, ergonômicas e em policarbonato para sala de jantar, escritório e estar." },
  { name: "Bancos", slug: "bancos", description: "Bancos em madeira maciça, aço e acabamento estofado para sala de estar, hall e área externa." },
  { name: "Banquetas", slug: "banquetas", description: "Banquetas altas para bancada, ilha de cozinha e ambientes modernos." },
  { name: "Conjuntos", slug: "conjuntos", description: "Conjuntos de mesa com 4 cadeiras prontos para equipar o seu ambiente." },
];

const products: SeedProduct[] = [
  { name: "Bancada Estampada", slug: "bancada-estampada", description: "Mesa auxiliar estampada com acabamento polimérico de alta resistência.", price: 159, material: "Tinta polimérica", brand: "Inbramet", categorySlug: "mesas", stock: 15, images: ["/products/bancadaestmpada.webp"] },
  { name: "Mesa Preto Branca", slug: "mesa-preto-branca", description: "Mesa retangular com estrutura em aço e tampo em acabamento branco fosco.", price: 399, material: "Aço + madeira branca", brand: "Inbramet", categorySlug: "mesas", stock: 9, images: ["/products/mesa-pretobranca.webp"] },
  { name: "Banco Azul", slug: "banco-azul", description: "Banco retangular com encosto ergonômico, produzido em madeira maciça selecionada.", price: 249, material: "Madeira maciça", brand: "Inbramet", categorySlug: "bancos", stock: 12, images: ["/products/bancoazul.webp"], featured: true },
  { name: "Banco de Metal", slug: "banco-de-metal", description: "Banco com estrutura metálica em pintura eletrostática e assento em madeira maciça.", price: 199, material: "Aço + madeira", brand: "Inbramet", categorySlug: "bancos", stock: 8, images: ["/products/bancoceleste.webp"] },
  { name: "Cadeira Amarela", slug: "cadeira-amarela", description: "Cadeira retrátil em tiras de policarbonato com acabamento brilhante e fácil limpeza. Encaixe vertical compacto, encosto semirretrátil e alça anatômica para transporte.", price: 189, material: "Policarbonato", brand: "Inbramet", categorySlug: "cadeiras", stock: 20, images: ["/products/cadeira-amarela1.webp", "/products/cadeira-amarela2.webp", "/products/cadeira-amarela3.webp"] },
  { name: "Cadeira Preta", slug: "cadeira-preta", description: "Cadeira preta com encosto estruturado e acabamento em policarbonato resistente. Encaixe vertical de perfil fino com alça metálica lateral e cantos reforçados.", price: 149, material: "Policarbonato + metal", brand: "Inbramet", categorySlug: "cadeiras", stock: 18, images: ["/products/cadeira-preta1.webp", "/products/cadeira-preta2.webp", "/products/cadeira-preta3.webp"] },
  { name: "Cadeira Vermelha", slug: "cadeira-vermelha", description: "Cadeira vermelha leve, retrátil e com semiencosto de apoio anatômico. Encaixe compacto, ideal para mesas redondas e áreas integradas, com reforço estrutural traseiro.", price: 169, material: "Polipropileno vermelho", brand: "Inbramet", categorySlug: "cadeiras", stock: 16, images: ["/products/cadeira-vermelha1.webp", "/products/cadeira-vermelha2.webp", "/products/cadeira-vermelha3.webp"] },
  { name: "Jogo de Mesa 4 Cadeiras", slug: "jogomesa4cadeiras", description: "Conjunto de mesa azul e 4 cadeiras ergonômicas, pronto para equipar a sua sala de jantar.", price: 649, material: "Aço + polímero", brand: "Inbramet", categorySlug: "conjuntos", stock: 6, images: ["/products/jogomesa4cadeirasazul.webp"], featured: true },
  { name: "Jogo de Mesa 4 Cadeiras Estampado", slug: "jogomesa4cadeiras-estampado", description: "Conjunto de mesa estampada com 4 cadeiras combinando.", price: 629, material: "Aço + polímero", brand: "Inbramet", categorySlug: "conjuntos", stock: 6, images: ["/products/jogomesa4cadeirasestampado.webp"] },
  { name: "Jogo de Mesa 4 Cadeiras Preto", slug: "jogomesa4cadeiras-preto", description: "Conjunto de mesa com 4 cadeiras em acabamento preto fosco.", price: 649, material: "Aço + polímero", brand: "Inbramet", categorySlug: "conjuntos", stock: 6, images: ["/products/jogomesa4cadeiraspreto.webp"] },
];

async function main() {
  console.log("🌱 Seeding Inbramet database...");

  // Categories
  const categoryIdBySlug = new Map<string, string>();
  for (const c of categories) {
    const cat = await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, description: c.description },
      create: c,
    });
    categoryIdBySlug.set(c.slug, cat.id);
  }
  console.log(`  ✔ ${categories.length} categories`);

  // Single online store record kept for schema FK compatibility (BranchStock & Order)
  const branches = [
    {
      name: "Loja Online",
      slug: "loja-online",
      code: "IN01",
      address: "Av. Paulista, 1000",
      city: "São Paulo, SP",
      phone: "+55 11 4000-0000",
      whatsapp: "5511999999999",
      hours: "Seg–Sáb, 09:00 – 19:00",
      latitude: -23.5614,
      longitude: -46.6559,
      sortOrder: 1,
    },
  ];
  const branchIds: string[] = [];
  for (const b of branches) {
    const row = await prisma.branch.upsert({
      where: { slug: b.slug },
      update: {},
      create: b,
      select: { id: true, latitude: true },
    });
    branchIds.push(row.id);
  }

  // Products
  for (const p of products) {
    const categoryId = categoryIdBySlug.get(p.categorySlug);
    if (!categoryId) continue;
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name,
        description: p.description,
        price: new Prisma.Decimal(p.price),
        compareAtPrice: p.compareAtPrice ? new Prisma.Decimal(p.compareAtPrice) : null,
        material: p.material,
        brand: p.brand,
        categoryId,
        contents: p.contents,
        details: p.details,
        images: p.images,
        featured: p.featured ?? false,
        sku: p.sku,
      },
      create: {
        slug: p.slug,
        name: p.name,
        description: p.description,
        price: new Prisma.Decimal(p.price),
        compareAtPrice: p.compareAtPrice ? new Prisma.Decimal(p.compareAtPrice) : null,
        material: p.material,
        brand: p.brand,
        categoryId,
        contents: p.contents,
        details: p.details,
        images: p.images,
        featured: p.featured ?? false,
        sku: p.sku,
      },
      select: { id: true },
    });
    for (const branchId of branchIds) {
      await prisma.branchStock.upsert({
        where: { branchId_productId: { branchId, productId: product.id } },
        update: {},
        create: { branchId, productId: product.id, stock: p.stock },
      });
    }
  }
  console.log(`  ✔ ${products.length} products`);
  console.log(`  ✔ ${branches.length} store profile initialized`);

  // Seed settings
  const settings = {
    contact: {
      email: "contato@inbramet.com.br",
      phone: "+55 11 4000-0000",
      whatsapp: "5511999999999",
      city: "São Paulo, SP · Brasil",
      hours: "Seg–Sáb, 09:00 – 19:00",
    },
    social: {
      instagram: "",
      facebook: "",
      tiktok: "",
    },
    shipping: {
      flatFee: 35.0,
      freeThreshold: 500.0,
      deliveryTime: "3 a 7 dias úteis em todo o Brasil",
    },
    announcements: [
      "Entrega especializada em todo o Brasil",
      "Frete grátis acima de R$ 500",
      "Clube Inbramet: acumule pontos e troque por acessórios e descontos",
      "Design em aço, madeira e polímero · Pagamento seguro",
    ],
    inventory: { lowStockThreshold: 5 },
    loyalty: {
      enabled: true,
      name: "Clube Inbramet",
      stampsToFree: 10,
      eligible: "all",
      eligibleSlugs: [],
      pointsPer: 1,
      pointsAmount: 10,
      pointsOnShipping: false,
      expiryDays: 0,
    },
    notifications: { orderEmail: "contato@inbramet.com.br" },
  };

  await prisma.setting.upsert({
    where: { key: "store" },
    update: { value: settings },
    create: { key: "store", value: settings },
  });
  console.log("  ✔ store settings");

  // Starting rewards shop.
  const rewards = [
    { slug: "kit-cuidado-madeira", name: "Kit de cuidado para madeira", description: "Cera protetora e flanela de microfibra para conservar seus móveis.", costPoints: 150, stock: 40, order: 1 },
    { slug: "banco-auxiliar-corto", name: "Banco auxiliar compacto", description: "Banco leve multiuso em aço e polímero.", costPoints: 300, stock: 25, order: 2 },
    { slug: "cadeira-preta-premio", name: "Cadeira Preta", description: "Cadeira ergonômica preta empilhável da coleção Inbramet.", costPoints: 450, stock: 20, order: 3 },
    { slug: "bancada-estampada-premio", name: "Bancada Estampada", description: "Mesa auxiliar estampada de alta resistência.", costPoints: 500, stock: 15, order: 4 },
  ];
  for (const r of rewards) {
    await prisma.reward.upsert({
      where: { slug: r.slug },
      update: { name: r.name, description: r.description, costPoints: r.costPoints, order: r.order },
      create: r,
    });
  }
  console.log(`  ✔ ${rewards.length} Clube Inbramet rewards`);

  console.log("✅ Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
