import React from 'react';

export default function Dashboard({ orders, clients, items }) {
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
