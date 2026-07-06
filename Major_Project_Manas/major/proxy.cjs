// proxy.cjs
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json());

const RESEND_API_KEY = process.env.VITE_RESEND_API_KEY;

app.post('/api/send-email', async (req, res) => {
  console.log('Sending with key:', RESEND_API_KEY?.slice(0, 10) + '...'); // Debug
  
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(req.body),
  });

  const data = await response.json();
  console.log('Resend response:', data);
  res.status(response.status).json(data);
});

app.listen(3001, () => console.log('✅ Proxy running on http://localhost:3001'));