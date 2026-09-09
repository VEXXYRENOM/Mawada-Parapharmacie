/**
 * seed.js — Migration products.json → Supabase
 * Exécuter UNE SEULE FOIS : node supabase/seed.js
 *
 * Prérequis :
 *  - Fichier .env.local rempli avec VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY
 *  - Tables créées via supabase/schema.sql
 *  - npm install @supabase/supabase-js (déjà fait)
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { config } from 'dotenv'

// Charger les variables d'environnement depuis .env.local
const __dirname = dirname(fileURLToPath(import.meta.url))
config({ path: join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables manquantes dans .env.local :')
  console.error('   VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY sont requis')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Lire le fichier JSON existant
const data = JSON.parse(
  readFileSync(join(__dirname, '..', 'src', 'data', 'products.json'), 'utf-8')
)

// Mapper les champs JSON → colonnes Supabase
function mapProduct(p) {
  return {
    // On génère un UUID stable basé sur l'ancien ID textuel
    // (mais Supabase génère son propre UUID via default gen_random_uuid())
    category:       p.category,
    name_fr:        p.name,
    name_ar:        p.nameAr || null,
    brand:          p.brand || '',
    price:          p.price,
    description_fr: p.description || null,
    description_ar: p.descriptionAr || null,
    badge:          p.badge || null,
    // Les images locales (/assets/...) restent telles quelles pour l'instant
    // Vous pourrez les remplacer par des URLs Supabase Storage depuis le panneau admin
    image_url:      p.image || null,
    is_active:      true,
  }
}

async function seed() {
  console.log('🌱 Début de la migration...')
  console.log(`📦 ${data.products.length} produits à importer`)

  // Vérifier si des produits existent déjà
  const { count } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })

  if (count > 0) {
    console.warn(`⚠️  La table products contient déjà ${count} enregistrement(s).`)
    console.warn('   Arrêt pour éviter les doublons. Supprimez les données existantes si nécessaire.')
    process.exit(0)
  }

  const products = data.products.map(mapProduct)

  const { data: inserted, error } = await supabase
    .from('products')
    .insert(products)
    .select()

  if (error) {
    console.error('❌ Erreur lors de l\'import :', error.message)
    process.exit(1)
  }

  console.log(`✅ ${inserted.length} produits importés avec succès !`)
  console.log('\n📋 Produits importés :')
  inserted.forEach(p => console.log(`   • [${p.id}] ${p.name_fr} — ${p.price} TND`))
  console.log('\n🎉 Migration terminée. Vous pouvez maintenant gérer vos produits depuis /admin')
}

seed()
