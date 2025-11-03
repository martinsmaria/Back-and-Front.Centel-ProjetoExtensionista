import React, { useEffect, useState } from 'react';
import { api } from './api.js';

import Nav from './Nav.jsx';
import Login from './Login.jsx';
import Dashboard from './Dashboard.jsx';
import ClientsPage from './ClientsPage.jsx';
import OrdersPage from './OrdersPage.jsx';
import StockPage from './StockPage.jsx';

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


