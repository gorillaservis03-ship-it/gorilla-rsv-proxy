// api/vehicletechnicaldata.js
// Vercel Serverless Function: RSV proxy
// Route: /api/vehicletechnicaldata?vin=... | ?tp=... | ?orv=...
// Env: DOV_API_KEY

module.exports = async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,API_KEY');
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  try {
    const { vin, tp, orv } = req.query || {};
    const key = vin ? 'vin' : tp ? 'tp' : orv ? 'orv' : null;
    const value = vin || tp || orv;

    if (!key || !value) {
      return res.status(400).json({ Status: 0, Message: 'Missing query parameter: vin | tp | orv' });
    }

    const API_KEY = process.env.DOV_API_KEY;
    if (!API_KEY) {
      return res.status(500).json({ Status: 0, Message: 'Server misconfigured: DOV_API_KEY missing' });
    }

    const upstream = `https://api.dataovozidlech.cz/api/vehicletechnicaldata/v2?${key}=${encodeURIComponent(value)}`;

    const r = await fetch(upstream, {
      headers: {
        'Accept': 'application/json',
        'API_KEY': API_KEY
      }
    });

    const text = await r.text();
    let data;
    try { data = JSON.parse(text); } catch { data = { _raw: text }; }

    res.status(r.status).json(data);
  } catch (err) {
    res.status(502).json({ Status: 0, Message: 'Proxy error', Error: String(err?.message || err) });
  }
};
