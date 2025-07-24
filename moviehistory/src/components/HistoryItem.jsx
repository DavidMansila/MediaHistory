import React from 'react';
import { FaPlay, FaFilm, FaTv, FaClock, FaEdit, FaTrash } from 'react-icons/fa';

export default function HistoryItem({ item }) {
  const isMovie = item.type === 'movie';
  const progressPercentage = Math.round((item.currentTime / item.totalTime) * 100);
  
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m ${secs}s`;
  };
  
  return (
    <div className="card history-item">
      <div className="row g-0">
        <div className="col-md-4 position-relative">
          <img 
            src={item.thumbnail} 
            className="card-img" 
            alt={item.title}
          />
          <div className="position-absolute top-0 end-0 m-2">
            <span className={`badge ${isMovie ? 'bg-danger' : 'bg-primary'} py-1 px-2`}>
              {isMovie ? <FaFilm className="me-1" /> : <FaTv className="me-1" />}
              {isMovie ? 'Película' : 'Serie'}
            </span>
          </div>
          
          {/*<button className="btn btn-primary w-100 rounded-0 rounded-bottom">
            <FaPlay className="me-2" /> Continuar
          </button>*/}
        </div>
        
        <div className="col-md-8">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <div>
                <h5 className="card-title fw-bold mb-1">{item.title}</h5>
                <p className="card-text text-muted mb-2 small">
                  {item.year} • {item.genre} • {formatTime(item.totalTime)}
                </p>
                
                {!isMovie && (
                  <p className="mb-0">
                    <span className="badge bg-light text-dark small">
                      T{item.season} E{item.episode} - {item.episodeTitle}
                    </span>
                  </p>
                )}
              </div>
              
              <div className="d-flex">
                {/* <button className="btn btn-sm btn-outline-danger">
                  <FaTrash />
                </button> */}
              </div>
            </div>
            
            <div className="mb-3">
              <div className="d-flex justify-content-between mb-1 small">
                <span className="text-muted">
                  <FaClock className="me-1" /> 
                  Te quedaste en: {formatTime(item.currentTime)}
                </span>
                <span className="fw-bold">{progressPercentage}%</span>
              </div>
              <div className="progress">
                <div 
                  className="progress-bar" 
                  role="progressbar" 
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>
            
            <div className="d-flex justify-content-between align-items-center small">
              <span className="text-muted">
                Última vista: {item.lastViewed}
              </span>
              
              <div className="d-flex">
                {item.isBookmarked && (
                  <span className="badge bg-warning text-dark me-2">
                    Guardado
                  </span>
                )}
                <span className="badge bg-light text-dark">
                  {item.rating}/10
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}