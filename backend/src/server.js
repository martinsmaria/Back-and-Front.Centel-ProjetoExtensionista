import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// --- In-memory data (demo) ---
const users = {
  admin: { pass: 'admin123', role: 'admin', name: 'Admin' },
  atendente: { pass: 'ate123', role: 'atendente', name: 'Atendente' },
  tecnico: { pass: 'tec123', role: 'tecnico', name: 'Técnico' },
};

let clients = [
  { id: 1, name: 'Matheus Knupp', phone: '31 99973-1252', email: 'matheus@email.com', cpf: '12345678901', cep: '35160123', address: 'Rua das Flores, 123, Centro' },
  { id: 2, name: 'Maria Eduarda', phone: '31 99326-8121', email: 'maria@email.com', cpf: '98765432109', cep: '35160456', address: 'Avenida Principal, 456, Bairro Novo' },
];

let serviceOrders = [
  { id: 1, clientId: 1, clientName: 'Matheus Knupp', product: 'TV Samsung 50"', description: 'Não liga', date: '2025-10-01', status: 'em-andamento', paymentStatus: 'Pendente', observation: 'Cliente relata que o aparelho desligou subitamente. Suspeita de fonte.' },
  { id: 2, clientId: 2, clientName: 'Maria Eduarda', product: 'Notebook Dell', description: 'Tela quebrada', date: '2025-10-03', status: 'aguardando', paymentStatus: 'Pendente', observation: '' },
  { id: 3, clientId: 1, clientName: 'Matheus Knupp', product: 'Soundbar JBL', description: 'Sem som', date: '2025-09-25', status: 'finalizada', paymentStatus: 'Pago', observation: 'Troca do circuito de áudio. Testado e funcionando perfeitamente.' },
];

let items = [
  { id: 1, name: 'Tela LED 42"', brand: 'LG', model: '42LN5400', quantity: 5 },
  { id: 2, name: 'Capacitor 1000uF', brand: 'Samsung', model: 'Eletrolítico', quantity: 23 },
  { id: 3, name: 'Cabo HDMI 2m', brand: 'Philips', model: 'Genérico', quantity: 10 },
];

function nextId(list) {
  return list.length ? Math.max(...list.map((e) => e.id)) + 1 : 1;
}

// --- Auth ---
app.post('/auth/login', (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ message: 'Usuário e senha são obrigatórios' });
    }
    const user = users[username];
    if (!user || user.pass !== password) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }
    // demo token only
    return res.json({ token: 'demo-token', user: { username, role: user.role, name: user.name } });
  } catch (error) {
    console.error('Erro no login:', error);
    return res.status(500).json({ message: 'Erro ao processar login' });
  }
});

// --- Clients ---
app.get('/clients', (req, res) => {
  res.json(clients);
});

app.post('/clients', (req, res) => {
  const { name, phone, email, cpf, cep, address } = req.body || {};
  if (!name || !phone || !cpf || !cep || !address) {
    return res.status(400).json({ message: 'Campos obrigatórios ausentes' });
  }
  const newClient = { id: nextId(clients), name, phone, email: email || null, cpf, cep, address };
  clients.push(newClient);
  res.status(201).json(newClient);
});

app.put('/clients/:id', (req, res) => {
  const id = Number(req.params.id);
  const idx = clients.findIndex((c) => c.id === id);
  if (idx === -1) return res.status(404).json({ message: 'Cliente não encontrado' });
  clients[idx] = { ...clients[idx], ...req.body };
  res.json(clients[idx]);
});

app.delete('/clients/:id', (req, res) => {
  const id = Number(req.params.id);
  clients = clients.filter((c) => c.id !== id);
  serviceOrders = serviceOrders.filter((o) => o.clientId !== id);
  res.status(204).end();
});

// --- Service Orders ---
app.get('/orders', (req, res) => {
  res.json(serviceOrders);
});

