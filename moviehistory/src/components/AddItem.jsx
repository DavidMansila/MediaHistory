import React, { useState } from 'react';
import { FaPlus, FaFilm, FaTv } from 'react-icons/fa';

export default function AddItem({ onAdd }) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    type: 'movie',
    year: '',
    genre: '',
    totalTime: '',
    currentTime: '',
    season: '',
    episode: '',
    episodeTitle: '',
    lastViewed: new Date().toISOString().split('T')[0],
    thumbnail: '',
    rating: 0,
    isBookmarked: false
  });
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    const newItem = {
      ...formData,
      id: Date.now(),
      totalTime: parseInt(formData.totalTime),
      currentTime: parseInt(formData.currentTime),
      season: formData.season ? parseInt(formData.season) : null,
      episode: formData.episode ? parseInt(formData.episode) : null,
      rating: parseFloat(formData.rating)
    };
    
    onAdd(newItem);
    setIsOpen(false);
    setFormData({
      title: '',
      type: 'movie',
      year: '',
      genre: '',
      totalTime: '',
      currentTime: '',
      season: '',
      episode: '',
      episodeTitle: '',
      lastViewed: new Date().toISOString().split('T')[0],
      thumbnail: '',
      rating: 0,
      isBookmarked: false
    });
  };
  
  return (
    <div className="mb-5">
      {!isOpen ? (
        <button 
          className="btn btn-primary d-flex align-items-center"
          onClick={() => setIsOpen(true)}
        >
          <FaPlus className="me-2" /> Agregar contenido
        </button>
      ) : (
        <div className="card p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4>Agregar nuevo contenido</h4>
            <button 
              className="btn btn-sm btn-outline-danger"
              onClick={() => setIsOpen(false)}
            >
              Cancelar
            </button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="row mb-3">
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">Título</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    name="title" 
                    value={formData.title} 
                    onChange={handleChange} 
                    required 
                  />
                </div>
                
                <div className="mb-3">
                  <label className="form-label">Tipo</label>
                  <div className="d-flex">
                    <div className="form-check me-3">
                      <input 
                        className="form-check-input" 
                        type="radio" 
                        name="type" 
                        id="typeMovie" 
                        value="movie" 
                        checked={formData.type === 'movie'} 
                        onChange={handleChange} 
                      />
                      <label className="form-check-label d-flex align-items-center" htmlFor="typeMovie">
                        <FaFilm className="me-2" /> Película
                      </label>
                    </div>
                    <div className="form-check">
                      <input 
                        className="form-check-input" 
                        type="radio" 
                        name="type" 
                        id="typeTv" 
                        value="tv" 
                        checked={formData.type === 'tv'} 
                        onChange={handleChange} 
                      />
                      <label className="form-check-label d-flex align-items-center" htmlFor="typeTv">
                        <FaTv className="me-2" /> Serie
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Año</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      name="year" 
                      value={formData.year} 
                      onChange={handleChange} 
                      min="1900" 
                      max={new Date().getFullYear()} 
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Género</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      name="genre" 
                      value={formData.genre} 
                      onChange={handleChange} 
                    />
                  </div>
                </div>
                
                <div className="mb-3">
                  <label className="form-label">URL de la imagen</label>
                  <input 
                    type="url" 
                    className="form-control" 
                    name="thumbnail" 
                    value={formData.thumbnail} 
                    onChange={handleChange} 
                    required 
                  />
                </div>
              </div>
              
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">Duración total (en segundos)</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    name="totalTime" 
                    value={formData.totalTime} 
                    onChange={handleChange} 
                    required 
                    min="1" 
                  />
                </div>
                
                <div className="mb-3">
                  <label className="form-label">Tiempo actual (en segundos)</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    name="currentTime" 
                    value={formData.currentTime} 
                    onChange={handleChange} 
                    required 
                    min="0" 
                    max={formData.totalTime || 999999} 
                  />
                </div>
                
                {formData.type === 'tv' && (
                  <div className="row mb-3">
                    <div className="col-md-4">
                      <label className="form-label">Temporada</label>
                      <input 
                        type="number" 
                        className="form-control" 
                        name="season" 
                        value={formData.season} 
                        onChange={handleChange} 
                        min="1" 
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Episodio</label>
                      <input 
                        type="number" 
                        className="form-control" 
                        name="episode" 
                        value={formData.episode} 
                        onChange={handleChange} 
                        min="1" 
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Título episodio</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        name="episodeTitle" 
                        value={formData.episodeTitle} 
                        onChange={handleChange} 
                      />
                    </div>
                  </div>
                )}
                
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Última vista</label>
                    <input 
                      type="date" 
                      className="form-control" 
                      name="lastViewed" 
                      value={formData.lastViewed} 
                      onChange={handleChange} 
                      required 
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Calificación (0-10)</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      name="rating" 
                      value={formData.rating} 
                      onChange={handleChange} 
                      min="0" 
                      max="10" 
                      step="0.1" 
                    />
                  </div>
                </div>
                
                <div className="form-check form-switch mb-3">
                  <input 
                    className="form-check-input" 
                    type="checkbox" 
                    name="isBookmarked" 
                    id="isBookmarked" 
                    checked={formData.isBookmarked} 
                    onChange={handleChange} 
                  />
                  <label className="form-check-label" htmlFor="isBookmarked">
                    Guardado en mi lista
                  </label>
                </div>
              </div>
            </div>
            
            <div className="d-flex justify-content-end">
              <button type="submit" className="btn btn-primary">
                Agregar contenido
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}