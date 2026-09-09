import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const data = JSON.parse(readFileSync(join(__dirname, '..', 'src', 'data', 'products.json'), 'utf-8'))

function escapeSql(str) {
  if (str === null || str === undefined) return 'NULL'
  return "'" + String(str).replace(/'/g, "''") + "'"
}

let sql = `-- ============================================================
-- Seed data: 18 produits initiaux
-- À exécuter dans: Supabase Dashboard > SQL Editor > New query
-- ============================================================

INSERT INTO products (category, name_fr, name_ar, brand, price, description_fr, description_ar, badge, image_url, is_active)
VALUES\n`

// Mapper les anciens IDs slug → nouvelles catégories réelles du magasin
const CATEGORY_MAP = {
  'complements-enfants': 'Complément Alimentaire',
  'soins-visage':        'Skin care',
  'soins-corps':         'Body care',
  'cosmetique':          'Cosmétique',
  'bebe':                'Bébé',
}

// Mapper les champs JSON → colonnes Supabase
function mapProduct(p) {
  return {
    category:       CATEGORY_MAP[p.category] ?? p.category,
    name:           p.name,
    nameAr:         p.nameAr,
    brand:          p.brand || '',
    price:          p.price,
    description:    p.description,
    descriptionAr:  p.descriptionAr,
    badge:          p.badge || null,
    image:          p.image || null
  }
}

const values = data.products.map(p => {
  const m = mapProduct(p)
  return `  (${escapeSql(m.category)}, ${escapeSql(m.name)}, ${escapeSql(m.nameAr)}, ${escapeSql(m.brand)}, ${m.price}, ${escapeSql(m.description)}, ${escapeSql(m.descriptionAr)}, ${escapeSql(m.badge)}, ${escapeSql(m.image)}, true)`
})

sql += values.join(',\n') + ';\n'

writeFileSync(join(__dirname, 'seed.sql'), sql, 'utf-8')
console.log('✅ seed.sql généré avec succès avec', data.products.length, 'produits !')
