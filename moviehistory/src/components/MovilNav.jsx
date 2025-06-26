import React, { useState } from 'react';

export default function MobileNav() {
  const [activeItem, setActiveItem] = useState('inicio');
  
  const navItems = [
    { id: 'inicio', icon: 'home', label: 'Inicio' },
    { id: 'Control', icon: 'Control', label: 'Control' },
    { id: 'Configuración', icon: 'Configuración', label: 'Configuración' }
  ];
  
  return (
    <nav className="mobile-nav">
      {navItems.map(item => (
        <a 
          key={item.id}
          href="#" 
          className={`mobile-nav-item ${activeItem === item.id ? 'active' : ''}`}
          onClick={(e) => {
            e.preventDefault();
            setActiveItem(item.id);
          }}
        >
          <i className={`fas fa-${item.icon}`}></i>
          <span>{item.label}</span>
        </a>
      ))}
    </nav>
  );
}