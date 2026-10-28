import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';

export default function RequireAuth() {
  const { user } = useApp();
  const location = useLocation();
  if (!user) return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }}/>;
  return <Outlet/>;
}