app.post('/orders', (req, res) => {
  const { clientId, product, description } = req.body || {};
  if (!clientId || !product || !description) {
    return res.status(400).json({ message: 'Campos obrigatórios ausentes' });
  }
  const client = clients.find((c) => c.id === Number(clientId));
  if (!client) return res.status(404).json({ message: 'Cliente não encontrado' });
  const newOrder = {
    id: nextId(serviceOrders),
    clientId: client.id,
    clientName: client.name,
    product,
    description,
    date: new Date().toISOString().slice(0, 10),
    status: 'em-andamento',
    paymentStatus: 'Pendente',
    observation: '',
  };
  serviceOrders.push(newOrder);
  res.status(201).json(newOrder);
});

app.put('/orders/:id', (req, res) => {
  const id = Number(req.params.id);
  const idx = serviceOrders.findIndex((o) => o.id === id);
  if (idx === -1) return res.status(404).json({ message: 'OS não encontrada' });
  serviceOrders[idx] = { ...serviceOrders[idx], ...req.body };
  res.json(serviceOrders[idx]);
});

app.patch('/orders/:id/status', (req, res) => {
  const id = Number(req.params.id);
  const { status } = req.body || {};
  const os = serviceOrders.find((o) => o.id === id);
  if (!os) return res.status(404).json({ message: 'OS não encontrada' });
  os.status = status;
  res.json(os);
});

app.patch('/orders/:id/payment', (req, res) => {
  const id = Number(req.params.id);
  const { paymentStatus } = req.body || {};
  const os = serviceOrders.find((o) => o.id === id);
  if (!os) return res.status(404).json({ message: 'OS não encontrada' });
  os.paymentStatus = paymentStatus;
  res.json(os);
});

app.patch('/orders/:id/observation', (req, res) => {
  const id = Number(req.params.id);
  const { observation } = req.body || {};
  const os = serviceOrders.find((o) => o.id === id);
  if (!os) return res.status(404).json({ message: 'OS não encontrada' });
  os.observation = observation || '';
  res.json(os);
});

app.delete('/orders/:id', (req, res) => {
  const id = Number(req.params.id);
  serviceOrders = serviceOrders.filter((o) => o.id !== id);
  res.status(204).end();
});

// --- Items (Stock) ---
app.get('/items', (req, res) => {
  res.json(items);
});

app.post('/items', (req, res) => {
  const { name, brand, model, quantity } = req.body || {};
  if (!name) return res.status(400).json({ message: 'Nome é obrigatório' });
  const newItem = { id: nextId(items), name, brand: brand || null, model: model || null, quantity: Number(quantity) || 0 };
  items.push(newItem);
  res.status(201).json(newItem);
});

app.put('/items/:id', (req, res) => {
  const id = Number(req.params.id);
  const idx = items.findIndex((i) => i.id === id);
  if (idx === -1) return res.status(404).json({ message: 'Item não encontrado' });
  items[idx] = { ...items[idx], ...req.body };
  res.json(items[idx]);
});

app.delete('/items/:id', (req, res) => {
  const id = Number(req.params.id);
  items = items.filter((i) => i.id !== id);
  res.status(204).end();
});

app.patch('/items/:id/adjust', (req, res) => {
  const id = Number(req.params.id);
  const { amount } = req.body || {};
  if (typeof amount !== 'number') return res.status(400).json({ message: 'amount deve ser numérico' });
  const item = items.find((i) => i.id === id);
  if (!item) return res.status(404).json({ message: 'Item não encontrado' });
  const newQty = item.quantity + amount;
  if (newQty < 0) return res.status(400).json({ message: 'Quantidade não pode ser negativa' });
  item.quantity = newQty;
  res.json(item);
});

app.get('/', (_req, res) => {
  res.json({ status: 'ok', service: 'centel-backend' });
});

// Error handling middleware (must be after all routes)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Erro interno do servidor', error: err.message });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Rota não encontrada' });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`API running on http://localhost:${PORT}`);
});


