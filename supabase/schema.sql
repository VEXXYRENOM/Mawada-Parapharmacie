-- ============================================================
-- Mawada Parapharmacie — Supabase Schema
-- Exécuter dans : Supabase Dashboard > SQL Editor > New query
-- ============================================================

-- ─────────────────────────────────────────
-- 1. Table PRODUCTS
-- ─────────────────────────────────────────
create table if not exists products (
  id          uuid primary key default gen_random_uuid(),
  category    text not null,
  name_fr     text not null,
  name_ar     text,
  brand       text not null default '',
  price       numeric(10,2) not null default 0,
  original_price float8,               -- ancien prix (barré en rouge si > price)
  description_fr text,
  description_ar text,
  badge       text,
  image_url   text,
  is_active   boolean not null default true,
  in_stock    boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ─────────────────────────────────────────
-- 2. Table ORDERS
-- ─────────────────────────────────────────
create table if not exists orders (
  id              uuid primary key default gen_random_uuid(),
  product_id      uuid references products(id) on delete set null,
  product_name    text,
  customer_name   text,
  customer_phone  text,
  message         text,
  status          text not null default 'nouveau'
                  check (status in ('nouveau', 'traité', 'annulé')),
  total_price     numeric(10,2),
  cart_items      jsonb,
  created_at      timestamptz not null default now()
);

-- ─────────────────────────────────────────
-- 3. Table SITE_CONTENT (key-value)
-- ─────────────────────────────────────────
create table if not exists site_content (
  key        text primary key,
  value_fr   text not null default '',
  value_ar   text
);

-- Insérer les clés par défaut (textes actuels du site)
insert into site_content (key, value_fr, value_ar) values
  ('hero_title',    'Soin', 'عناية'),
  ('hero_title2',   'Confiance', 'ثقة'),
  ('hero_title3',   'Féminité', 'أنوثة'),
  ('hero_subtitle', 'Votre parapharmacie de confiance à Kasserine. Des produits authentiques, soigneusement sélectionnés pour prendre soin de vous et de votre famille.',
                    'صيدليتك الموثوقة في القصرين. منتجات أصيلة مختارة بعناية للاعتناء بك وبعائلتك.'),
  ('about_story',   'Née de la passion pour la beauté authentique et le bien-être, Mawada Parapharmacie est votre destination de confiance à Kasserine pour des produits soigneusement sélectionnés.',
                    'ولدت من شغف بالجمال الحقيقي والعافية، مواده باراصيدلية هي وجهتك الموثوقة في القصرين للمنتجات المختارة بعناية.'),
  ('about_story2',  'Chaque produit que nous proposons a été testé et vérifié pour garantir son authenticité et son efficacité. Nous croyons que chaque femme mérite le meilleur.',
                    'كل منتج نقدمه تم اختباره والتحقق منه لضمان أصالته وفعاليته. نؤمن بأن كل امرأة تستحق الأفضل.'),
  ('testimonial_1_text',  'Je commande régulièrement les vitamines Kinder Health pour mes enfants. La qualité est irréprochable et le service est excellent. Je recommande vivement Mawada !',
                           'أطلب منتجات كيندر هيلث بانتظام لأطفالي. الجودة ممتازة والخدمة رائعة. أنصح بمواده بشدة!'),
  ('testimonial_1_name',  'Fatma Ben Ali', 'فاطمة بن علي'),
  ('testimonial_2_text',  'Le sérum vitamine C a transformé ma peau en 3 semaines ! Des produits authentiques, pas de contrefaçon. L''équipe conseille vraiment bien selon le type de peau.',
                           'سيروم فيتامين سي غيّر بشرتي في 3 أسابيع! منتجات أصلية، والفريق ينصح جيداً حسب نوع البشرة.'),
  ('testimonial_2_name',  'Salma Trabelsi', 'سلمى الطرابلسي'),
  ('testimonial_3_text',  'La crème pour bébé est absolument parfaite pour la peau sensible de ma petite. Zéro irritation, texture douce comme de la soie. Merci Mawada pour votre confiance !',
                           'كريم الطفل مثالي للبشرة الحساسة. لا تهيج، ملمس ناعم. شكراً مواده على ثقتكم!'),
  ('testimonial_3_name',  'Meriem Jlassi', 'مريم الجلاصي'),
  ('testimonial_4_text',  'Commande via WhatsApp super rapide ! J''ai reçu ma commande en moins d''une heure. Les produits sont exactement comme décrits. Shop de confiance absolue.',
                           'الطلب عبر واتساب سريع جداً! تلقيت طلبي في أقل من ساعة. المنتجات تماماً كما وصفت.'),
  ('testimonial_4_name',  'Hana Saidi', 'هناء سعيدي'),
  ('testimonial_5_text',  'Le highlighter Aurora est mon coup de cœur depuis des mois. Jamais trouvé ça ailleurs à Kasserine. Mawada Parapharmacie est mon adresse beauté préférée !',
                           'هايلايتر أورورا أفضل ما لديّ منذ أشهر. لم أجده في مكان آخر بالقصرين. مواده هي عنواني للجمال!'),
  ('testimonial_5_name',  'Rania Hamdi', 'رانيا حمدي'),
  ('whatsapp_number',     '21623104341', ''),
  ('facebook_url',        'https://www.facebook.com/profile.php?id=100063516752985', ''),
  ('messenger_url',       'https://m.me/MawadaParapharmacie', ''),
  ('pixel_id',            '', '')
on conflict (key) do nothing;

-- ─────────────────────────────────────────
-- 5. Table PRODUCT_REQUESTS (Demandes de produits)
-- ─────────────────────────────────────────
create table if not exists product_requests (
  id              uuid primary key default gen_random_uuid(),
  customer_name   text not null,
  customer_contact text not null,
  product_name    text not null,
  status          text not null default 'nouveau' check (status in ('nouveau', 'contacté')),
  created_at      timestamptz not null default now()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Activer RLS sur toutes les tables
alter table products    enable row level security;
alter table orders      enable row level security;
alter table site_content enable row level security;
alter table product_requests enable row level security;

-- ─────────────────────────────────────────
-- RLS : PRODUCTS
-- ─────────────────────────────────────────
-- Lecture publique : uniquement les produits actifs
create policy "products_public_read"
  on products for select
  to anon
  using (is_active = true);

-- Lecture complète pour l'admin connecté
create policy "products_auth_read_all"
  on products for select
  to authenticated
  using (true);

-- CRUD complet pour l'admin
create policy "products_auth_insert"
  on products for insert
  to authenticated
  with check (true);

create policy "products_auth_update"
  on products for update
  to authenticated
  using (true);

create policy "products_auth_delete"
  on products for delete
  to authenticated
  using (true);

-- ─────────────────────────────────────────
-- RLS : ORDERS
-- ─────────────────────────────────────────
-- Écriture publique : n'importe qui peut passer une commande
create policy "orders_public_insert"
  on orders for insert
  to anon
  with check (true);

-- Lecture + gestion réservées à l'admin
create policy "orders_auth_select"
  on orders for select
  to authenticated
  using (true);

create policy "orders_auth_update"
  on orders for update
  to authenticated
  using (true);

create policy "orders_auth_delete"
  on orders for delete
  to authenticated
  using (true);

-- ─────────────────────────────────────────
-- RLS : PRODUCT_REQUESTS
-- ─────────────────────────────────────────
-- Écriture publique : n'importe qui peut soumettre une demande
create policy "product_requests_public_insert"
  on product_requests for insert
  to anon
  with check (true);

-- Lecture + gestion réservées à l'admin
create policy "product_requests_auth_select"
  on product_requests for select
  to authenticated
  using (true);

create policy "product_requests_auth_update"
  on product_requests for update
  to authenticated
  using (true);

create policy "product_requests_auth_delete"
  on product_requests for delete
  to authenticated
  using (true);

-- ─────────────────────────────────────────
-- RLS : SITE_CONTENT
-- ─────────────────────────────────────────
-- Lecture publique pour tous les textes du site
create policy "site_content_public_read"
  on site_content for select
  to anon
  using (true);

-- CRUD complet pour l'admin
create policy "site_content_auth_insert"
  on site_content for insert
  to authenticated
  with check (true);

create policy "site_content_auth_update"
  on site_content for update
  to authenticated
  using (true);

create policy "site_content_auth_delete"
  on site_content for delete
  to authenticated
  using (true);

-- ─────────────────────────────────────────
-- Storage : Policy pour product-images bucket
-- (à exécuter après création du bucket)
-- ─────────────────────────────────────────
-- Lecture publique des images
create policy "storage_public_read"
  on storage.objects for select
  to anon
  using (bucket_id = 'product-images');

-- Upload réservé à l'admin
create policy "storage_auth_upload"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'product-images');

create policy "storage_auth_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'product-images');

create policy "storage_auth_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'product-images');

-- ─────────────────────────────────────────
-- 4. Table PROMO_CODES
-- ─────────────────────────────────────────
create table if not exists promo_codes (
  id             uuid        default gen_random_uuid() primary key,
  code           text        unique not null,
  discount_type  text        not null default 'percentage',  -- 'percentage' | 'fixed'
  discount_value numeric(10,2) not null default 0,
  expires_at     timestamptz,           -- null = pas d'expiration
  max_uses       int,                   -- null = illimité
  current_uses   int         not null default 0,
  is_active      boolean     not null default true,
  created_at     timestamptz default now()
);

create index if not exists promo_codes_code_idx on promo_codes (code);

-- RLS : PROMO_CODES
alter table promo_codes enable row level security;

-- Lecture publique pour valider un code (site public)
create policy "promo_codes_public_read"
  on promo_codes for select
  to anon
  using (is_active = true);

-- CRUD complet pour l'admin
create policy "promo_codes_auth_all"
  on promo_codes for all
  to authenticated
  using (true)
  with check (true);

-- ─────────────────────────────────────────
-- MIGRATION : à exécuter si la base existe déjà
-- (ajoute original_price et in_stock si la table products est créée sans elle)
-- ─────────────────────────────────────────
alter table products
  add column if not exists original_price float8;

alter table products
  add column if not exists in_stock boolean not null default true;
