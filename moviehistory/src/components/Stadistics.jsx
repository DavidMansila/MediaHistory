import React from 'react';
import { FaFilm, FaTv, FaHourglassHalf, FaCalendarAlt } from 'react-icons/fa';

export default function Statistics({ history }) {
  // Calcular estadísticas
  const moviesCount = history.filter(item => item.type === 'movie').length;
  const tvCount = history.filter(item => item.type === 'tv').length;
  
  const totalTime = history.reduce((total, item) => total + item.currentTime, 0);
  const hoursWatched = Math.floor(totalTime / 3600);
  
  const daysActive = new Set(history.map(item => 
    new Date(item.lastViewed).toLocaleDateString()
  )).size;
  
  return (
    <div className="mb-5">
      <h3 className="section-title">Tus Estadísticas</h3>
      
      <div className="row">
        <div className="col-md-3 col-6 mb-4">
          <div className="card stat-card">
            <div className="card-body">
              <div className="stat-icon">
                <FaFilm className="fs-4" />
              </div>
              <h4 className="stat-value">{moviesCount}</h4>
              <p className="stat-label">Películas</p>
            </div>
          </div>
        </div>
        
        <div className="col-md-3 col-6 mb-4">
          <div className="card stat-card">
            <div className="card-body">
              <div className="stat-icon">
                <FaTv className="fs-4" />
              </div>
              <h4 className="stat-value">{tvCount}</h4>
              <p className="stat-label">Series</p>
            </div>
          </div>
        </div>
        
        <div className="col-md-3 col-6 mb-4">
          <div className="card stat-card">
            <div className="card-body">
              <div className="stat-icon">
                <FaHourglassHalf className="fs-4" />
              </div>
              <h4 className="stat-value">{hoursWatched}h</h4>
              <p className="stat-label">Tiempo total</p>
            </div>
          </div>
        </div>
        
        <div className="col-md-3 col-6 mb-4">
          <div className="card stat-card">
            <div className="card-body">
              <div className="stat-icon">
                <FaCalendarAlt className="fs-4" />
              </div>
              <h4 className="stat-value">{daysActive}</h4>
              <p className="stat-label">Días activo</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}