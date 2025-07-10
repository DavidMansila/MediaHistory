import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import HistoryList from './components/HistoryList';
import Statistics from './components/Stadistics';
import MobileNav from './components/MovilNav';
import axios from "axios";
import './index.css';

export default function App() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const TMDB_API_KEY = "2f0037ff8b09c5076d74973fd87e7f16";
  const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

  // Función para obtener el ID de TMDB según el tipo de contenido
  const getTmdbId = (item) => {
    if (item.raw_json.movie) {
      return item.raw_json.movie.ids?.tmdb;
    } else if (item.raw_json.episode && item.raw_json.show) {
      return item.raw_json.show.ids?.tmdb;
    }
    return null;
  };

  // Función para obtener el tipo de medio
  const getMediaType = (item) => {
    return item.raw_json.movie ? 'movie' : 'tv';
  };

  // Función para obtener el año
  const getYear = (item) => {
    if (item.raw_json.movie) {
      return item.raw_json.movie.year;
    } else if (item.raw_json.show) {
      return item.raw_json.show.year;
    }
    return null;
  };

  // Función para obtener géneros
  const getGenres = (item) => {
    if (item.raw_json.movie && item.raw_json.movie.genres) {
      return item.raw_json.movie.genres.join(', ');
    } else if (item.raw_json.show && item.raw_json.show.genres) {
      return item.raw_json.show.genres.join(', ');
    }
    return '';
  };

  // Función para obtener detalles del episodio
  const getEpisodeDetails = (item) => {
    if (item.raw_json.episode) {
      return {
        season: item.raw_json.episode.season,
        episode: item.raw_json.episode.number,
        episodeTitle: item.raw_json.episode.title
      };
    }
    return {
      season: null,
      episode: null,
      episodeTitle: ''
    };
  };

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data } = await axios.get('http://localhost:3001/api/playback-progress');
        
        const historyWithPosters = await Promise.all(
          data.map(async (item) => {
            const tmdbId = getTmdbId(item);
            const mediaType = getMediaType(item);
            let posterPath = '';

            if (tmdbId) {
              try {
                const tmdbUrl = `https://api.themoviedb.org/3/${mediaType}/${tmdbId}`;
                const tmdbRes = await axios.get(tmdbUrl, {
                  params: { api_key: TMDB_API_KEY, language: 'es-ES' }
                });
                posterPath = tmdbRes.data.poster_path;
              } catch (err) {
                console.warn(`Error fetching TMDB data:`, err);
              }
            }

            const { season, episode, episodeTitle } = getEpisodeDetails(item);
            
            return {
              id: item.id,
              title: item.title || item.raw_json.movie?.title || item.raw_json.show?.title || 'Sin título',
              type: mediaType,
              year: getYear(item),
              genre: getGenres(item),
              totalTime: 7200, // Valor fijo por simplicidad
              currentTime: Math.round((item.progress || 0) * 72), // 1% = 72 segundos
              lastViewed: item.paused_at ? new Date(item.paused_at).toISOString().split('T')[0] : '',
              thumbnail: posterPath ? `${IMAGE_BASE_URL}${posterPath}` : '',
              rating: null,
              isBookmarked: false,
              season,
              episode,
              episodeTitle
            };
          })
        );

        setHistory(historyWithPosters);
      } catch (error) {
        console.error('Error fetching history:', error);
        setError('Error al cargar el historial');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  if (loading) {
    return <div className="d-flex justify-content-center align-items-center min-vh-100">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Cargando...</span>
      </div>
    </div>;
  }

  if (error) {
    return <div className="alert alert-danger text-center mt-5">{error}</div>;
  }

  return (
    <div className="d-flex flex-column min-vh-100">
      <Header />
      
      <main className="main-content">
        <div className="container">
          <h1 className="section-title">Mi Historial</h1>
          
          <Statistics history={history} />
          
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="section-title">Contenidos</h2>
          </div>
          
          <HistoryList history={history} />
        </div>
      </main>
      
      <Footer />
      <MobileNav />
    </div>
  );
}