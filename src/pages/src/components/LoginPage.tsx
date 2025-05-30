import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../contexts/AuthContext';
import { useClient } from '../contexts/ClientContext';
import LoadingSpinner from './LoadingSpinner';
import { isClientPortal } from '../utils/subdomain';

// Login form schema
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login, error, clearError } = useAuth();
  const { client } = useClient();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const isPortal = isClientPortal();

  // Get the redirect location based on context
  const from = location.state?.from?.pathname || (isPortal ? '/dashboard' : '/portal/dashboard');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginFormData) {
    try {
      setIsLoading(true);
      clearError();
      await login(data.email, data.password);
      navigate(from, { replace: true });
    } catch (err) {
      // Error is handled in context
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isPortal && client ? `${client.profile.firstName}'s Portal` : 'Client Portal'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to access your legal documents and case information
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                {...register('email')}
                type="email"
                autoComplete="email"
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                {...register('password')}
                type="password"
                autoComplete="current-password"
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Password"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-800">{error}</div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link
                to={isPortal ? "/register" : "/portal/register"}
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                First time? Register here
              </Link>
            </div>
            <div className="text-sm">
              <button
                type="button"
                className="font-medium text-blue-600 hover:text-blue-500"
                onClick={() => {/* TODO: Implement forgot password */}}
              >
                Forgot password?
              </button>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <LoadingSpinner className="w-5 h-5" />
              ) : (
                'Sign in'
              )}
            </button>
          </div>

          {!isPortal && (
            <div className="text-center">
              <Link
                to="/"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Back to home
              </Link>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}