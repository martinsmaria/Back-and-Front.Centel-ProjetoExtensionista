import React from 'react';

export default function Dashboard({ orders, clients, items }) {
  // Definição dos status do fluxo Kanban
  const kanbanStatuses = [
    { id: 'recebido', label: 'Recebido', icon: '📥' },
    { id: 'em-analise', label: 'Em Análise', icon: '🔍' },
    { id: 'aguardando-aprovacao', label: 'Aguardando Aprovação', icon: '⏳' },
    { id: 'aguardando-pecas', label: 'Aguardando Peças', icon: '📦' },
    { id: 'em-manutencao', label: 'Em Manutenção', icon: '🔧' },
    { id: 'em-testes', label: 'Em Testes', icon: '✅' },
    { id: 'pronto-entrega', label: 'Pronto para Entrega', icon: '🎁' },
    { id: 'finalizado', label: 'Finalizado', icon: '✔️' }
  ];

  const totalItems = items.reduce((s, i) => s + Number(i.quantity || 0), 0);
  
  // Contar ordens por status
  const ordersByStatus = kanbanStatuses.map(status => ({
    ...status,
    count: orders.filter((o) => o.status === status.id).length
  }));

  return (
    <div>
      <h1>Dashboard</h1>
      
      <h2 style={{ marginTop: '30px', marginBottom: '15px', fontSize: '20px' }}>Ordens de Serviço por Status</h2>
      <div className="card-container">
        {ordersByStatus.map(status => (
          <div key={status.id} className="card">
            <h3>{status.icon} {status.label}</h3>
            <p className="value">{status.count}</p>
          </div>
        ))}
      </div>

      <h2 style={{ marginTop: '30px', marginBottom: '15px', fontSize: '20px' }}>Informações Gerais</h2>
      <div className="card-container">
        <div className="card">
          <h3>Total de Itens em Estoque</h3>
          <p className="value">{totalItems}</p>
        </div>
        <div className="card">
          <h3>Clientes Cadastrados</h3>
          <p className="value">{clients.length}</p>
        </div>
        <div className="card">
          <h3>Total de Ordens de Serviço</h3>
          <p className="value">{orders.length}</p>
        </div>
      </div>
    </div>
  );
}
