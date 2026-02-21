import { useState, useEffect, type FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { useAuth } from './hooks/auth/useAuth';
import type { LoginPayload } from './types/auth/auth.payload';

const TOKEN_COOKIE_NAME = 'auth_token';

function App() {
  // Nếu đã có token thì redirect về home, không cần vào login nữa
  if (Cookies.get(TOKEN_COOKIE_NAME)) {
    return <Navigate to="/home" replace />;
  }

  const [email, setEmail] = useState('admin@lms.com');
  const [password, setPassword] = useState('test123');
  const [isLoaded, setIsLoaded] = useState(false);
  const { login, isLoading, error } = useAuth();

  // Simulate initial page load animation
  useEffect(() => {
    setTimeout(() => setIsLoaded(true), 100);
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const payload: LoginPayload = { email, password };
    const success = await login(payload);

    if (!success) {
      // Error is already handled in useAuth
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-amber-50 to-rose-100 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-amber-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className={`w-full max-w-md transition-all duration-700 transform ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-rose-500 rounded-full mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C13.1 2 14 2.9 14 4C14 4.74 13.6 5.39 13 5.73V7H14C17.87 7 21 10.13 21 14V20C21 21.1 20.1 22 19 22H5C3.9 22 3 21.1 3 20V14C3 10.13 6.13 7 10 7H11V5.73C10.4 5.39 10 4.74 10 4C10 2.9 10.9 2 12 2ZM12 4C11.45 4 11 4.45 11 5C11 5.55 11.45 6 12 6C12.55 6 13 5.55 13 5C13 4.45 12.55 4 12 4ZM5 14V19H19V14C19 11.24 16.76 9 14 9H10C7.24 9 5 11.24 5 14Z" />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-gray-800 mb-2">
            Wedding Invitations
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">Manage your special day with elegance</p>
        </div>

        {/* Login Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 sm:p-8 border border-white/50">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-6 text-center">
            Welcome Back
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <div className="relative">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent bg-white/50 text-gray-800 placeholder-gray-400 transition-all duration-200"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="relative">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent bg-white/50 text-gray-800 placeholder-gray-400 transition-all duration-200"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-rose-500 to-rose-600 text-white font-semibold rounded-xl shadow-lg hover:from-rose-600 hover:to-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  {/* Loading Spinner */}
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          {/* Sign Up Link */}
          <p className="mt-6 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <a href="#" className="text-rose-600 hover:text-rose-700 font-semibold transition-colors">
              Sign up free
            </a>
          </p>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-gray-500">
          © 2026 Wedding Invitations. Made with ❤️ for your special day
        </p>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-rose-200 rounded-full"></div>
              <div className="absolute top-0 left-0 w-16 h-16 border-4 border-rose-500 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <p className="mt-4 text-rose-600 font-medium animate-pulse">Authenticating...</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
