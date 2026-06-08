'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormInput } from '@/components/forms/FormInput';
import { Mail, Lock, LogIn, ShieldAlert, Users, Award, Shield } from 'lucide-react';
import Link from 'next/link';
import { useNotificationStore } from '@/store/notificationStore';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const { addToast } = useNotificationStore();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        addToast('Invalid email or password. Please try again.', 'error');
      } else {
        addToast('Welcome back! Logging you in...', 'success');
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (error) {
      addToast('An unexpected auth error occurred.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (role: string) => {
    setIsLoading(true);
    try {
      const result = await signIn('credentials', {
        isDemo: 'true',
        role,
        redirect: false,
      });

      if (result?.error) {
        addToast(`Demo login for ${role} failed. Verify server seed database state.`, 'error');
      } else {
        addToast(`Logged in successfully as Demo ${role.replace('_', ' ')}!`, 'success');
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (error) {
      addToast('Failed to trigger demo authentication.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-12 dark:bg-black sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-violet-600 text-white shadow-lg shadow-violet-500/20 dark:bg-violet-500">
            <Award className="h-6 w-6" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
            Smart Collaboration
          </h2>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Sign in to manage tasks and projects
          </p>
        </div>

        {}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="-space-y-px rounded-md space-y-4">
            <FormInput
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              icon={<Mail className="h-4 w-4" />}
              error={errors.email?.message}
              disabled={isLoading}
              {...register('email')}
            />

            <FormInput
              label="Password"
              type="password"
              placeholder="••••••••"
              icon={<Lock className="h-4 w-4" />}
              error={errors.password?.message}
              disabled={isLoading}
              {...register('password')}
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative flex w-full justify-center rounded-lg bg-violet-600 py-2.5 px-4 text-sm font-semibold text-white shadow-sm transition-all hover:bg-violet-500 hover:shadow-lg hover:shadow-violet-500/10 active:scale-98 disabled:opacity-50 dark:bg-violet-500 dark:hover:bg-violet-400"
            >
              {isLoading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
              ) : (
                <span className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  Sign In
                </span>
              )}
            </button>
          </div>
        </form>

        {}
        <div className="mt-6">
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-200 dark:border-zinc-800" />
            </div>
            <span className="relative bg-zinc-50 px-3 text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:bg-black">
              Or Interactive Demo Logins
            </span>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3">
            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleDemoLogin('ADMIN')}
              className="flex flex-col items-center justify-center rounded-xl border border-zinc-200 bg-white p-3 hover:border-violet-500 hover:bg-violet-50/50 hover:text-violet-600 transition-all active:scale-95 disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-violet-400 dark:hover:bg-violet-950/10 dark:hover:text-violet-400"
            >
              <Shield className="h-5 w-5 text-red-500" />
              <span className="mt-1 text-2xs font-bold uppercase tracking-wider">Admin</span>
            </button>
            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleDemoLogin('PROJECT_MANAGER')}
              className="flex flex-col items-center justify-center rounded-xl border border-zinc-200 bg-white p-3 hover:border-violet-500 hover:bg-violet-50/50 hover:text-violet-600 transition-all active:scale-95 disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-violet-400 dark:hover:bg-violet-950/10 dark:hover:text-violet-400"
            >
              <ShieldAlert className="h-5 w-5 text-amber-500" />
              <span className="mt-1 text-2xs font-bold uppercase tracking-wider">Manager</span>
            </button>
            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleDemoLogin('TEAM_MEMBER')}
              className="flex flex-col items-center justify-center rounded-xl border border-zinc-200 bg-white p-3 hover:border-violet-500 hover:bg-violet-50/50 hover:text-violet-600 transition-all active:scale-95 disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-violet-400 dark:hover:bg-violet-950/10 dark:hover:text-violet-400"
            >
              <Users className="h-5 w-5 text-blue-500" />
              <span className="mt-1 text-2xs font-bold uppercase tracking-wider">Member</span>
            </button>
          </div>
        </div>

        <div className="text-center mt-4 text-xs text-zinc-500">
          Don't have an account?{' '}
          <Link
            href="/register"
            className="font-semibold text-violet-600 hover:underline dark:text-violet-400"
          >
            Create one here
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense fallback={<div className="flex min-h-screen items-center justify-center text-zinc-400 text-xs">Loading login portal...</div>}>
      <LoginPageContent />
    </React.Suspense>
  );
}
