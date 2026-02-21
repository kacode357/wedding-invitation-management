import { Navigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const TOKEN_COOKIE_NAME = 'auth_token';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = Cookies.get(TOKEN_COOKIE_NAME);
  if (!token) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}
