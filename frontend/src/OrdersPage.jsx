import React, { useEffect, useState } from 'react';
import { api } from './api.js';

export default function OrdersPage({ refresh, clients }) {
  const [list, setList] = useState([]);
  const [form, setForm] = useState({ clientId: '', product: '', description: '', serviceClass: 'comum' });
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' ou 'table'
  
  const load = async () => setList(await api('/orders'));
  useEffect(() => { load(); }, []);
  
  async function submit(e) {
    e.preventDefault();
    await api('/orders', { method: 'POST', body: JSON.stringify(form) });
    setForm({ clientId: '', product: '', description: '', serviceClass: 'comum' });
    await load();
    refresh();
  }
  
  async function setStatus(id, status) { 
    await api(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }); 
    await load(); 
    refresh(); 
  }

  async function deleteOrder(id) {
    if (!confirm('Tem certeza que deseja excluir esta Ordem de Serviço?')) {
      return;
    }
    await api(`/orders/${id}`, { method: 'DELETE' });
    await load();
    refresh();
  }

  // Definição dos status do fluxo Kanban
  const kanbanColumns = [
    { id: 'recebido', label: 'Recebido', icon: '📥' },
    { id: 'em-analise', label: 'Em Análise Técnica', icon: '🔍' },
    { id: 'aguardando-aprovacao', label: 'Aguardando Aprovação', icon: '⏳' },
    { id: 'aguardando-pecas', label: 'Aguardando Peças', icon: '📦' },
    { id: 'em-manutencao', label: 'Em Manutenção', icon: '🔧' },
    { id: 'em-testes', label: 'Em Testes', icon: '✅' },
    { id: 'pronto-entrega', label: 'Pronto para Entrega', icon: '🎁' },
    { id: 'finalizado', label: 'Finalizado', icon: '✔️' }
  ];

  // Mapeamento de labels para exibição
  const statusLabels = {
    'recebido': 'Recebido',
    'em-analise': 'Em Análise',
    'aguardando-aprovacao': 'Aguard. Aprovação',
    'aguardando-pecas': 'Aguard. Peças',
    'em-manutencao': 'Em Manutenção',
    'em-testes': 'Em Testes',
    'pronto-entrega': 'Pronto Entrega',
    'finalizado': 'Finalizado'
  };

  const serviceClassIcons = {
    'urgente': '🔴',
    'data-fixa': '🟡',
    'comum': '🟢'
  };

  const serviceClassLabels = {
    'urgente': 'Urgente',
    'data-fixa': 'Data Fixa',
    'comum': 'Comum'
  };

  // Agrupar ordens por status para o Kanban
  const groupedByStatus = kanbanColumns.map(col => ({
    ...col,
    orders: list.filter(o => o.status === col.id)
  }));

  return (
    <div>
      <div className="page-header">
        <h1>Ordens de Serviço</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            className={`btn ${viewMode === 'kanban' ? 'btn-primary' : ''}`}
            onClick={() => setViewMode('kanban')}
          >
            📊 Kanban
          </button>
          <button 
            className={`btn ${viewMode === 'table' ? 'btn-primary' : ''}`}
            onClick={() => setViewMode('table')}
          >
            📋 Tabela
          </button>
        </div>
      </div>

      <div className="table-container">
        <form onSubmit={submit} style={{ marginBottom: 20, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gridTemplateRows: 'auto', gap: 12 }}>
          <select value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })} required>
            <option value="">Selecione um cliente...</option>
            {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input placeholder="Produto/Equipamento" value={form.product} onChange={(e) => setForm({ ...form, product: e.target.value })} required />
          <input placeholder="Descrição do Problema" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
          <select value={form.serviceClass} onChange={(e) => setForm({ ...form, serviceClass: e.target.value })}>
            <option value="comum">🟢 Comum</option>
            <option value="data-fixa">🟡 Data Fixa</option>
            <option value="urgente">🔴 Urgente</option>
          </select>
          <button className="btn btn-primary" type="submit">Nova OS</button>
        </form>

        {viewMode === 'kanban' ? (
          <div style={{ 
            // display: 'grid', 
            // gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
            display: 'flex',
            flexWrap: 'nowrap',
            overflowX: 'auto',
            // gridTemplateColumns: '1fr 1fr 1fr 1fr', 
            gap: '15px', 
            marginTop: '20px' 
          }}>
            {groupedByStatus.map(column => (
              <div key={column.id} style={{ 
                backgroundColor: '#f8f9fa', 
                borderRadius: '8px', 
                padding: '15px',
                border: '2px solid #dee2e6',
                minWidth: '350px',
                // maxHeight: '50vh',
                // overflowY: 'auto'
              }}>
                <h3 style={{ 
                  fontSize: '14px', 
                  fontWeight: 'bold', 
                  marginBottom: '15px',
                  textAlign: 'center',
                  color: '#495057'
                }}>
                  {column.icon} {column.label}
                  <span style={{ 
                    marginLeft: '8px', 
                    backgroundColor: '#6c757d', 
                    color: 'white', 
                    borderRadius: '12px', 
                    padding: '2px 8px',
                    fontSize: '12px'
                  }}>
                    {column.orders.length}
                  </span>
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {column.orders.map(order => (
                    <div key={order.id} style={{
                      backgroundColor: 'white',
                      borderRadius: '6px',
                      padding: '12px',
                      color: 'black',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      border: order.serviceClass === 'urgente' ? '2px solid #dc3545' : 
                              order.serviceClass === 'data-fixa' ? '2px solid #ffc107' : 
                              '1px solid #dee2e6'
                    }}>
                      <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ fontSize: '13px' }}>OS #{String(order.id).padStart(4, '0')}</strong>
                        <span 
                          style={{ fontSize: '16px' }} 
                          title={serviceClassLabels[order.serviceClass]}
                        >
                          {serviceClassIcons[order.serviceClass]}
                        </span>
                      </div>
                      <div style={{ fontSize: '14px', marginBottom: '6px' }}>
                        <strong>{order.clientName}</strong>
                      </div>
                      <div style={{ fontSize: '16px'}}>
                        {order.description}
                      </div>
                      <div style={{ fontSize: '16px', color: '#18191aff', marginBottom: '8px' }}>
                        {order.product}
                      </div>
                      <div style={{ fontSize: '12px', color: '#43464aff', marginBottom: '8px' }}>
                        {new Date(order.date).toLocaleDateString('pt-BR')}
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '8px' }}>
                        {column.id !== 'recebido' && (
                          <button 
                            className="btn" 
                            style={{ fontSize: '10px', padding: '4px 8px' }}
                            onClick={() => {
                              const currentIndex = kanbanColumns.findIndex(c => c.id === column.id);
                              if (currentIndex > 0) {
                                setStatus(order.id, kanbanColumns[currentIndex - 1].id);
                              }
                            }}
                            title="Voltar etapa"
                          >
                            ◀️
                          </button>
                        )}
                        {column.id !== 'finalizado' && (
                          <button 
                            className="btn btn-primary" 
                            style={{ fontSize: '10px', padding: '4px 8px' }}
                            onClick={() => {
                              const currentIndex = kanbanColumns.findIndex(c => c.id === column.id);
                              if (currentIndex < kanbanColumns.length - 1) {
                                setStatus(order.id, kanbanColumns[currentIndex + 1].id);
                              }
                            }}
                            title="Avançar etapa"
                          >
                            ▶️
                          </button>
                        )}
                        <button
                          className="btn"
                          style={{ 
                            fontSize: '10px', 
                            padding: '4px 8px',
                            backgroundColor: '#d63031',
                            color: 'white',
                            marginLeft: 'auto'
                          }}
                          onClick={() => deleteOrder(order.id)}
                          title="Excluir OS"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '40px', textAlign: 'center' }}></th>
                <th>Cód.</th>
                <th>Cliente</th>
                <th>Produto</th>
                <th>Data</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {list.map((o) => (
                <tr key={o.id}>
                  <td style={{ textAlign: 'center', fontSize: '18px' }} title={serviceClassLabels[o.serviceClass]}>
                    {serviceClassIcons[o.serviceClass]}
                  </td>
                  <td>{String(o.id).padStart(4, '0')}</td>
                  <td>{o.clientName}</td>
                  <td>{o.product}</td>
                  <td>{new Date(o.date).toLocaleDateString('pt-BR')}</td>
                  <td><span className={`status ${o.status}`}>{statusLabels[o.status]}</span></td>
                  <td style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    <select 
                      onChange={(e) => setStatus(o.id, e.target.value)} 
                      value={o.status}
                      style={{ fontSize: '11px', padding: '4px' }}
                    >
                      {kanbanColumns.map(col => (
                        <option key={col.id} value={col.id}>{col.label}</option>
                      ))}
                    </select>
                    <button
                      className="btn"
                      style={{ 
                        fontSize: '11px', 
                        padding: '4px 8px',
                        backgroundColor: '#d63031',
                        color: 'white'
                      }}
                      onClick={() => deleteOrder(o.id)}
                      title="Excluir OS"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
