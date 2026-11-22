const express = require('express'); const { Pool } = require('pg');
const app = express(); app.use(express.json());
const pool = new Pool({ host: process.env.DB_HOST, database: process.env.DB_NAME,
  user: process.env.DB_USER, password: process.env.DB_PASSWORD });
(async () => { for (let i = 0; i < 30; i++) { try {
  await pool.query('CREATE TABLE IF NOT EXISTS orders(id SERIAL PRIMARY KEY, user_id INT, product_id TEXT, qty INT, total NUMERIC, created TIMESTAMP DEFAULT now())'); return;
} catch (e) { await new Promise(r => setTimeout(r, 3000)); } } })();
app.get('/healthz', (q, r) => r.send('ok'));
app.get('/readyz', async (q, r) => { try { await pool.query('SELECT 1'); r.send('ok'); } catch { r.sendStatus(503); } });
app.get('/api/orders', async (q, r) => r.json((await pool.query('SELECT * FROM orders ORDER BY id DESC')).rows));
app.post('/api/orders', async (q, r) => { try {
  const { userId, productId, qty } = q.body;
  const u = await fetch(`${process.env.USER_SERVICE_URL}/api/users/${userId}`);
  const p = await fetch(`${process.env.PRODUCT_SERVICE_URL}/api/products/${productId}`);
  if (!u.ok || !p.ok) return r.status(400).json({ error: 'unknown user or product' });
  const prod = await p.json();
  const x = await pool.query('INSERT INTO orders(user_id,product_id,qty,total) VALUES($1,$2,$3,$4) RETURNING *', [userId, productId, qty, prod.price * qty]);
  r.status(201).json(x.rows[0]);
} catch (e) { r.status(500).json({ error: e.message }); } });
app.listen(3000);
