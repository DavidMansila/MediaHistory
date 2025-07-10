import React, { useState, useEffect} from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import HistoryList from './components/HistoryList';
import Statistics from './components/Stadistics';
import MobileNav from './components/MovilNav';
import axios from "axios";
import './index.css';

export default function App() {
  const [history, setHistory] = useState([
    { 
      id: 1, 
      title: 'Inception', 
      type: 'movie',
      year: 2010,
      genre: 'Sci-Fi, Thriller',
      totalTime: 8880,
      currentTime: 5100,
      lastViewed: '2023-06-25', 
      thumbnail: 'https://beam-images.warnermediacdn.com/BEAM_LWM_DELIVERABLES/14552c93-d318-4563-a00b-343df7e35d0b/4beb5159-7570-4f7e-bd37-6f7ea0ccff52?host=wbd-images.prod-vod.h264.io&partner=beamcom&w=500',
      rating: 8.8,
      isBookmarked: true
    },
    { 
      id: 2, 
      title: 'Stranger Things', 
      type: 'tv',
      year: 2016,
      genre: 'Horror, Drama',
      totalTime: 3060,
      currentTime: 1800,
      season: 4,
      episode: 7,
      episodeTitle: 'The Massacre at Hawkins Lab',
      lastViewed: '2023-06-24', 
      thumbnail: 'https://upload.wikimedia.org/wikipedia/commons/3/38/Stranger_Things_logo.png',
      rating: 8.7,
      isBookmarked: true
    },
    { 
      id: 3, 
      title: 'The Shawshank Redemption', 
      type: 'movie',
      year: 1994,
      genre: 'Drama',
      totalTime: 8520,
      currentTime: 6000,
      lastViewed: '2023-06-22', 
      thumbnail: 'https://resizing.flixster.com/tdMXmsVnR-vIj4Q5IACpEZ7O1ak=/fit-in/705x460/v2/https://resizing.flixster.com/-XZAfHZM39UwaGJIFWKAE8fS0ak=/v3/t/assets/p15987_v_h8_au.jpg',
      rating: 9.3,
      isBookmarked: false
    },
    { 
      id: 4, 
      title: 'Breaking Bad', 
      type: 'tv',
      year: 2008,
      genre: 'Crime, Drama',
      totalTime: 2880,
      currentTime: 1200,
      season: 5,
      episode: 14,
      episodeTitle: 'Ozymandias',
      lastViewed: '2023-06-20', 
      thumbnail: 'https://occ-0-8407-92.1.nflxso.net/dnm/api/v6/E8vDc_W8CLv7-yMQu8KMEC7Rrr8/AAAABXBg5ew9sDhmGW93rZcxuMjeUSFh-pWE3kagKRZ3wII9tFLsWwHquDh-B9DlNzmEGzMVlAtiSopgA_K69RUl8yzGaG10fuKqEDuY.jpg?r=776',
      rating: 9.5,
      isBookmarked: true
    },
    { 
      id: 5, 
      title: 'The Dark Knight', 
      type: 'movie',
      year: 2008,
      genre: 'Action, Crime',
      totalTime: 9120,
      currentTime: 4500,
      lastViewed: '2023-06-18', 
      thumbnail: 'https://i.redd.it/tdk-or-the-batman-v0-xdzlkrmx1see1.jpg?width=1920&format=pjpg&auto=webp&s=ecf9a539d9de947dcd0043a8892c0c75330dcfab',
      rating: 9.0,
      isBookmarked: false
    },
    { 
      id: 6, 
      title: 'Game of Thrones', 
      type: 'tv',
      year: 2011,
      genre: 'Fantasy, Drama',
      totalTime: 3600,
      currentTime: 1800,
      season: 6,
      episode: 10,
      episodeTitle: 'The Winds of Winter',
      lastViewed: '2023-06-15', 
      thumbnail: 'https://beam-images.warnermediacdn.com/BEAM_LWM_DELIVERABLES/4f6b4985-2dc9-4ab6-ac79-d60f0860b0ac/8f07a5a9314eeb0b1804e8450f72cc13987edd24.jpg?host=wbd-images.prod-vod.h264.io&partner=beamcom',
      rating: 9.2,
      isBookmarked: true
    }
  ]);

  const TMDB_API_KEY = "2f0037ff8b09c5076d74973fd87e7f16";
  const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

  const mapBackendToHistoryItem = (item, posterPath = '') => {
    const movie = item.raw_json?.movie || {};
    return {
      id: item.id,
      title: item.title || movie.title || 'Sin título',
      type: item.type === 'movie' ? 'movie' : 'tv',
      year: movie.year || null,
      genre: movie.genres ? movie.genres.join(', ') : '',
      totalTime: 7200,
      currentTime: Math.round((item.progress || 0) * (7200 / 100)),
      lastViewed: item.paused_at ? new Date(item.paused_at).toLocaleDateString() : '',
      thumbnail: posterPath ? `${IMAGE_BASE_URL}${posterPath}` : '',
      rating: null,
      isBookmarked: false,
      season: item.season,
      episode: item.episode,
      episodeTitle: '',
    };
  };

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data } = await axios.get('http://localhost:3001/api/playback-progress');
        const historyWithPosters = await Promise.all(
          data.map(async item => {
            const tmdbId = item.raw_json?.movie?.ids?.tmdb;
            let posterPath = '';
            if (tmdbId) {
              try {
                const tmdbRes = await axios.get(
                  `https://api.themoviedb.org/3/movie/${tmdbId}`,
                  { params: { api_key: TMDB_API_KEY, language: 'es-ES' } }
                );
                posterPath = tmdbRes.data.poster_path; 
              } catch (err) {
                console.warn(`Error al obtener póster TMDB para ID ${tmdbId}:`, err);
              }
            }

            return mapBackendToHistoryItem(item, posterPath);
          })
        );

        setHistory(historyWithPosters);
      } catch (error) {
        console.error('Error fetching history:', error);
      }
    };

    fetchHistory();
  }, []);


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