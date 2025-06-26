import React from 'react';
import { FaHistory } from 'react-icons/fa';

export default function Header() {
  return (
    <header className="bg-white shadow-sm">
      <div className="container">
        <nav className="navbar navbar-expand-lg py-2">
          <div className="container-fluid">
            <a className="navbar-brand d-flex align-items-center" href="#">
              <FaHistory className="text-primary me-2 fs-5" />
              <span className="fw-bold fs-5">MediaHistory</span>
            </a>
            
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
              <span className="navbar-toggler-icon"></span>
            </button>
            
            <div className="collapse navbar-collapse" id="navbarNav">
              <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
                <li className="nav-item">
                  <a className="nav-link active" href="#"><i className="fas fa-home me-1 desktop-only"></i> Inicio</a>
                </li>
                {/* <li className="nav-item">
                  <a className="nav-link" href="#"><i className="fas fa-film me-1 desktop-only"></i> Historial</a>
                </li> */}
                <li className="nav-item">
                  <a className="nav-link" href="#"><i className="fas fa-tv me-1 desktop-only"></i> Control </a>
                </li>
                {/* <li className="nav-item">
                  <a className="nav-link" href="#"><i className="fas fa-heart me-1 desktop-only"></i> Cuenta </a>
                </li> */}
                <li className="nav-item ms-2 desktop-only">
                  <a className="btn btn-outline" href="#"><i className="fas fa-cog me-1"></i> Configuración</a>
                </li>
              </ul>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}