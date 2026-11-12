const fs = require('fs');
const path = require('path');

const root = '/root/ClubeMkt/inbramet/src';
let updated = 0;

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
    } else if (/\.(tsx?|jsx?)$/.test(entry.name)) {
      let content = fs.readFileSync(full, 'utf8');
      const before = content;
      content = content
        .replace(/Casa del Camba/g, 'Inbramet')
        .replace(/casadelcamba/g, 'inbramet')
        .replace(/casas de camba/gi, 'comidas camba')
        .replace(/comida cambiña/gi, 'comida camba')
        .replace(/sabores cambas/gi, 'sabores camba')
        .replace(/comida típica cruceña/gi, 'comida típica cruceña')
        .replace(/pato de pato/gi, 'pato')
        .replace(/majao de pato/g, 'majao')
        .replace(/picantes, empanadas/gi, 'picantes, empanadas')
        .replace(/parrilla en Santa Cruz/gi, 'parrilla en Santa Cruz');
      if (content !== before) {
        fs.writeFileSync(full, content);
        updated++;
        console.log('updated', full);
      }
    }
  }
}

walk(root);
console.log('total updated:', updated);
