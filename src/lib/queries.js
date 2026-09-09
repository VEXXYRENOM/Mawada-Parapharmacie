/**
 * queries.js — Fonctions d'accès aux données Supabase
 * Toutes les fonctions retournent { data, error } ou la donnée directement.
 * Les erreurs sont loguées mais ne bloquent jamais l'UX.
 */
import { supabase } from './supabase'

// ─────────────────────────────────────────
// PRODUCTS
// ─────────────────────────────────────────

/**
 * Récupère tous les produits actifs (pour le site public)
 * @param {{ category?: string }} filters
 */
export async function getPublicProducts(filters = {}) {
  let query = supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (filters.category) {
    query = query.eq('category', filters.category)
  }

  const { data, error } = await query
  if (error) console.error('[getPublicProducts]', error.message)
  return data ?? []
}

/**
 * Récupère tous les produits (admin — actifs + inactifs)
 */
export async function getAllProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) console.error('[getAllProducts]', error.message)
  return data ?? []
}

/**
 * Récupère un produit par son UUID
 * @param {string} id
 */
export async function getProductById(id) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()
  if (error) console.error('[getProductById]', error.message)
  return data ?? null
}

/**
 * Crée ou met à jour un produit (admin)
 * @param {object} product
 */
export async function upsertProduct(product) {
  const { data, error } = await supabase
    .from('products')
    .upsert(product)
    .select()
    .single()
  return { data, error }
}

/**
 * Supprime un produit (admin)
 * @param {string} id
 */
export async function deleteProduct(id) {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)
  return { error }
}

/**
 * Liste les catégories uniques depuis la table products
 */
export async function getCategories() {
  const { data, error } = await supabase
    .from('products')
    .select('category')
    .eq('is_active', true)
  if (error) console.error('[getCategories]', error.message)
  const unique = [...new Set((data ?? []).map(p => p.category))]
  return unique
}

// ─────────────────────────────────────────
// ORDERS
// ─────────────────────────────────────────

/**
 * Enregistre une commande (public — silencieux si échec)
 * @param {{ product_id?: string, product_name?: string, customer_name?: string, customer_phone: string, message?: string }} orderData
 */
export async function createOrder(orderData) {
  try {
    const { error } = await supabase.from('orders').insert(orderData)
    if (error) console.error('[createOrder]', error.message)
    return !error
  } catch (e) {
    console.error('[createOrder] Exception:', e)
    return false
  }
}

/**
 * Récupère toutes les commandes triées (admin)
 */
export async function getAllOrders() {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      products (name_fr, name_ar, image_url)
    `)
    .order('created_at', { ascending: false })
  if (error) console.error('[getAllOrders]', error.message)
  return data ?? []
}

/**
 * Met à jour le statut d'une commande (admin)
 * @param {string} id
 * @param {'nouveau'|'traité'|'annulé'} status
 */
export async function updateOrderStatus(id, status) {
  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', id)
  return { error }
}

// ─────────────────────────────────────────
// SITE CONTENT
// ─────────────────────────────────────────

/**
 * Récupère tous les textes éditables
 * @returns {Record<string, { value_fr: string, value_ar: string | null }>}
 */
export async function getSiteContent() {
  const { data, error } = await supabase
    .from('site_content')
    .select('*')
  if (error) console.error('[getSiteContent]', error.message)

  // Transformer le tableau en objet key → { value_fr, value_ar }
  const map = {}
  for (const row of data ?? []) {
    map[row.key] = { value_fr: row.value_fr, value_ar: row.value_ar }
  }
  return map
}

/**
 * Sauvegarde (upsert) un ou plusieurs contenus éditoriaux (admin)
 * @param {Array<{ key: string, value_fr: string, value_ar?: string }>} rows
 */
export async function saveSiteContent(rows) {
  const { error } = await supabase
    .from('site_content')
    .upsert(rows, { onConflict: 'key' })
  return { error }
}

// ─────────────────────────────────────────
// STORAGE — Upload image produit
// ─────────────────────────────────────────

/**
 * Upload une image dans le bucket product-images
 * @param {File} file
 * @param {string} fileName — nom unique (ex: uuid.jpg)
 * @returns {string | null} URL publique
 */
export async function uploadProductImage(file, fileName) {
  const { error } = await supabase.storage
    .from('product-images')
    .upload(fileName, file, { upsert: true })

  if (error) {
    console.error('[uploadProductImage]', error.message)
    return null
  }

  const { data } = supabase.storage
    .from('product-images')
    .getPublicUrl(fileName)

  return data.publicUrl
}
