import { useForm, SubmitHandler } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { createClientSchema, type CreateClientDto } from '@tls-portal/shared';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';

function formatPhoneNumber(value: string): string {
  const phone = value.replace(/\D/g, '');
  const match = phone.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
  if (!match) return value;
  
  const [, area, prefix, suffix] = match;
  if (!area) return '';
  if (!prefix) return area;
  if (!suffix) return `(${area}) ${prefix}`;
  return `(${area}) ${prefix}-${suffix}`;
}

export default function ClientIntakeForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset
  } = useForm({
    resolver: zodResolver(createClientSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      mobile: '',
      source: 'web_form' as const
    }
  });

  const createClient = useMutation({
    mutationFn: async (data: CreateClientDto) => {
      const response = await axios.post('/api/clients', data);
      return response.data;
    },
    onSuccess: (data) => {
      alert(`Success! Your portal has been created at: ${data.portalUrl}`);
      reset();
    },
    onError: (error: any) => {
      alert(error.response?.data?.error || 'An error occurred');
    }
  });

  const onSubmit = (data: CreateClientDto) => {
    createClient.mutate(data);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setValue('mobile', formatted);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white shadow-md rounded-lg p-8">
      <div className="space-y-6">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
            First Name
          </label>
          <input
            {...register('firstName')}
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="John"
          />
          {errors.firstName && (
            <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
            Last Name
          </label>
          <input
            {...register('lastName')}
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Smith"
          />
          {errors.lastName && (
            <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            {...register('email')}
            type="email"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="john.smith@example.com"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-1">
            Mobile Phone
          </label>
          <input
            {...register('mobile')}
            type="tel"
            onChange={handlePhoneChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="(555) 123-4567"
          />
          {errors.mobile && (
            <p className="mt-1 text-sm text-red-600">{errors.mobile.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting || createClient.isPending}
          className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting || createClient.isPending ? 'Creating Portal...' : 'Create My Portal'}
        </button>
      </div>
    </form>
  );
}
