import React, { useEffect, useState } from 'react';
import { api } from './api.js';

export default function ClientsPage({ refresh }) {
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
