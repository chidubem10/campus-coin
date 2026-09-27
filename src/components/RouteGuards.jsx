import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from './LoadingScreen';

export function ProtectedRoute({ children }) {
  const { currentUser, ready } = useAuth();
  if (!ready) return <LoadingScreen />;
  if (!currentUser) return <Navigate to="/login" replace />;
  return children;
}

export function PublicOnlyRoute({ children }) {
  const { currentUser, ready } = useAuth();
  if (!ready) return <LoadingScreen />;
  if (currentUser) return <Navigate to="/" replace />;
  return children;
}
