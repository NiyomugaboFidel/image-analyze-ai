'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/app/context/AuthoContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ModeToggle } from '@/components/mode-toggle';

const Register = () => {
  const { register } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(username, email, password);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen relative">
      <div className='absolute top-4 right-4 z-10 '>
        <ModeToggle />
      </div>
      <div className="w-full flex flex-col items-center justify-center p-8 transition-colors duration-300">
        <div className="w-full max-w-md">
          <Card className="w-full max-w-md shadow-lg border-border dark:border-zinc-800 bg-card dark:bg-zinc-900">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-semibold text-center text-foreground dark:text-zinc-100">Create Account</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-input dark:border-zinc-700 bg-background dark:bg-zinc-800 text-foreground dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary shadow-sm transition-all duration-200"
                  required
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-input dark:border-zinc-700 bg-background dark:bg-zinc-800 text-foreground dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary shadow-sm transition-all duration-200"
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-input dark:border-zinc-700 bg-background dark:bg-zinc-800 text-foreground dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary shadow-sm transition-all duration-200"
                  required
                />
                {error && <div className="text-red-500 text-sm text-center">{error}</div>}
                <Button type="submit" className="w-full py-6 text-lg rounded-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-all duration-200" disabled={loading}>
                  {loading ? 'Registering...' : 'Register'}
                </Button>
              </form>
              <div className="flex items-center my-2">
                <div className="flex-grow border-t border-zinc-300 dark:border-zinc-700"></div>
                <span className="mx-2 text-xs text-zinc-400">or</span>
                <div className="flex-grow border-t border-zinc-300 dark:border-zinc-700"></div>
              </div>
              <div className="text-center text-sm mt-4">
                Already have an account?{' '}
                <Link href="/auth/login" className="text-primary dark:text-purple-300 hover:underline font-semibold">Login</Link>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center">
              <div className="text-center text-xs text-muted-foreground dark:text-zinc-400">
                <Link href="#" className="text-primary dark:text-purple-300 hover:underline">Terms of Use</Link>
                <span className="mx-2">|</span>
                <Link href="#" className="text-primary dark:text-purple-300 hover:underline">Privacy Policy</Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Register;
