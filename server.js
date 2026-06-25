const express = require('express');
const cors = require('cors');
const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

app.post('/send', async (req, res) => {
  const { instance, token, phone, message } = req.body;
  try {
    const url = `https://api.green-api.com/waInstance${instance}/sendMessage/${token}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatId: phone + '@c.us', message })
    });
    const data = await response.json();
    res.json({ success: !!data.idMessage, idMessage: data.idMessage });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/', (req, res) => res.json({ status: 'Spicy Restaurant Proxy Running!' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Proxy running on port', PORT));
