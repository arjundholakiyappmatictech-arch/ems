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
import { Building2 } from 'lucide-react';

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
        setServerError('Invalid email or password. Please verify your credentials.');
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-50 via-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-md space-y-4">
        {/* Brand Header */}
        <div className="flex items-center justify-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white font-extrabold shadow-sm">
            <Building2 className="h-5 w-5" />
          </div>
          <div className="text-left">
            <h2 className="text-base font-bold text-slate-900 tracking-tight leading-none">
              Enterprise EMS
            </h2>
            <p className="text-[11px] font-medium text-slate-500">Corporate Management Suite</p>
          </div>
        </div>

        <Card className="shadow-xs border-slate-200/90">
          <CardHeader className="space-y-1 text-center pb-4">
            <CardTitle className="text-xl font-bold tracking-tight text-slate-900">
              Welcome back
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Sign in with your enterprise credentials to access your workplace
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
    </div>
  );
}
