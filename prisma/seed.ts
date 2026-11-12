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

// Inbramet — menu taken from the chain's PedidosYa listing (Central).
// Categories are auto-created from the product data; duplicates are skipped.

const categories: { name: string; slug: string; description: string }[] = [
  { name: "Entradas", slug: "entrada", description: "Para abrir el apetito, al estilo camba." },
  { name: "Empanadas", slug: "empanadas", description: "Las infaltables: de carne de res y de keperí, con salsa tártara." },
  { name: "Sopas", slug: "sopas", description: "Sopa de maní y locro: tradición en cada cucharada." },
  { name: "Platos típicos y combinados", slug: "platos-tipicos-y-combinados", description: "Majao, picantes, silpancho y buffets: el corazón de la cocina cruceña." },
  { name: "Parrilla", slug: "parrilla", description: "Cortes a la parrilla con las guarniciones de la casa." },
  { name: "Plato vegetariano", slug: "plato-vegetariano", description: "Una opción fresca y sin carne." },
  { name: "Menú de niños", slug: "menu-de-ninos", description: "Porciones pensadas para los más chicos de la casa." },
  { name: "Agregados", slug: "agregados", description: "Guarniciones para acompañar tu plato." },
  { name: "Bebidas", slug: "bebidas", description: "Gaseosas bien frías de 500 ml." },
  { name: "Postres", slug: "postres", description: "Los dulces de la casa: leche crema, arroz con leche y manjar blanco." },
];

