import React, { useEffect, useState } from 'react';
import { api } from './api.js';

export default function StockPage({ refresh }) {
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
