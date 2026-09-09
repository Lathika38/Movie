import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { movieApi } from '../api/movieApi';
import { scriptApi } from '../api/scriptApi';
import { useAuth } from './AuthContext';

const MovieContext = createContext(null);

export const MovieProvider = ({ children }) => {
  const { user } = useAuth();
  const [movies, setMovies] = useState([]);
  const [activeMovieId, setActiveMovieId] = useState(null);
  const [activeMovie, setActiveMovie] = useState(null);
  const [scenes, setScenes] = useState([]);
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const clearMovieState = useCallback(() => {
    setMovies([]);
    setActiveMovieId(null);
    setActiveMovie(null);
    setScenes([]);
    setCharacters([]);
    setLoading(false);
    setError(null);
  }, []);

  const fetchMovies = useCallback(async () => {
    if (!user?.id) {
      clearMovieState();
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await movieApi.getMovies(user.id, user.role);
      const userMovies = data || [];
      setMovies(userMovies);
      
      // Auto-select first movie if none selected or if active one no longer exists for this user
      if (userMovies.length > 0) {
        setActiveMovieId(prevId => {
          if (prevId && userMovies.some(m => m.id === prevId)) {
            return prevId;
          }
          return userMovies[0].id;
        });
      } else {
        setActiveMovieId(null);
        setActiveMovie(null);
        setScenes([]);
        setCharacters([]);
      }
    } catch (err) {
      console.error('[MovieContext] Failed to load movies:', err);
      setError(err.message || 'Failed to load productions.');
      setMovies([]);
      setActiveMovieId(null);
      setActiveMovie(null);
    } finally {
      setLoading(false);
    }
  }, [user?.id, user?.role, clearMovieState]);

  // Handle user session changes cleanly
  useEffect(() => {
    if (!user?.id) {
      clearMovieState();
    } else {
      // Immediately reset movie selection on user change to prevent stale cross-user leaks
      setActiveMovieId(null);
      setActiveMovie(null);
      setScenes([]);
      setCharacters([]);
      fetchMovies();
    }
  }, [user?.id, clearMovieState, fetchMovies]);

  // Sync activeMovie object when activeMovieId changes
  useEffect(() => {
    if (activeMovieId && movies.length > 0) {
      const found = movies.find(m => m.id === activeMovieId);
      if (found) {
        setActiveMovie(found);
        // Load scenes and characters for active movie
        scriptApi.getScenes(activeMovieId).then(setScenes).catch(() => setScenes([]));
        scriptApi.getCharacters(activeMovieId).then(setCharacters).catch(() => setCharacters([]));
      } else {
        setActiveMovie(null);
        setScenes([]);
        setCharacters([]);
      }
    } else {
      setActiveMovie(null);
      setScenes([]);
      setCharacters([]);
    }
  }, [activeMovieId, movies]);


  const refreshActiveMovieData = async () => {
    if (!activeMovieId) return;
    try {
      const [updatedMovie, updatedScenes, updatedCharacters] = await Promise.all([
        movieApi.getMovie(activeMovieId, user?.id),
        scriptApi.getScenes(activeMovieId),
        scriptApi.getCharacters(activeMovieId)
      ]);
      setActiveMovie(updatedMovie);
      setScenes(updatedScenes || []);
      setCharacters(updatedCharacters || []);
      // Update in movies list
      setMovies(prev => prev.map(m => m.id === activeMovieId ? updatedMovie : m));
    } catch (e) {
      console.error('[MovieContext] Refresh error:', e);
    }
  };

  const createMovie = async (movieData) => {
    const created = await movieApi.createMovie({
      ...movieData,
      producerId: user?.role === 'PRODUCER' ? user?.id : (movieData.producerId || user?.id),
      directorId: user?.role === 'DIRECTOR' ? user?.id : movieData.directorId,
      createdBy: user?.id
    });
    await fetchMovies();
    if (created?.id) setActiveMovieId(created.id);
    return created;
  };

  const updateMovie = async (movieId, updates) => {
    const updated = await movieApi.updateMovie(movieId, updates, user?.id);
    await fetchMovies();
    if (activeMovieId === movieId) {
      setActiveMovie(updated);
    }
    return updated;
  };

  const deleteMovie = async (movieId) => {
    const result = await movieApi.deleteMovie(movieId, user?.id);
    const remaining = movies.filter(m => m.id !== movieId);
    setMovies(remaining);
    if (activeMovieId === movieId) {
      const nextId = remaining.length > 0 ? remaining[0].id : null;
      setActiveMovieId(nextId);
      setActiveMovie(remaining.length > 0 ? remaining[0] : null);
    }
    await fetchMovies();
    return result;
  };

  return (
    <MovieContext.Provider value={{
      movies,
      activeMovieId,
      setActiveMovieId,
      activeMovie,
      scenes,
      characters,
      loading,
      error,
      fetchMovies,
      refreshActiveMovieData,
      createMovie,
      updateMovie,
      deleteMovie
    }}>
      {children}
    </MovieContext.Provider>
  );
};

export const useMovie = () => {
  const context = useContext(MovieContext);
  if (!context) throw new Error('useMovie must be used within a MovieProvider');
  return context;
};
