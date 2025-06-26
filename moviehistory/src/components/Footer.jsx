import React from 'react';
import { FaHistory } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="row">
          <div className="col-lg-4 mb-4">
            <div className="d-flex align-items-center mb-3">
              <FaHistory className="text-primary fs-4 me-2" />
              <span className="fw-bold fs-5">MediaHistory</span>
            </div>
            <p className="text">
              Tu historial de reproducción personalizado. Nunca pierdas el lugar donde te quedaste.
            </p>
          </div>
          
        </div>
        
        <div className="footer-bottom">
          <p className="mb-0 small">&copy; 2023 MediaHistory. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}