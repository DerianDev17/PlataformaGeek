import { useEffect, useState, type FormEvent } from 'react';
import { Input } from './Input';
import { Button } from './Button';
import { AuthProvider, useAuthContext } from '@/app/providers/AuthProvider';
import { getSafeRedirectPath, ROUTES } from '@/shared/constants';

export default function RegisterForm() {
  const { register, isAuthenticated } = useAuthContext();
  const [redirectPath, setRedirectPath] = useState<string>(ROUTES.HOME);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setRedirectPath(getSafeRedirectPath(window.location.search));
  }, []);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        window.location.href = redirectPath;
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [redirectPath, success]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    if (password.length < 8) {
      setError('La contrasena debe tener al menos 8 caracteres');
      setLoading(false);
      return;
    }

    try {
      await register({ username, email, password });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="rounded-lg border border-geek-border bg-geek-dark-secondary p-6 py-8 text-center">
        <p className="font-medium text-geek-success">Cuenta creada exitosamente</p>
        <p className="mt-2 text-sm text-geek-text-secondary">Redirigiendo...</p>
      </div>
    );
  }

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

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-geek-border bg-geek-dark-secondary p-6">
      {error && (
        <div className="rounded-lg border border-geek-danger bg-red-500/10 p-3 text-sm text-geek-danger" role="alert">
          {error}
        </div>
      )}

      <Input
        label="Nombre de usuario"
        value={username}
        onChange={(event) => setUsername(event.target.value)}
        placeholder="Tu nombre de usuario"
        required
        autoComplete="username"
      />

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
        placeholder="Minimo 8 caracteres"
        required
        helperText="Minimo 8 caracteres"
        autoComplete="new-password"
      />

      <Button type="submit" loading={loading} className="w-full">
        Crear cuenta
      </Button>
    </form>
  );
}

export function RegisterFormWithAuth() {
  return (
    <AuthProvider>
      <RegisterForm />
    </AuthProvider>
  );
}
