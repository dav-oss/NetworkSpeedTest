import type { FC } from 'react';
import { useSpeedTest } from '@/hooks/useSpeedTest';
import { SpeedTestInterface } from '@/components/SpeedTestInterface';
import { TestHistory } from '@/components/TestHistory';
import { Toaster } from '@/components/ui/sonner';

const App: FC = () => {
  const { results, progress, isTesting, startTest, stopTest } = useSpeedTest();

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Gradient Orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-500/10 rounded-full blur-3xl" />
        
        {/* Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 px-4 py-8 md:py-12">
        <SpeedTestInterface
          results={results}
          progress={progress}
          isTesting={isTesting}
          onStartTest={startTest}
          onStopTest={stopTest}
        />
        <TestHistory />
      </div>

      {/* Footer */}
      <footer className="relative z-10 py-8 text-center text-white/40 text-sm">
        <p>NetSpeed Pro - Professional Network Speed Testing</p>
        <p className="mt-1">Powered by Cloudflare Speed Test API</p>
      </footer>

      <Toaster />
    </div>
  );
}

export default App;
