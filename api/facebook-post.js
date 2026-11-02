/**
 * Meta Graph API Facebook Megosztó Végpont (Vercel Serverless Function)
 * Demo-Trade Kft. Adminisztrációs Rendszer
 * 
 * Környezeti változók:
 * - FB_PAGE_ID: A Demo-Trade Facebook Oldal azonosítója (pl. 'demotradekft' vagy numerikus ID)
 * - FB_PAGE_ACCESS_TOKEN: A tartós Facebook Page Token (pages_manage_posts jogosultsággal)
 */

export default async function handler(req, res) {
  // CORS engedélyezése
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
    const { 
      message, 
      imageUrl, 
      linkUrl, 
      published = true 
    } = req.body || {};

    if (!message || message.trim() === '') {
      return res.status(400).json({ 
        success: false, 
        message: 'A Facebook poszt szövege nem lehet üres!' 
      });
    }

    const FB_PAGE_ID = process.env.FB_PAGE_ID;
    const FB_PAGE_ACCESS_TOKEN = process.env.FB_PAGE_ACCESS_TOKEN;

    // Szimulált / Teszt mód, ha a tokenek még nincsenek beállítva
    if (!FB_PAGE_ID || !FB_PAGE_ACCESS_TOKEN) {
      console.warn('Facebook hitelesítési adatok hiányoznak a környezeti változókból (FB_PAGE_ID / FB_PAGE_ACCESS_TOKEN). Szimulált posztolás aktív.');
      return res.status(200).json({
        success: true,
        isSimulated: true,
        message: 'Szimulált Facebook közzététel sikeres! (A végleges élesítéshez adja meg a FB_PAGE_ID és FB_PAGE_ACCESS_TOKEN kulcsokat a környezeti változókban.)',
        postId: 'simulated_' + Date.now(),
        postUrl: 'https://www.facebook.com/demotradekft'
      });
    }

    let graphUrl = '';
    let bodyPayload = {};

    // Ha van kép, /photos végpontra posztolunk (sokkal nagyobb organikus elérés a hírfolyamban)
    if (imageUrl && (imageUrl.startsWith('http://') || imageUrl.startsWith('https://'))) {
      graphUrl = `https://graph.facebook.com/v19.0/${FB_PAGE_ID}/photos`;
      bodyPayload = {
        url: imageUrl,
        caption: message + (linkUrl ? `\n\n👉 Bővebben a weboldalunkon:\n${linkUrl}` : ''),
        published: published,
        access_token: FB_PAGE_ACCESS_TOKEN
      };
    } else {
      // Normál szöveges / link poszt a /feed végpontra
      graphUrl = `https://graph.facebook.com/v19.0/${FB_PAGE_ID}/feed`;
      bodyPayload = {
        message: message,
        link: linkUrl || undefined,
        published: published,
        access_token: FB_PAGE_ACCESS_TOKEN
      };
    }

    // Graph API hívás
    const fbResponse = await fetch(graphUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(bodyPayload)
    });

    const fbData = await fbResponse.json();

    if (!fbResponse.ok || fbData.error) {
      console.error('Meta Graph API hiba:', fbData.error);
      return res.status(500).json({
        success: false,
        message: `Facebook hiba: ${fbData.error?.message || 'Nem sikerült közzétenni a posztot.'}`,
        error: fbData.error
      });
    }

    const postId = fbData.id || fbData.post_id;
    const postUrl = `https://www.facebook.com/${postId}`;

    return res.status(200).json({
      success: true,
      message: 'A bejegyzés sikeresen megjelent a Facebook oldalon!',
      postId: postId,
      postUrl: postUrl
    });

  } catch (err) {
    console.error('Hiba a /api/facebook-post hívásakor:', err);
    return res.status(500).json({
      success: false,
      message: 'Szerverhiba történt a Facebook poszt feldolgozásakor: ' + err.message
    });
  }
}
