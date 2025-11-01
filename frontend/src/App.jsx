import React, { useEffect, useMemo, useState } from 'react';
import { api } from './api.js';

function Nav({ current, setCurrent, user, onLogout }) {
  const links = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fa-home' },
    { id: 'orders', label: 'Ordens de Serviço', icon: 'fa-clipboard-list', roles: ['atendente', 'tecnico', 'admin'] },
    { id: 'clients', label: 'Clientes', icon: 'fa-users', roles: ['atendente', 'tecnico', 'admin'] },
    { id: 'stock', label: 'Estoque', icon: 'fa-box', roles: ['tecnico', 'admin'] },
    { id: 'reports', label: 'Relatórios', icon: 'fa-chart-line', roles: ['admin'] },
  ];
  return (
    <aside className="sidebar">
      <img src="https://i.imgur.com/2JKI95m.png" alt="Centel Logo" className="logo" onError={(e) => { 
        if (e.target.src.includes('.png')) {
          e.target.src = 'https://i.imgur.com/2JKI95m.jpg';
        } else {
          e.target.src = 'https://imgur.com/a/ZaT2ZTS#2JKI95m';
        }
      }} />
      <nav>
        {links.map((l) => {
          if (l.roles && !l.roles.includes(user.role)) return null;
          return (
            <a key={l.id} href="#" className={current === l.id ? 'active' : ''} onClick={(e) => { e.preventDefault(); setCurrent(l.id); }}>
              <i className={`fas ${l.icon}`}></i> {l.label}
            </a>
          );
        })}
      </nav>
      <div className="user-profile">
        <p>{user.name} ({user.role})</p>
        <button className="btn" onClick={onLogout}><i className="fas fa-sign-out-alt"></i> Sair</button>
      </div>
    </aside>
  );
}

function Login({ onLogin }) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  async function submit(e) {
    e.preventDefault();
    try {
      const result = await api('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) });
      onLogin(result.user);
    } catch (err) {
      setError('Usuário ou senha inválidos.');
    }
  }
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-dark)' }}>
      <div className="login-box" style={{ width: 380, padding: 40, background: 'var(--bg-medium)', borderRadius: 8, textAlign: 'center', border: '1px solid var(--border-color)' }}>
        <img src="https://i.imgur.com/2JKI95m.png" alt="Centel Logo" className="logo" style={{ width: 180, marginBottom: 30 }} onError={(e) => { 
          if (e.target.src.includes('.png')) {
            e.target.src = 'https://i.imgur.com/2JKI95m.jpg';
          } else {
            e.target.src = 'https://imgur.com/a/ZaT2ZTS#2JKI95m';
          }
        }} />
        <form onSubmit={submit}>
          <div className="input-group" style={{ textAlign: 'left', marginBottom: 20 }}>
            <label>Usuário</label>
            <input value={username} onChange={(e) => setUsername(e.target.value)} style={{ width: '100%', padding: 12, background: 'var(--bg-light)', border: '1px solid var(--border-color)', borderRadius: 5, color: 'var(--text-primary)', fontSize: 16 }} />
          </div>
          <div className="input-group" style={{ textAlign: 'left', marginBottom: 20 }}>
            <label>Senha</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: 12, background: 'var(--bg-light)', border: '1px solid var(--border-color)', borderRadius: 5, color: 'var(--text-primary)', fontSize: 16 }} />
          </div>
          {error && <p style={{ color: 'var(--danger)', marginTop: 15, fontSize: 14 }}>{error}</p>}
          <button className="btn btn-primary" style={{ width: '100%', padding: 12 }} type="submit">Entrar</button>
        </form>
      </div>
    </div>
  );
}

function Dashboard({ orders, clients, items }) {
  const andamento = orders.filter((o) => o.status === 'em-andamento').length;
  const aguardando = orders.filter((o) => o.status === 'aguardando').length;
  const totalItems = items.reduce((s, i) => s + Number(i.quantity || 0), 0);
  return (
    <div>
      <h1>Dashboard</h1>
      <div className="card-container">
        <div className="card"><h3>Ordens em Andamento</h3><p className="value">{andamento}</p></div>
        <div className="card"><h3>Aguardando Peças</h3><p className="value">{aguardando}</p></div>
        <div className="card"><h3>Total de Itens em Estoque</h3><p className="value">{totalItems}</p></div>
        <div className="card"><h3>Clientes Cadastrados</h3><p className="value">{clients.length}</p></div>
      </div>
    </div>
  );
}

