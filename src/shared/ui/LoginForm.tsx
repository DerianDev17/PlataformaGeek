import { useState, useEffect, type FormEvent } from 'react';
import { Input } from './Input';
import { Button } from './Button';
import { AuthProvider, useAuthContext } from '@/app/providers/AuthProvider';
import { getSafeRedirectPath, ROUTES } from '@/shared/constants';

export default function LoginForm() {
  const { login, isAuthenticated } = useAuthContext();
  const [redirectPath, setRedirectPath] = useState<string>(ROUTES.HOME);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setRedirectPath(getSafeRedirectPath(window.location.search));
  }, []);

  if (isAuthenticated) {
    return (
      <div className="py-8 text-center">
        <p className="text-geek-text-secondary">Ya has iniciado sesion</p>
        <a href={redirectPath} className="mt-4 inline-block">
          <Button variant="secondary">Continuar</Button>
        </a>
      </div>
    );
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({ email, password });
      window.location.href = redirectPath;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-geek-border bg-geek-dark-secondary p-6">
      {error && (
        <div className="rounded-lg border border-geek-danger bg-red-500/10 p-3 text-sm text-geek-danger" role="alert">
          {error}
        </div>
      )}

      <Input
        label="Email"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="tu@email.com"
        required
        autoComplete="email"
      />

      <Input
        label="Contrasena"
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        placeholder="Tu contrasena"
        required
        autoComplete="current-password"
      />

      <Button type="submit" loading={loading} className="w-full">
        Iniciar sesion
      </Button>
    </form>
  );
}

export function LoginFormWithAuth() {
  return (
    <AuthProvider>
      <LoginForm />
    </AuthProvider>
  );
}
