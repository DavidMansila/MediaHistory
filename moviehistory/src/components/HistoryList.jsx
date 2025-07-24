import React, { useState } from 'react';
import HistoryItem from './HistoryItem';

export default function HistoryList({ history, setCurrentView }) {
  const [filter, setFilter] = useState('all');
  
  const filteredHistory = filter === 'all' 
    ? history 
    : history.filter(item => item.type === filter);
  
  // if (!filteredHistory.length) {
  //   return (
  //     <div className="empty-state">
  //       <div className="mb-3">
  //         <i className="bi bi-film fs-1 text-muted"></i>
  //       </div>
  //       <h5>No hay historial aún...</h5>
  //       <p className="text-muted mb-4">Comienza a ver películas y series para que aparezcan aquí</p>
  //         <button 
  //           className="btn btn-primary"
  //           onClick={() => setCurrentView('history')}
  //         >
  //         Explorar catálogo
  //       </button>
  //     </div>
  //   );
  // }
  
  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
        <div className="d-flex flex-wrap mb-2 mb-md-0">
          <button 
            className={`btn me-2 mb-2 mb-md-0 ${filter === 'all' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setFilter('all')}
          >
            Todo
          </button>
          <button 
            className={`btn me-2 mb-2 mb-md-0 ${filter === 'movie' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setFilter('movie')}
          >
            Películas
          </button>
          <button 
            className={`btn me-2 mb-2 mb-md-0 ${filter === 'tv' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setFilter('tv')}
          >
            Series
          </button>
        </div>
        
        {/* <div className="d-flex align-items-center">
          <span className="me-2 d-none d-sm-block">Ordenar por:</span>
          <select className="form-select form-select-sm w-auto">
            <option>Recientes</option>
            <option>Antiguos</option>
            <option>Nombre</option>
          </select>
        </div> */}
      </div>
      
      <div className="history-list">
        {filteredHistory.map(item => (
          <HistoryItem key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}