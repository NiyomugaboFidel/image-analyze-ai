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
const handleGoogleLogin = () => {
  window.location.href = "http://localhost:5000/auth/google"; 
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
                <Button type="submit" className="w-full py-3 text-lg rounded-xl font-semibold bg-gradient-to-r from-purple-500 to-blue-500 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg transition-all duration-200" disabled={loading}>
                  {loading ? 'Registering...' : 'Register'}
                </Button>
              </form>
              <div className="flex items-center my-2">
                <div className="flex-grow border-t border-zinc-300 dark:border-zinc-700"></div>
                <span className="mx-2 text-xs text-zinc-400">or</span>
                <div className="flex-grow border-t border-zinc-300 dark:border-zinc-700"></div>
              </div>
              <Button
                // onClick={() => window.location.href = "http://localhost:5000/auth/google"}
                variant="outline"
                className="w-full py-3 text-[16px] md:text-[18px] rounded-xl border border-input dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-foreground dark:text-zinc-100 font-medium flex items-center justify-center gap-2 md:gap-5 shadow transition-all duration-200"
                type="button"
              >
                <svg viewBox="0 0 24 24" width="28" height="28" xmlns="http://www.w3.org/2000/svg">
                  <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                    <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
                    <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
                    <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
                    <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
                  </g>
                </svg>
                Continue with Google
              </Button>
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
