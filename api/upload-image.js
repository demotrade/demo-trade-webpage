import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://netwmohjucdoomghiuzk.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ldHdtb2hqdWNkb29tZ2hpdXprIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4Mjk1ODMwNSwiZXhwIjoyMDk4NTM0MzA1fQ.MZs0tlNQovIvK127FqbQORe73A97BfZY68RH4LXKz9A';

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

export default async function handler(req, res) {
  // CORS support
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Csak POST kérés engedélyezett.' });
  }

  try {
    const { imageBase64, filename = 'image.jpg', folder = 'posts' } = req.body || {};

    if (!imageBase64) {
      return res.status(400).json({ success: false, message: 'Hiányzó képadat (imageBase64).' });
    }

    // Parse Data URL: data:image/jpeg;base64,...
    const matches = imageBase64.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
    let mimeType = 'image/jpeg';
    let base64Data = imageBase64;

    if (matches && matches.length === 3) {
      mimeType = matches[1];
      base64Data = matches[2];
    }

    const buffer = Buffer.from(base64Data, 'base64');
    const ext = mimeType.includes('png') ? 'png' : (mimeType.includes('webp') ? 'webp' : 'jpg');
    
    // Clean filename
    const cleanName = filename
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 40) || 'upload';

    const storagePath = `${folder}/${Date.now()}-${cleanName}.${ext}`;

    const { data: uploadData, error: uploadErr } = await supabaseAdmin.storage
      .from('webpage-images')
      .upload(storagePath, buffer, {
        contentType: mimeType,
        upsert: true
      });

    if (uploadErr) {
      console.error('Supabase storage upload error:', uploadErr);
      return res.status(500).json({ success: false, message: 'Feltöltési hiba: ' + uploadErr.message });
    }

    const { data: pubData } = supabaseAdmin.storage
      .from('webpage-images')
      .getPublicUrl(storagePath);

    return res.status(200).json({
      success: true,
      publicUrl: pubData.publicUrl,
      path: storagePath
    });
  } catch (err) {
    console.error('Server error in upload-image:', err);
    return res.status(500).json({ success: false, message: 'Szerverhiba: ' + err.message });
  }
}
