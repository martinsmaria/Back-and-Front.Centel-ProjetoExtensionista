import React, { useEffect, useState } from 'react';
import { api } from './api.js';

export default function OrdersPage({ refresh, clients }) {
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
