'use client';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ModeToggle } from '@/components/mode-toggle';


const handleGoogleLogin = () => {
  window.location.href = "http://localhost:5000/auth/google"; 
};

const Login = () => {

  return (
    <div className="flex min-h-screen relative">
      <div className='absolute top-4 right-4 z-10 '>
        <ModeToggle />
      </div>
    
      <div className="hidden md:flex md:w-1/2 bg-[#0a0c21] dark:bg-[#0a0a18] flex-col justify-center p-12 relative overflow-hidden">
        {/* Animated Infinity Symbol */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[500px] h-[700px] relative">
            <svg viewBox="0 0 200 100" className="w-full h-full">
              <defs>
                <linearGradient id="infinityGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" className="text-pink-500 dark:text-pink-600" stopColor="currentColor">
                    <animate attributeName="stop-color" values="#EC4899;#8B5CF6;#3B82F6;#8B5CF6;#EC4899" dur="8s" repeatCount="indefinite" />
                  </stop>
                  <stop offset="50%" className="text-purple-500 dark:text-purple-600" stopColor="currentColor">
                    <animate attributeName="stop-color" values="#8B5CF6;#3B82F6;#EC4899;#3B82F6;#8B5CF6" dur="8s" repeatCount="indefinite" />
                  </stop>
                  <stop offset="100%" className="text-blue-500 dark:text-blue-600" stopColor="currentColor">
                    <animate attributeName="stop-color" values="#3B82F6;#EC4899;#8B5CF6;#EC4899;#3B82F6" dur="8s" repeatCount="indefinite" />
                  </stop>
                </linearGradient>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>
              
              {/* Infinity Path with Animation */}
              <path 
                d="M50,50 C50,30 70,30 85,50 C100,70 120,70 135,50 C150,30 170,30 170,50 C170,70 150,70 135,50 C120,30 100,30 85,50 C70,70 50,70 50,50 Z" 
                fill="none" 
                stroke="url(#infinityGradient)" 
                strokeWidth="10" 
                strokeLinecap="round"
                filter="url(#glow)"
              >
                <animate 
                  attributeName="stroke-dashoffset" 
                  from="1000" 
                  to="0" 
                  dur="20s" 
                  repeatCount="indefinite" 
                />
                <animate 
                  attributeName="stroke-dasharray" 
                  values="0,1000;500,500;1000,0" 
                  dur="10s" 
                  repeatCount="indefinite" 
                />
              </path>
            </svg>
          </div>
        </div>
        
        <div className="text-purple-300 dark:text-purple-200 text-2xl font-medium mb-2 relative z-10">VICKY AI</div>
        <div className="mt-auto relative z-10">
          <h1 className="text-white text-5xl font-bold mb-4">Plan a trip</h1>
        </div>
      </div>
      
      {/* Right section with login form */}
      <div className="w-full md:w-1/2 bg-background text-foreground flex flex-col items-center justify-center p-8 transition-colors duration-300">
        <div className="w-full max-w-md">
          {/* Mobile only display of the prompt */}
          <div className="block md:hidden text-center mb-8">
            <div className="text-primary text-xl font-medium mb-2">VICKY AI</div>
          </div>


          <Card className="w-full max-w-md shadow-lg border-border dark:border-border bg-card dark:bg-card">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-semibold text-center text-foreground dark:text-foreground">Welcome back</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleGoogleLogin}
              variant="outline"
              className="w-full py-6 boder  text-[16px] md:text-[20px] dark:border-input hover:bg-accent dark:hover:bg-accent text-foreground dark:text-foreground font-medium flex items-center justify-center gap-2 md:gap-5"
            >
              <svg viewBox="0 0 24 24" width="50" height="50" xmlns="http://www.w3.org/2000/svg">
                <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                  <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
                  <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
                  <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
                  <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
                </g>
              </svg>
                Continue with Google
            </Button>
          </CardContent>
          <CardFooter className="flex justify-center">
            <div className="text-center text-xs text-muted-foreground dark:text-muted-foreground">
              <Link href="/terms" className="text-primary hover:underline">Terms of Use</Link>
              <span className="mx-2">|</span>
              <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
            </div>
          </CardFooter>
        </Card>
          
      
        </div>
      </div>
      
    </div>
  );
};

export default Login;