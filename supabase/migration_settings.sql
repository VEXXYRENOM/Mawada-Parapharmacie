-- Exécuter ceci dans l'éditeur SQL de Supabase pour ajouter les paramètres de configuration.

INSERT INTO site_content (key, value_fr) VALUES
  ('whatsapp_number', '21623104341'),
  ('facebook_url', 'https://www.facebook.com/profile.php?id=100063516752985'),
  ('messenger_url', 'https://m.me/MawadaParapharmacie'),
  ('pixel_id', '')
ON CONFLICT (key) DO NOTHING;
