import React from 'react';

export default function Nav({ current, setCurrent, user, onLogout }) {
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
