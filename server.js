const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ status: 'Spicy Restaurant Proxy Running!' });
});

app.post('/send', async (req, res) => {
  const { instance, token, phone, message } = req.body;
  if (!instance || !token || !phone || !message) {
    return res.status(400).json({ success: false, error: 'Missing fields' });
  }
  const chatId = phone.replace(/\D/g,'') + '@c.us';
  try {
    const https = require('https');
    const postData = JSON.stringify({ chatId, message });
    const options = {
      hostname: 'api.green-api.com',
      path: `/waInstance${instance}/sendMessage/${token}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    const result = await new Promise((resolve, reject) => {
      const req2 = https.request(options, (res2) => {
        let data = '';
        res2.on('data', chunk => data += chunk);
        res2.on('end', () => {
          try { resolve(JSON.parse(data)); }
          catch(e) { resolve({ raw: data }); }
        });
      });
      req2.on('error', reject);
      req2.write(postData);
      req2.end();
    });
    if (result.idMessage) {
      return res.json({ success: true, idMessage: result.idMessage });
    } else {
      return res.status(500).json({ success: false, error: result });
    }
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/test', async (req, res) => {
  const { instance, token, phone } = req.query;
  if (!instance || !token || !phone) {
    return res.json({ info: 'Add ?instance=XXX&token=YYY&phone=91XXXXXXXXXX' });
  }
  const https = require('https');
  const postData = JSON.stringify({ chatId: phone + '@c.us', message: '🌶️ TEST - Spicy Restaurant!' });
  const options = {
    hostname: 'api.green-api.com',
    path: `/waInstance${instance}/sendMessage/${token}`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(postData) }
  };
  const result = await new Promise((resolve, reject) => {
    const r = https.request(options, (res2) => {
      let d = '';
      res2.on('data', c => d += c);
      res2.on('end', () => { try { resolve(JSON.parse(d)); } catch(e) { resolve({raw:d}); }});
    });
    r.on('error', reject);
    r.write(postData);
    r.end();
  });
  res.json({ success: !!result.idMessage, response: result });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Proxy running on port', PORT));
