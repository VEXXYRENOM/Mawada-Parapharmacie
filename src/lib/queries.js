/**
 * queries.js — Fonctions d'accès aux données Supabase
 * Toutes les fonctions retournent { data, error } ou la donnée directement.
 * Les erreurs sont loguées mais ne bloquent jamais l'UX.
 *
 * Tables Supabase requises :
 *  - products      : ajouter colonne `original_price float8 nullable`
 *  - promo_codes   : voir schéma ci-dessous
 *
 * SQL à exécuter dans Supabase SQL Editor :
 *
 *   ALTER TABLE products ADD COLUMN IF NOT EXISTS original_price float8;
 *
 *   CREATE TABLE IF NOT EXISTS promo_codes (
 *     id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
 *     code          text UNIQUE NOT NULL,
 *     discount_type text NOT NULL DEFAULT 'percentage',  -- 'percentage' | 'fixed'
 *     discount_value numeric(10,2) NOT NULL DEFAULT 0,
 *     expires_at    timestamptz,
 *     max_uses      int,
 *     current_uses  int NOT NULL DEFAULT 0,
 *     is_active     boolean NOT NULL DEFAULT true,
 *     created_at    timestamptz DEFAULT now()
 *   );
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
// PRODUCT REQUESTS
// ─────────────────────────────────────────

/**
 * Enregistre une demande de produit (public — silencieux si échec)
 */
export async function createProductRequest(requestData) {
  try {
    const { error } = await supabase.from('product_requests').insert(requestData)
    if (error) console.error('[createProductRequest]', error.message)
    return !error
  } catch (e) {
    console.error('[createProductRequest] Exception:', e)
    return false
  }
}

/**
 * Récupère toutes les demandes de produits (admin)
 */
export async function getAllProductRequests() {
  const { data, error } = await supabase
    .from('product_requests')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) console.error('[getAllProductRequests]', error.message)
  return data ?? []
}

/**
 * Met à jour le statut d'une demande (admin)
 */
export async function updateProductRequestStatus(id, status) {
  const { error } = await supabase
    .from('product_requests')
    .update({ status })
    .eq('id', id)
  return { error }
}

/**
 * Supprime une demande (admin)
 */
export async function deleteProductRequest(id) {
  const { error } = await supabase
    .from('product_requests')
    .delete()
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

// ─────────────────────────────────────────
// PROMO CODES
// ─────────────────────────────────────────

/**
 * Récupère tous les codes promo (admin)
 */
export async function getAllPromoCodes() {
  const { data, error } = await supabase
    .from('promo_codes')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) console.error('[getAllPromoCodes]', error.message)
  return data ?? []
}

/**
 * Crée un nouveau code promo (admin)
 * @param {{ code: string, discount_type: 'percentage'|'fixed', discount_value: number, expires_at?: string|null, max_uses?: number|null, is_active: boolean }} promo
 */
export async function createPromoCode(promo) {
  const { data, error } = await supabase
    .from('promo_codes')
    .insert(promo)
    .select()
    .single()
  return { data, error }
}

/**
 * Met à jour un code promo (admin)
 * @param {string} id
 * @param {object} updates
 */
export async function updatePromoCode(id, updates) {
  const { data, error } = await supabase
    .from('promo_codes')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  return { data, error }
}

/**
 * Supprime un code promo (admin)
 * @param {string} id
 */
export async function deletePromoCode(id) {
  const { error } = await supabase
    .from('promo_codes')
    .delete()
    .eq('id', id)
  return { error }
}

/**
 * Valide un code promo côté public
 * Retourne { valid: true, promo } ou { valid: false, reason: string }
 * @param {string} code
 */
export async function validatePromoCode(code) {
  const { data, error } = await supabase
    .from('promo_codes')
    .select('*')
    .eq('code', code.trim().toUpperCase())
    .eq('is_active', true)
    .single()

  if (error || !data) return { valid: false, reason: 'Code invalide ou inexistant.' }

  // Vérifier expiration
  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    return { valid: false, reason: 'Ce code promo a expiré.' }
  }

  // Vérifier limite d'utilisations
  if (data.max_uses !== null && data.current_uses >= data.max_uses) {
    return { valid: false, reason: 'Ce code promo a atteint sa limite d\'utilisation.' }
  }

  return { valid: true, promo: data }
}

/**
 * Incrémente le compteur d'utilisations d'un code promo
 * @param {string} id
 */
export async function incrementPromoUsage(id) {
  const { error } = await supabase.rpc('increment_promo_usage', { promo_id: id })
  // Fallback manuel si la fonction RPC n'existe pas
  if (error) {
    const { data: current } = await supabase
      .from('promo_codes')
      .select('current_uses')
      .eq('id', id)
      .single()
    if (current) {
      await supabase
        .from('promo_codes')
        .update({ current_uses: (current.current_uses ?? 0) + 1 })
        .eq('id', id)
    }
  }
}
