const express = require('express');
const cors = require('cors');
const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'Spicy Restaurant Proxy Running!' });
});

// Send WhatsApp message via Green API
app.post('/send', async (req, res) => {
  console.log('Received request:', JSON.stringify(req.body));
  const { instance, token, phone, message } = req.body;

  if (!instance || !token || !phone || !message) {
    return res.status(400).json({ success: false, error: 'Missing fields: instance, token, phone, message required' });
  }

  const cleanPhone = phone.replace(/\D/g, '');
  const chatId = cleanPhone + '@c.us';

  try {
    const url = `https://api.green-api.com/waInstance${instance}/sendMessage/${token}`;
    console.log('Calling Green API:', url);

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatId, message })
    });

    const text = await response.text();
    console.log('Green API raw response:', text);

    let data;
    try { data = JSON.parse(text); } catch(e) { data = { raw: text }; }

    if (data.idMessage) {
      console.log('SUCCESS! idMessage:', data.idMessage);
      return res.json({ success: true, idMessage: data.idMessage });
    } else {
      console.log('FAILED. Response:', data);
      return res.status(500).json({ success: false, error: data });
    }
  } catch (err) {
    console.error('Fetch error:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Test endpoint — call this from browser to verify
app.get('/test', async (req, res) => {
  const { instance, token, phone } = req.query;
  if (!instance || !token || !phone) {
    return res.json({ info: 'Add ?instance=XXX&token=YYY&phone=91XXXXXXXXXX to test' });
  }
  try {
    const url = `https://api.green-api.com/waInstance${instance}/sendMessage/${token}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatId: phone + '@c.us', message: '🌶️ TEST: Spicy Restaurant proxy working!' })
    });
    const data = await response.json();
    res.json({ success: !!data.idMessage, response: data });
  } catch(err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('✅ Proxy running on port', PORT));
