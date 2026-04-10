'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Building2, User, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { APIError, authApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { showApiErrorToast } from '@/lib/toast';

const loginSchema = z.object({
  family_slug: z
    .string()
    .min(1, 'Family slug or name is required')
    .max(120, 'Family slug or name is too long'),
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const result = await authApi.childSignin({
        ...data,
        family_slug: data.family_slug.trim().toLowerCase(),
      });
      setSession(result);
      toast.success(`Welcome back, ${result.user.name}!`, {
        description: 'Your learning journey is ready.',
      });
      router.push('/home');
    } catch (err: unknown) {
      if (err instanceof APIError && err.status === 401) {
        toast.error('Sign-in failed', {
          description: 'Check your family slug/name, username, and password.',
        });
      } else {
        showApiErrorToast(err, 'Could not sign in. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="w-full max-w-sm z-10"
    >
      <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-1">
          Welcome back!
        </h2>
        <p className="text-gray-500 text-center text-sm mb-6">
          Sign in to continue your journey
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {/* Family Slug */}
          <div>
            <label
              htmlFor="family_slug"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Family Slug or Name
            </label>
            <div className="relative">
              <Building2
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
                aria-hidden="true"
              />
              <input
                {...register('family_slug')}
                id="family_slug"
                type="text"
                placeholder="my-family or Jay's family"
                autoCapitalize="none"
                autoCorrect="off"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-800 placeholder-gray-400 transition-all"
              />
            </div>
            {errors.family_slug && (
              <p className="mt-1 text-xs text-red-500">{errors.family_slug.message}</p>
            )}
          </div>

          {/* Username */}
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Username
            </label>
            <div className="relative">
              <User
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
                aria-hidden="true"
              />
              <input
                {...register('username')}
                id="username"
                type="text"
                placeholder="your-username"
                autoCapitalize="none"
                autoCorrect="off"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-800 placeholder-gray-400 transition-all"
              />
            </div>
            {errors.username && (
              <p className="mt-1 text-xs text-red-500">{errors.username.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Password
            </label>
            <div className="relative">
              <Lock
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
                aria-hidden="true"
              />
              <input
                {...register('password')}
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-800 placeholder-gray-400 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none p-1 min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-xl bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-bold text-base transition-all shadow-lg shadow-green-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-h-[52px]"
          >
            {isLoading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              'Sign In 🌟'
            )}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          Ask your parents if you need help signing in.
        </p>
      </div>
    </motion.div>
  );
}