const products: SeedProduct[] = [
  // Entradas
  { name: "Ceviche De Lagarto", slug: "ceviche-de-lagarto", description: "Ceviche de Lagarto acompañado con camote y chipilo.", price: 79, brand: "Inbramet", categorySlug: "entrada", stock: 40, images: ["/imgs/menu/ceviche-de-lagarto.jpeg"] },
  // Empanadas
  { name: "Empanadas de carne (6 unid)", slug: "empanadas-de-carne-6-unid", description: "6 Empanadas de carne de Res acompañadas con salsa Tártara", price: 42, material: "6 unidades", brand: "Inbramet", categorySlug: "empanadas", stock: 40, images: ["/imgs/menu/empanadas-de-carne-6-unid.jpeg"], featured: true },
  { name: "Empanadas de Keperi (6 unid.)", slug: "empanadas-de-keperi-6-unid", description: "6 Empanadas de carne de Keperi acompañadas con salsa Tártara", price: 49, material: "6 unidades", brand: "Inbramet", categorySlug: "empanadas", stock: 40, images: ["/imgs/menu/empanadas-de-keperi-6-unid.jpeg"] },
  { name: "Pack camba de empanadas", slug: "pack-camba-de-empanadas", description: "Delicioso pack de empandas de carne molida (3 unidades) y keperí (3 unidades)", price: 49, material: "6 unidades", brand: "Inbramet", categorySlug: "empanadas", stock: 40, images: ["/imgs/menu/pack-camba-de-empanadas.jpeg"] },
  { name: "Dúo de empandas de keperí", slug: "duo-de-empandas-de-keperi", description: "Deliciosas empanadas de keperí", price: 14, material: "2 unidades", brand: "Inbramet", categorySlug: "empanadas", stock: 40, images: ["/imgs/menu/duo-de-empandas-de-keperi.jpeg"] },
  { name: "Dúo de empanadas de carne", slug: "duo-de-empanadas-de-carne", description: "Deliciosas empanadas de carne", price: 12, material: "2 unidades", brand: "Inbramet", categorySlug: "empanadas", stock: 40, images: ["/imgs/menu/duo-de-empanadas-de-carne.jpeg"] },
  { name: "Dúo mixto de empanadas", slug: "duo-mixto-de-empanadas", description: "Empanada de keperí y carne", price: 14, material: "2 unidades", brand: "Inbramet", categorySlug: "empanadas", stock: 40, images: ["/imgs/menu/duo-mixto-de-empanadas.jpeg"] },
  // Sopas
  { name: "Sopa de Maní", slug: "sopa-de-mani", description: "Sopa cremosa de maní con costilla de res, churiqui y papa fritas acompañada de yuca.", price: 36, brand: "Inbramet", categorySlug: "sopas", stock: 40, images: ["/imgs/menu/sopa-de-mani.jpeg"] },
  { name: "Locro", slug: "locro", description: "Madio locro pollo con una presa de pierna.", price: 36, brand: "Inbramet", categorySlug: "sopas", stock: 40, images: ["/imgs/menu/locro.jpeg"] },
  // Platos típicos y combinados
  { name: "Majao de pato", slug: "majao-de-pato", description: "Arroz batido con pato desmenuzado y urucú acompañado con huevo, plátano y yuca frita.", price: 55, brand: "Inbramet", categorySlug: "platos-tipicos-y-combinados", stock: 40, images: ["/imgs/menu/majao-de-pato.jpeg"], featured: true },
  { name: "Majao de charque", slug: "majao-de-charque", description: "Arroz tostado con charque y urucú acompañado con huevo, plátano y yuca frita.", price: 48, brand: "Inbramet", categorySlug: "platos-tipicos-y-combinados", stock: 40, images: ["/imgs/menu/majao-de-charque.jpeg"] },
  { name: "Majao mixto / charque y pato", slug: "majao-mixto-charque-y-pato", description: "Majao mixto de charque tostado y pato", price: 56, brand: "Inbramet", categorySlug: "platos-tipicos-y-combinados", stock: 40, images: ["/imgs/menu/majao-mixto-charque-y-pato.jpeg"] },
  { name: "Silpancho", slug: "silpancho", description: "Carne apanada acompañada de arroz, papas, huevo y ensalada de tomate y cebolla.", price: 65, brand: "Inbramet", categorySlug: "platos-tipicos-y-combinados", stock: 40, images: ["/imgs/menu/silpancho.jpeg"], featured: true },
  { name: "Picante Mixto Lengua-Pollo", slug: "picante-mixto-lengua-pollo", description: "Cuarto pollo pechuga y porción de lengua de res con jugo de picante acompañado con arroz primavera y chuño.", price: 89, brand: "Inbramet", categorySlug: "platos-tipicos-y-combinados", stock: 40, images: ["/imgs/menu/picante-mixto-lengua-pollo.jpeg"], featured: true },
  { name: "Picante De Pollo", slug: "picante-de-pollo", description: "Cuarto de pollo pechuga con jugo picante acompañada con arroz primavera y chuño.", price: 68, brand: "Inbramet", categorySlug: "platos-tipicos-y-combinados", stock: 40, images: ["/imgs/menu/picante-de-pollo.jpeg"] },
  { name: "Picante de Lengua", slug: "picante-de-lengua", description: "2 porciones de lengua de res con jugo picante acompañado con arroz primavera y chuño.", price: 85, brand: "Inbramet", categorySlug: "platos-tipicos-y-combinados", stock: 40, images: ["/imgs/menu/picante-de-lengua.jpeg"] },
  { name: "Chancho al horno crocante", slug: "chancho-al-horno-crocante", description: "Cerdo crocante acompañado arroz primavera y ensalada", price: 90, brand: "Inbramet", categorySlug: "platos-tipicos-y-combinados", stock: 40, images: ["/imgs/menu/chancho-al-horno-crocante.jpeg"] },
  { name: "Medio Keperi", slug: "medio-keperi", description: "Keperi con Arroz primavera , yuca frita , ensalada lechuga y tomate.", price: 77, brand: "Inbramet", categorySlug: "platos-tipicos-y-combinados", stock: 40, images: ["/imgs/menu/medio-keperi.jpeg"], featured: true },
  { name: "Platango", slug: "platango", description: "Incluye Picante de pollo, Silpancho, Majao de charque, chuño, plátano frito, yuca frita y huevo frito para 1 persona.", price: 90, brand: "Inbramet", categorySlug: "platos-tipicos-y-combinados", stock: 40, images: ["/imgs/menu/platango.jpeg"], featured: true },
  { name: "Rapii Al Jugo", slug: "rapii-al-jugo", description: "Jugosa carne acompañada con arroz con queso y yuca.", price: 77, brand: "Inbramet", categorySlug: "platos-tipicos-y-combinados", stock: 40, images: ["/imgs/menu/rapii-al-jugo.jpeg"] },
  { name: "Rapii con majao de charque", slug: "rapii-con-majao-de-charque", description: "Deliciosa carne jugosa acompañada con Majao de charque tostado, huevo, plátano y yuca.", price: 90, brand: "Inbramet", categorySlug: "platos-tipicos-y-combinados", stock: 40, images: ["/imgs/menu/rapii-con-majao-de-charque.jpeg"] },
  { name: "Churrasco Con Majao De Charque", slug: "churrasco-con-majao-de-charque", description: "Delicioso churrasco acompañado con Majao de charque, huevo y plátano.", price: 90, brand: "Inbramet", categorySlug: "platos-tipicos-y-combinados", stock: 40, images: ["/imgs/menu/churrasco-con-majao-de-charque.jpeg"] },
  { name: "Mini buffet de la casa p/2 per", slug: "mini-buffet-de-la-casa-p2-per", description: "Majao de charque tostado, Majao de charque batido, Picante de lengua y Rapii, acompañado por la ensalada del día , arroz primavera, yuca frita, plátano frito, chuño, huevo frito y llajua.", price: 180, material: "Para 2 personas", brand: "Inbramet", categorySlug: "platos-tipicos-y-combinados", stock: 40, images: ["/imgs/menu/mini-buffet-de-la-casa-p2-per.jpeg"] },
  { name: "Mini Buffet para 2 personas", slug: "mini-buffet-para-2-personas", description: "Majao de Pato + Majao de Charque + Keperí + Picante Pollo acompañado con arroz primavera, chuño, ensalada del día y yuca frita.", price: 180, material: "Para 2 personas", brand: "Inbramet", categorySlug: "platos-tipicos-y-combinados", stock: 40, images: ["/imgs/menu/mini-buffet-para-2-personas.jpeg"] },
  { name: "Buffet Típico Para 4 Personas", slug: "buffet-tipico-para-4-personas", description: "Incluye: Majao de Charque Tostado, Majao de Pato, Picante de Pollo y Keperí al horno, estos platos son acompañados con Ensalada del día, arroz primavera, plátano frito, chuño, huevo frito y llajua.", price: 330, material: "Para 4 personas", brand: "Inbramet", categorySlug: "platos-tipicos-y-combinados", stock: 40, images: ["/imgs/menu/buffet-tipico-para-4-personas.jpeg"] },
  { name: "Picante de pollo con majao de charque", slug: "picante-de-pollo-con-majao-de-charque", description: "Picante de pollo con majao de charque batido o tostado acompañado con huevo frito, plátano y chuño", price: 85, brand: "Inbramet", categorySlug: "platos-tipicos-y-combinados", stock: 40, images: [] },
  { name: "Picante de lengua con majao de charque", slug: "picante-de-lengua-con-majao-de-charque", description: "Picante de lengua con majao de charque batido o tostado acompañado con huevo, plátano y chuño", price: 90, brand: "Inbramet", categorySlug: "platos-tipicos-y-combinados", stock: 40, images: [] },
  { name: "Tres tiempos/ empanadas -buffet típico-postre", slug: "tres-tiempos-empanadas-buffet-tipico-postre", description: "4 empanadas ( keperí y carne) + buffet típico ( picante de pollo + keperí + majao de pato + majao de charque tostado) + postre tres cambitas ( arroz con leche, leche crema y manjar blanco)", price: 235, brand: "Inbramet", categorySlug: "platos-tipicos-y-combinados", stock: 40, images: [] },
  { name: "Tres pasos / empanadas,buffet de casa, postre", slug: "tres-pasos-empanadasbuffet-de-casa-postre", description: "4 empanadas ( keperí y carne) + buffet de la casa ( majao de charque tostado y batido), picante de lengua y rapii + tric (arroz con leche, leche crema y manjar blanco)", price: 235, brand: "Inbramet", categorySlug: "platos-tipicos-y-combinados", stock: 40, images: [] },
  // Parrilla
  { name: "Bife De Chorizo Jr", slug: "bife-de-chorizo-jr", description: "Deliciosa carne de parrilla, acompañada de arroz con queso, yuca y ensalada del día.", price: 80, brand: "Inbramet", categorySlug: "parrilla", stock: 40, images: ["/imgs/menu/bife-de-chorizo-jr.jpeg"] },
  { name: "Churrasco", slug: "churrasco", description: "Deliciosa carne a la parrilla acompañado con arroz con queso, ensalada del día, yuca frita y llajua.", price: 105, brand: "Inbramet", categorySlug: "parrilla", stock: 40, images: ["/imgs/menu/churrasco.jpeg"], featured: true },
  { name: "Bife de chorizo para 2 personas", slug: "bife-de-chorizo-para-2-personas", description: "Deliciosa carne de res a la parrilla acompañado de dos chorizos, arroz con queso o graneado, ensalada del día, yuca frita y llajua", price: 195, material: "Para 2 personas", brand: "Inbramet", categorySlug: "parrilla", stock: 40, images: ["/imgs/menu/bife-de-chorizo-para-2-personas.jpeg"] },
  { name: "Pollo deshuesado", slug: "pollo-deshuesado", description: "1/2 Pollo deshuesado acompañado con arroz con primavera, papas fritas y ensalada del dia.", price: 100, brand: "Inbramet", categorySlug: "parrilla", stock: 40, images: ["/imgs/menu/pollo-deshuesado.jpeg"] },
  { name: "Parrilla Carnívora para 2 personas", slug: "parrilla-carnivora-para-2-personas", description: "Carne de Lomo de Res, Chuleta de Cerdo, Filete de Pollo y Chorizo acompañado de arroz con queso, yuca frita y ensalada de lechuga y tomate para 2 personas.", price: 200, material: "Para 2 personas", brand: "Inbramet", categorySlug: "parrilla", stock: 40, images: ["/imgs/menu/parrilla-carnivora-para-2-personas.jpeg"] },
  { name: "Parrilla tradicional p/2 personas", slug: "parrilla-tradicional-p2-personas", description: "Carne de Lomo de Res, Filete de Pollo, Corazón, Riñón, Chinchulí, Tripa, Chorizo y Morcilla acompañado de Arroz con Queso,Yuca frita y Ensalada de Lechuga y Tomate para 2 personas.", price: 200, material: "Para 2 personas", brand: "Inbramet", categorySlug: "parrilla", stock: 40, images: ["/imgs/menu/parrilla-tradicional-p2-personas.jpeg"] },
  { name: "Bife de chorizo", slug: "bife-de-chorizo", description: "Deliciosa carne a parrilla acompañado con chorizo, arroz con queso o primavera, ensalada del día, yuca frita o llajua", price: 115, brand: "Inbramet", categorySlug: "parrilla", stock: 40, images: [] },
  { name: "Empanadas,parrilla carnívora y postre p/2 per", slug: "empanadasparrilla-carnivora-y-postre-p2-per", description: "Tres pasos: 2 empanadas de keperí + 2 empanadas de carne + parrilla carnívoras con guarniciones y postre tres cambitas (arroz con leche, leche crema y manjar blanco)", price: 250, material: "Para 2 personas", brand: "Inbramet", categorySlug: "parrilla", stock: 40, images: [] },
  { name: "Empanadas, parr. tradicional, postre p/2 pers", slug: "empanadas-parr-tradicional-postre-p2-pers", description: "Tres pasos: 2 empanadas de keperí + 2 empanadas de carne + parrilla tradicional con guarniciones y postre tres cambitas (arroz con leche, leche crema y manjar blanco)", price: 250, material: "Para 2 personas", brand: "Inbramet", categorySlug: "parrilla", stock: 40, images: [] },
  // Plato vegetariano
  { name: "Plato Vegetariano", slug: "plato-vegetariano", description: "Ensalada Rusa, Palmito, Huevo, Tomate, Queso y Pepinillos.", price: 40, brand: "Inbramet", categorySlug: "plato-vegetariano", stock: 40, images: ["/imgs/menu/plato-vegetariano.jpeg"] },
  // Menú de niños
  { name: "Casita -plato+jugo+juguete", slug: "casita-platojugojuguete", description: "Combo para que los niños disfruten de un delicioso plato acompañado del un jugo del Valle y hermoso Juguete.", price: 60, material: "Plato + jugo + juguete", brand: "Inbramet", categorySlug: "menu-de-ninos", stock: 40, images: ["/imgs/menu/casita-platojugojuguete.jpeg"] },
  { name: "Majadito velatacú", slug: "majadito-velatacu", description: "Delicioso plato, arroz con charque y urucú acompañado de huevo y plátano.", price: 35, brand: "Inbramet", categorySlug: "menu-de-ninos", stock: 40, images: ["/imgs/menu/majadito-velatacu.jpg"] },
  { name: "Nuggets De Pollo", slug: "nuggets-de-pollo", description: "Deliciosos Nuggets de pollo acompañada com papas fritas y salsa golf.", price: 40, brand: "Inbramet", categorySlug: "menu-de-ninos", stock: 40, images: ["/imgs/menu/nuggets-de-pollo.jpeg"] },
  { name: "Milanesa De Pollo Picada", slug: "milanesa-de-pollo-picada", description: "Milanesa de Pollo Picada con papas fritas y salsa golf.", price: 38, brand: "Inbramet", categorySlug: "menu-de-ninos", stock: 40, images: ["/imgs/menu/milanesa-de-pollo-picada.jpeg"] },
  // Agregados
  { name: "Arroz con queso", slug: "arroz-con-queso", description: "Arroz con queso.", price: 15, brand: "Inbramet", categorySlug: "agregados", stock: 50, images: ["/imgs/menu/arroz-con-queso.jpeg"] },
  { name: "Arroz primavera", slug: "arroz-primavera", description: "Arroz primavera.", price: 15, brand: "Inbramet", categorySlug: "agregados", stock: 50, images: ["/imgs/menu/arroz-primavera.jpeg"] },
  { name: "Yuca frita", slug: "yuca-frita", description: "Yuca frita.", price: 15, brand: "Inbramet", categorySlug: "agregados", stock: 50, images: ["/imgs/menu/yuca-frita.jpeg"] },
  { name: "Plátano frito", slug: "platano-frito", description: "Plátano frito.", price: 15, brand: "Inbramet", categorySlug: "agregados", stock: 50, images: ["/imgs/menu/platano-frito.jpg"] },
  { name: "Chorizo", slug: "chorizo", description: "Unidad de chorizo.", price: 15, brand: "Inbramet", categorySlug: "agregados", stock: 50, images: ["/imgs/menu/chorizo.jpg"] },
  // Bebidas
  { name: "Gaseosa Coca-Cola 500 ml", slug: "gaseosa-coca-cola-500-ml", description: "Coca cola", price: 15, material: "500 ml", brand: "Coca-Cola", categorySlug: "bebidas", contents: "500 ml", stock: 60, images: ["/imgs/menu/gaseosa-coca-cola-500-ml.jpg"] },
  { name: "Coca-Cola Sin Azúcar 500 ml", slug: "coca-cola-sin-azucar-500-ml", description: "Coca cola sin azúcar", price: 15, material: "500 ml", brand: "Coca-Cola", categorySlug: "bebidas", contents: "500 ml", stock: 60, images: ["/imgs/menu/coca-cola-sin-azucar-500-ml.jpg"] },
  { name: "Gaseosa Fanta Naranja 500 ml", slug: "gaseosa-fanta-naranja-500-ml", description: "Fanta 500 ml.", price: 15, material: "500 ml", brand: "Fanta", categorySlug: "bebidas", contents: "500 ml", stock: 60, images: ["/imgs/menu/gaseosa-fanta-naranja-500-ml.jpg"] },
  { name: "Guarana Antartica 500 Ml", slug: "guarana-antartica-500-ml", description: "Gaseosa de 500 ml.", price: 15, material: "500 ml", brand: "Guaraná Antarctica", categorySlug: "bebidas", contents: "500 ml", stock: 60, images: ["/imgs/menu/guarana-antartica-500-ml.jpg"] },
  { name: "Gaseosa Pepsi 500 ml", slug: "gaseosa-pepsi-500-ml", description: "Bebida refrescante aromatizada. Endulzada con azúcar y edulcorantes.", price: 15, material: "500 ml", brand: "Pepsi", categorySlug: "bebidas", contents: "500 ml", stock: 60, images: ["/imgs/menu/gaseosa-pepsi-500-ml.jpg"] },
  { name: "Gaseosa Sprite 500 ml", slug: "gaseosa-sprite-500-ml", description: "Sprite", price: 15, material: "500 ml", brand: "Sprite", categorySlug: "bebidas", contents: "500 ml", stock: 60, images: ["/imgs/menu/gaseosa-sprite-500-ml.jpg"] },
  // Postres
  { name: "Leche crema", slug: "leche-crema", description: "Flan casero tradicional.", price: 18, brand: "Inbramet", categorySlug: "postres", stock: 30, images: ["/imgs/menu/leche-crema.jpg"] },
  { name: "Arroz con leche", slug: "arroz-con-leche", description: "Arroz con leche.", price: 18, brand: "Inbramet", categorySlug: "postres", stock: 30, images: ["/imgs/menu/arroz-con-leche.jpg"] },
  { name: "Manjar Blanco", slug: "manjar-blanco", description: "Delicioso manjar blanco con queso criollo.", price: 20, brand: "Inbramet", categorySlug: "postres", stock: 30, images: ["/imgs/menu/manjar-blanco.jpeg"] },
  { name: "Tres Cambitas", slug: "tres-cambitas", description: "Leche crema, arroz con leche y manjar blanco.", price: 40, brand: "Inbramet", categorySlug: "postres", stock: 30, images: ["/imgs/menu/tres-cambitas.jpeg"], featured: true },
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

  // The 13 Inbramet locations. The seven Express sucursales carry their
  // WhatsApp order line from the official Linktree (linktr.ee/InbrametExpres3);
  // the full-service restaurants and addresses follow their Google Maps listings,
  // and Camba Muerto's phone/WhatsApp come from its official Facebook page.
  // Coordinates are used by the storefront to suggest the closest branch and to
  // place every pin on the 3D map. Malls and plazas that no gazetteer knows
  // (Punto Market, Mega Center) rest on the street or corner they publish.
  const branches = [
    { name: "Central", slug: "central", code: "CC01", address: "Avenida Cristóbal de Mendoza #1365", city: "Santa Cruz de la Sierra", phone: "+591 3 3427864", whatsapp: "59176003875", hours: "Lun–Dom, 11:00 – 23:00", latitude: -17.7699, longitude: -63.1737, sortOrder: 1 },
    { name: "Urubó", slug: "urubo", code: "CC02", address: "Colinas del Urubó", city: "Santa Cruz de la Sierra", latitude: -17.7507, longitude: -63.2164, sortOrder: 2 },
    { name: "Fidalga", slug: "fidalga", code: "CC03", address: "Av. Fidalga", city: "Santa Cruz de la Sierra", whatsapp: "59178002456", latitude: -17.7765, longitude: -63.1732, sortOrder: 3 },
    { name: "Las Brisas", slug: "las-brisas", code: "CC04", address: "Las Brisas", city: "Santa Cruz de la Sierra", whatsapp: "59169061542", latitude: -17.7492, longitude: -63.1763, sortOrder: 4 },
    { name: "Punto Market", slug: "punto-market", code: "CC05", address: "Punto Market, Ruta Nacional 4", city: "Santa Cruz de la Sierra", latitude: -17.7200, longitude: -63.1530, sortOrder: 5 },
    { name: "Mega Center", slug: "mega-center", code: "CC06", address: "Mega Center, Av. El Trompillo (Sur)", city: "Santa Cruz de la Sierra", whatsapp: "59169202296", latitude: -17.7987, longitude: -63.1780, sortOrder: 6 },
    { name: "Ventura Mall", slug: "ventura-mall", code: "CC07", address: "Ventura Mall", city: "Santa Cruz de la Sierra", whatsapp: "59178511582", latitude: -17.7544, longitude: -63.1995, sortOrder: 7 },
    { name: "Makro Parque", slug: "makro-parque", code: "CC08", address: "Makro Parque", city: "Santa Cruz de la Sierra", whatsapp: "59169202586", latitude: -17.7650, longitude: -63.1472, sortOrder: 8 },
    { name: "Ice Norte", slug: "ice-norte", code: "CC09", address: "Ice Norte", city: "Santa Cruz de la Sierra", whatsapp: "59162078775", latitude: -17.7731, longitude: -63.2037, sortOrder: 9 },
    { name: "Patio Belén", slug: "patio-belen", code: "CC10", address: "Patio Belén", city: "Santa Cruz de la Sierra", whatsapp: "59177676009", latitude: -17.7452, longitude: -63.1606, sortOrder: 10 },
    { name: "Busch", slug: "busch", code: "CC11", address: "Av. Busch", city: "Santa Cruz de la Sierra", latitude: -17.7738, longitude: -63.1892, sortOrder: 11 },
    { name: "Porongo", slug: "porongo", code: "CC12", address: "Porongo", city: "Porongo", latitude: -17.8529, longitude: -63.3083, sortOrder: 12 },
    { name: "La Inbramet Muerto", slug: "la-casa-del-camba-muerto", code: "CC13", address: "Av. Canal Guapilo, 7mo anillo, Calle 3 #7", city: "Santa Cruz de la Sierra", phone: "+591 76012093", whatsapp: "59176012093", latitude: -17.7871, longitude: -63.1352, sortOrder: 13 },
  ];
  const branchIds: string[] = [];
  for (const b of branches) {
    const row = await prisma.branch.upsert({
      where: { slug: b.slug },
      update: {}, // never overwrite details the store already edited
      create: b,
      select: { id: true, latitude: true },
    });
    // Branches seeded before coordinates existed get them once, without
    // touching anything the store may have edited afterwards.
    if (row.latitude == null && b.latitude != null) {
      await prisma.branch.update({
        where: { id: row.id },
        data: { address: b.address, latitude: b.latitude, longitude: b.longitude },
      });
    }
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
        update: {}, // never overwrite stock that the store already manages
        create: { branchId, productId: product.id, stock: p.stock },
      });
    }
  }
  console.log(`  ✔ ${products.length} products`);
  console.log(`  ✔ ${branches.length} branch(es) with stock`);

  // Seed settings
  const settings = {
    contact: {
      email: "eventos@inbramet.com",
      phone: "+591 3 3427864",
      whatsapp: "59176003875",
      city: "Santa Cruz, Bolivia",
      hours: "Lun–Dom, 11:00 – 23:00",
    },
    social: {
      instagram: "",
      facebook: "https://www.facebook.com/Inbramet/",
      tiktok: "",
    },
    shipping: {
      flatFee: 15.00,
      freeThreshold: 100.00,
      deliveryTime: "lo antes posible, según preparación y distancia",
    },
    announcements: [
      "Delivery en moto en Santa Cruz",
      "Delivery gratis a partir de Bs 100",
      "Retiro en tienda disponible en todas las sucursales",
      "Club Camba: junta puntos y canjéalos por postres",
      "Tradición camba desde 1986 · Pago contra entrega",
    ],
    inventory: { lowStockThreshold: 5 },
    loyalty: {
      enabled: true,
      name: "Club Camba",
      stampsToFree: 10,
      eligible: "all",
      eligibleSlugs: [],
      pointsPer: 1,
      pointsAmount: 10,
      pointsOnShipping: false,
      expiryDays: 0,
    },
    notifications: { orderEmail: "eventos@inbramet.com" },
  };

  await prisma.setting.upsert({
    where: { key: "store" },
    update: { value: settings },
    create: { key: "store", value: settings },
  });
  console.log("  ✔ store settings");

  // Starting rewards shop. Upserted by slug so the owner's edits (name, cost,
  // stock) survive a re-seed.
  const rewards = [
    { slug: "postre-tres-cambitas", name: "Postre Tres Cambitas", description: "Leche crema, arroz con leche y manjar blanco.", costPoints: 250, stock: 40, order: 1 },
    { slug: "duo-empanadas-keperi", name: "Dúo de empanadas de keperí", description: "Dos empanadas de keperí con salsa tártara.", costPoints: 200, stock: 50, order: 2 },
    { slug: "gaseosa-500ml", name: "Gaseosa 500 ml", description: "La bebida que prefieras, bien fría.", costPoints: 150, stock: 60, order: 3 },
    { slug: "majadito-velatacu", name: "Majadito velatacú", description: "Arroz con charque y urucú, huevo y plátano.", costPoints: 300, stock: 30, order: 4 },
  ];
  for (const r of rewards) {
    await prisma.reward.upsert({
      where: { slug: r.slug },
      update: { name: r.name, description: r.description, costPoints: r.costPoints, order: r.order },
      create: r,
    });
  }
  console.log(`  ✔ ${rewards.length} Club Camba rewards`);

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