function ClientsPage({ refresh }) {
  const [list, setList] = useState([]);
  const [form, setForm] = useState({ id: null, name: '', cpf: '', phone: '', cep: '', email: '', address: '' });
  const load = async () => setList(await api('/clients'));
  useEffect(() => { load(); }, []);
  async function submit(e) {
    e.preventDefault();
    const payload = { ...form };
    if (form.id) {
      await api(`/clients/${form.id}`, { method: 'PUT', body: JSON.stringify(payload) });
    } else {
      await api('/clients', { method: 'POST', body: JSON.stringify(payload) });
    }
    setForm({ id: null, name: '', cpf: '', phone: '', cep: '', email: '', address: '' });
    await load();
    refresh();
  }
  async function remove(id) { await api(`/clients/${id}`, { method: 'DELETE' }); await load(); refresh(); }
  return (
    <div>
      <div className="page-header">
        <h1>Clientes</h1>
      </div>
      <div className="table-container">
        <form onSubmit={submit} style={{ marginBottom: 20, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          <input placeholder="Nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input placeholder="CPF" value={form.cpf} onChange={(e) => setForm({ ...form, cpf: e.target.value })} required />
          <input placeholder="Telefone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
          <input placeholder="CEP" value={form.cep} onChange={(e) => setForm({ ...form, cep: e.target.value })} required />
          <input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input placeholder="Endereço" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required />
          <button className="btn btn-primary" type="submit" style={{ gridColumn: '1 / -1', justifySelf: 'end' }}>{form.id ? 'Salvar' : 'Adicionar'}</button>
        </form>
        <table className="data-table">
          <thead><tr><th>ID</th><th>Nome</th><th>CPF</th><th>Telefone</th><th>Ações</th></tr></thead>
          <tbody>
            {list.map((c) => (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td>{c.name}</td>
                <td>{c.cpf}</td>
                <td>{c.phone}</td>
                <td>
                  <button className="btn" onClick={() => setForm(c)} title="Editar"><i className="fas fa-edit"></i></button>
                  <button className="btn" onClick={() => remove(c.id)} title="Excluir"><i className="fas fa-trash"></i></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function OrdersPage({ refresh, clients }) {
  const [list, setList] = useState([]);
  const [form, setForm] = useState({ clientId: '', product: '', description: '' });
  const load = async () => setList(await api('/orders'));
  useEffect(() => { load(); }, []);
  async function submit(e) {
    e.preventDefault();
    await api('/orders', { method: 'POST', body: JSON.stringify(form) });
    setForm({ clientId: '', product: '', description: '' });
    await load();
    refresh();
  }
  async function setStatus(id, status) { await api(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }); await load(); refresh(); }
  async function setPayment(id, paymentStatus) { await api(`/orders/${id}/payment`, { method: 'PATCH', body: JSON.stringify({ paymentStatus }) }); await load(); refresh(); }
  return (
    <div>
      <div className="page-header">
        <h1>Ordens de Serviço</h1>
      </div>
      <div className="table-container">
        <form onSubmit={submit} style={{ marginBottom: 20, display: 'grid', gridTemplateColumns: '1fr 1fr 2fr auto', gap: 12 }}>
          <select value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })} required>
            <option value="">Selecione um cliente...</option>
            {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input placeholder="Produto/Equipamento" value={form.product} onChange={(e) => setForm({ ...form, product: e.target.value })} required />
          <input placeholder="Descrição do Problema" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
          <button className="btn btn-primary" type="submit">Nova OS</button>
        </form>
        <table className="data-table">
          <thead><tr><th>Cód.</th><th>Cliente</th><th>Produto</th><th>Data</th><th>Status Técnico</th><th>Pagamento</th><th>Ações</th></tr></thead>
          <tbody>
            {list.map((o) => (
              <tr key={o.id}>
                <td>{String(o.id).padStart(4, '0')}</td>
                <td>{o.clientName}</td>
                <td>{o.product}</td>
                <td>{new Date(o.date).toLocaleDateString('pt-BR')}</td>
                <td><span className={`status ${o.status}`}>{o.status.replace('-', ' ')}</span></td>
                <td><span className={`status ${o.paymentStatus.toLowerCase()}`}>{o.paymentStatus}</span></td>
                <td>
                  <button className="btn" title="Em Andamento" onClick={() => setStatus(o.id, 'em-andamento')}><i className="fas fa-sync-alt"></i></button>
                  <button className="btn" title="Aguardando Peças" onClick={() => setStatus(o.id, 'aguardando')}><i className="fas fa-clock"></i></button>
                  <button className="btn" title="Finalizada" onClick={() => setStatus(o.id, 'finalizada')}><i className="fas fa-check"></i></button>
                  <button className="btn" title="Marcar Pago" onClick={() => setPayment(o.id, 'Pago')}><i className="fas fa-dollar-sign"></i></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StockPage({ refresh }) {
  const [list, setList] = useState([]);
  const [form, setForm] = useState({ id: null, name: '', brand: '', model: '', quantity: 0 });
  const load = async () => setList(await api('/items'));
  useEffect(() => { load(); }, []);
  async function submit(e) {
    e.preventDefault();
    const payload = { name: form.name, brand: form.brand, model: form.model, quantity: Number(form.quantity) || 0 };
    if (form.id) {
      await api(`/items/${form.id}`, { method: 'PUT', body: JSON.stringify(payload) });
    } else {
      await api('/items', { method: 'POST', body: JSON.stringify(payload) });
    }
    setForm({ id: null, name: '', brand: '', model: '', quantity: 0 });
    await load();
    refresh();
  }
  async function remove(id) { await api(`/items/${id}`, { method: 'DELETE' }); await load(); refresh(); }
  async function adjust(id, amount) { await api(`/items/${id}/adjust`, { method: 'PATCH', body: JSON.stringify({ amount }) }); await load(); refresh(); }
  return (
    <div>
      <div className="page-header">
        <h1>Estoque</h1>
      </div>
      <div className="table-container">
        <form onSubmit={submit} style={{ marginBottom: 20, display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 0.7fr auto', gap: 12 }}>
          <input placeholder="Nome do Item" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input placeholder="Marca" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
          <input placeholder="Modelo" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} />
          <input type="number" placeholder="Qtd." value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
          <button className="btn btn-primary" type="submit">{form.id ? 'Salvar' : 'Adicionar'}</button>
        </form>
        <table className="data-table">
          <thead><tr><th>Cód.</th><th>Nome</th><th>Marca</th><th>Modelo</th><th>Qtd.</th><th>Ações</th></tr></thead>
          <tbody>
            {list.map((i) => (
              <tr key={i.id}>
                <td>{String(i.id).padStart(4, '0')}</td>
                <td>{i.name}</td>
                <td>{i.brand}</td>
                <td>{i.model}</td>
                <td><b>{i.quantity}</b></td>
                <td>
                  <button className="btn" title="+1" onClick={() => adjust(i.id, 1)}><i className="fas fa-plus"></i></button>
                  <button className="btn" title="-1" onClick={() => adjust(i.id, -1)}><i className="fas fa-minus"></i></button>
                  <button className="btn" title="Editar" onClick={() => setForm(i)}><i className="fas fa-edit"></i></button>
                  <button className="btn" title="Excluir" onClick={() => remove(i.id)}><i className="fas fa-trash"></i></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState('dashboard');
  const [orders, setOrders] = useState([]);
  const [clients, setClients] = useState([]);
  const [items, setItems] = useState([]);

  const refreshAll = async () => {
    const [o, c, i] = await Promise.all([
      api('/orders'),
      api('/clients'),
      api('/items'),
    ]);
    setOrders(o); setClients(c); setItems(i);
  };

  useEffect(() => { if (user) refreshAll(); }, [user]);

  if (!user) return <Login onLogin={setUser} />;

  return (
    <div className="app-container">
      <Nav current={page} setCurrent={setPage} user={user} onLogout={() => setUser(null)} />
      <main className="main-content">
        {page === 'dashboard' && <Dashboard orders={orders} clients={clients} items={items} />}
        {page === 'clients' && <ClientsPage refresh={refreshAll} />}
        {page === 'orders' && <OrdersPage refresh={refreshAll} clients={clients} />}
        {page === 'stock' && <StockPage refresh={refreshAll} />}
        {page === 'reports' && <div><h1>Relatórios</h1><p>Funcionalidade em desenvolvimento.</p></div>}
      </main>
    </div>
  );
}


