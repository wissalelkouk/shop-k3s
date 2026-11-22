const express = require('express'); const { Pool } = require('pg');
const app = express(); app.use(express.json());
const pool = new Pool({ host: process.env.DB_HOST, database: process.env.DB_NAME,
  user: process.env.DB_USER, password: process.env.DB_PASSWORD });
(async () => { for (let i = 0; i < 30; i++) { try {
  await pool.query('CREATE TABLE IF NOT EXISTS users(id SERIAL PRIMARY KEY, name TEXT NOT NULL, email TEXT UNIQUE NOT NULL)'); return;
} catch (e) { await new Promise(r => setTimeout(r, 3000)); } } })();
app.get('/healthz', (q, r) => r.send('ok'));
app.get('/readyz', async (q, r) => { try { await pool.query('SELECT 1'); r.send('ok'); } catch { r.sendStatus(503); } });
app.get('/api/users', async (q, r) => r.json((await pool.query('SELECT * FROM users ORDER BY id')).rows));
app.get('/api/users/:id', async (q, r) => { const x = await pool.query('SELECT * FROM users WHERE id=$1', [q.params.id]); x.rows[0] ? r.json(x.rows[0]) : r.sendStatus(404); });
app.post('/api/users', async (q, r) => { try {
  const x = await pool.query('INSERT INTO users(name,email) VALUES($1,$2) RETURNING *', [q.body.name, q.body.email]); r.status(201).json(x.rows[0]);
} catch (e) { r.status(400).json({ error: e.message }); } });
app.listen(3000);
