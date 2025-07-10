import React from 'react';
import { FaHome, FaHistory, FaTv } from 'react-icons/fa';

export default function MobileNav({ setCurrentView }) {
  return (
    <nav className="mobile-nav d-lg-none fixed-bottom bg-white shadow-lg py-2">
      <div className="container">
        <div className="d-flex justify-content-around">
          <button 
            className="btn btn-link text-dark d-flex flex-column align-items-center"
            onClick={() => setCurrentView('history')}
          >
            <FaHome className="fs-5" />
            <span className="small">Inicio</span>
          </button>
          
          <button 
            className="btn btn-link text-dark d-flex flex-column align-items-center"
            onClick={() => setCurrentView('history')}
          >
            <FaHistory className="fs-5" />
            <span className="small">Historial</span>
          </button>
          
          <button 
            className="btn btn-link text-primary d-flex flex-column align-items-center"
            onClick={() => setCurrentView('control')}
          >
            <FaTv className="fs-5" />
            <span className="small">Control</span>
          </button>
        </div>
      </div>
    </nav>
  );
}