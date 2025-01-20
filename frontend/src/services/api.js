import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  withCredentials: true
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Example PuzzLink-related API calls
export const getPuzzLinkInfo = () => api.get('/puzzlink/info');
export const createPuzzle = (data) => api.post('/puzzlink/puzzles', data);
export const sharePuzzle = (puzzleId, data) => 
  api.post(`/puzzlink/puzzles/${puzzleId}/share`, data);
export const playPuzzle = (puzzleId) => 
  api.get(`/puzzlink/puzzles/${puzzleId}/play`);

// Example protected route component
export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
};