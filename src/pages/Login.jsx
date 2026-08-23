import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Mail, Lock, Eye, EyeOff, AlertCircle, Loader2, Send, Shield } from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { api, authApi } from '../lib/api';

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Check if already authenticated
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      // Validate token by trying to fetch user data
      authApi.me()
        .then(() => {
          // Valid token - redirect to intended page or dashboard
          const from = location.state?.from?.pathname || '/';
          navigate(from, { replace: true });
        })
        .catch(() => {
          // Invalid token - clear and stay on login
          localStorage.removeItem('auth_token');
        });
    }
  }, [navigate, location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authApi.login(email, password);
      const { token, userId, name } = response.data;
      
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user', JSON.stringify({ id: userId, name }));
      
      // Redirect to intended page or dashboard
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (err) {
      // Backend sends { error: '...' } — older proxies may send { message }
      const serverMessage = err.response?.data?.error || err.response?.data?.message;
      if (serverMessage) {
        setError(serverMessage === 'Invalid credentials' ? 'Identifiants invalides' : serverMessage);
      } else if (err.response) {
        setError(`Erreur serveur (${err.response.status}). Réessayez.`);
      } else {
        setError('Serveur injoignable. Vérifiez votre connexion ou réessayez plus tard.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl mx-auto mb-4">
            <Send className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-dark-900">map-com</h1>
          <p className="text-dark-500 mt-2">Connectez-vous à votre espace</p>
        </div>

        <Card className="p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="label">Email</label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                required
                autoComplete="email"
                leftIcon={<Mail className="w-5 h-5 text-dark-400" />}
              />
            </div>

            <div>
              <label htmlFor="password" className="label">Mot de passe</label>
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Votre mot de passe"
                required
                autoComplete="current-password"
                leftIcon={<Lock className="w-5 h-5 text-dark-400" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-dark-400 hover:text-dark-600"
                    aria-label={showPassword ? 'Masquer' : 'Afficher'}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                }
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              loading={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Connexion...
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5 mr-2" />
                  Se connecter
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-dark-500">
            <p>Accès réservé aux utilisateurs autorisés</p>
            <p className="mt-1"><Shield className="w-4 h-4 inline mr-1" /> Connexion sécurisée</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
