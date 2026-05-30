import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const distPath = path.join(__dirname, 'dist');

app.disable('x-powered-by');
app.use(express.json({ limit: '2mb' }));
app.use(express.static(distPath));

app.get('/health', (_req, res) => {
  res.json({ ok: true, app: 'milkii-hub', mode: process.env.NODE_ENV || 'development' });
});

app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Milkii Hub is serving on port ${PORT}`);
});
