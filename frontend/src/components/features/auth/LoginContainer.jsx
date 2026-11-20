'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from './loginSchema';
import LoginForm from './LoginForm';
import { useLoginMutation } from '@/hooks/queries/useAuth';
import { mapLaravelErrorsToForm } from '@/lib/utils/formErrors';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginContainer() {
  const router = useRouter();
  const [serverError, setServerError] = React.useState('');

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const loginMutation = useLoginMutation();

  const handleAutofill = (email, password) => {
    setValue('email', email, { shouldValidate: true });
    setValue('password', password, { shouldValidate: true });
    setServerError('');
  };

  const onSubmit = async (values) => {
    setServerError('');
    try {
      await loginMutation.mutateAsync(values);
      router.push('/');
    } catch (err) {
      if (err.response?.status === 422 && err.response?.data?.errors) {
        mapLaravelErrorsToForm(err.response.data.errors, setError);
      } else if (err.response?.data?.message) {
        setServerError(err.response.data.message);
      } else {
        setServerError('Unable to connect to the server. Please check your credentials.');
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <Card className="w-full max-w-md shadow-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">
            Sign In
          </CardTitle>
          <CardDescription>
            Enter your credentials to access the Employee Management Portal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm
            register={register}
            errors={errors}
            onSubmit={handleSubmit(onSubmit)}
            isLoading={loginMutation.isPending}
            serverError={serverError}
            onAutofill={handleAutofill}
          />
        </CardContent>
      </Card>
    </div>
  );
}

