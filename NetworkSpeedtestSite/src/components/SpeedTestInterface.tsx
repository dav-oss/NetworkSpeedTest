import React from 'react';
import { Play, Square, Activity, ArrowDown, ArrowUp, Clock, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { SpeedGauge } from './SpeedGauge';
import { ConnectionInfo } from './ConnectionInfo';
import type { SpeedTestResults, TestProgress } from '@/hooks/useSpeedTest';

interface SpeedTestInterfaceProps {
  results: SpeedTestResults;
  progress: TestProgress;
  isTesting: boolean;
  onStartTest: () => void;
  onStopTest: () => void;
}

const phaseLabels: Record<string, { title: string; description: string }> = {
  idle: { title: 'Ready to Test', description: 'Click the button below to start your speed test' },
  ping: { title: 'Testing Ping...', description: 'Measuring latency to our servers' },
  download: { title: 'Testing Download...', description: 'Measuring download speed' },
  upload: { title: 'Testing Upload...', description: 'Measuring upload speed' },
  complete: { title: 'Test Complete!', description: 'Your results are ready' },
};

export const SpeedTestInterface: React.FC<SpeedTestInterfaceProps> = ({
  results,
  progress,
  isTesting,
  onStartTest,
  onStopTest,
}) => {
  const phaseInfo = phaseLabels[progress.phase];

  const getPhaseColor = () => {
    switch (progress.phase) {
      case 'ping':
        return '#3b82f6';
      case 'download':
        return '#10b981';
      case 'upload':
        return '#f59e0b';
      default:
        return '#6366f1';
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          NetSpeed Pro
        </h1>
        <p className="text-white/60 text-lg">Professional Network Speed Testing</p>
      </div>

      {/* Connection Info */}
      <ConnectionInfo results={results} />

      {/* Main Test Area */}
      <div className="relative rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 p-8 backdrop-blur-xl">
        {/* Phase Indicator */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-white mb-2">{phaseInfo.title}</h2>
          <p className="text-white/60">{phaseInfo.description}</p>
        </div>

        {/* Speed Gauges */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <SpeedGauge
            speed={progress.phase === 'ping' ? 0 : results.ping}
            maxSpeed={200}
            label="Ping"
            unit="ms"
            color="#3b82f6"
            isActive={progress.phase === 'ping'}
          />
          <SpeedGauge
            speed={progress.phase === 'download' ? progress.currentSpeed : results.downloadSpeed}
            maxSpeed={1000}
            label="Download"
            unit="Mbps"
            color="#10b981"
            isActive={progress.phase === 'download'}
          />
          <SpeedGauge
            speed={progress.phase === 'upload' ? progress.currentSpeed : results.uploadSpeed}
            maxSpeed={500}
            label="Upload"
            unit="Mbps"
            color="#f59e0b"
            isActive={progress.phase === 'upload'}
          />
        </div>

        {/* Progress Bar */}
        {isTesting && (
          <div className="mb-8">
            <div className="flex justify-between text-sm text-white/60 mb-2">
              <span>Test Progress</span>
              <span>{Math.round(progress.progress)}%</span>
            </div>
            <Progress
              value={progress.progress}
              className="h-2 bg-white/10"
              style={{
                ['--progress-background' as string]: getPhaseColor(),
              }}
            />
          </div>
        )}

        {/* Control Button */}
        <div className="flex justify-center">
          {!isTesting ? (
            <Button
              size="lg"
              onClick={onStartTest}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-12 py-6 text-xl rounded-full shadow-lg shadow-blue-500/25 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/40"
            >
              <Play className="w-6 h-6 mr-3" />
              Start Test
            </Button>
          ) : (
            <Button
              size="lg"
              variant="destructive"
              onClick={onStopTest}
              className="px-12 py-6 text-xl rounded-full"
            >
              <Square className="w-6 h-6 mr-3" />
              Stop Test
            </Button>
          )}
        </div>
      </div>

      {/* Detailed Metrics */}
      {(results.ping > 0 || results.downloadSpeed > 0 || results.uploadSpeed > 0) && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricBadge
            icon={Clock}
            label="Jitter"
            value={`${results.jitter} ms`}
            color="text-blue-400"
          />
          <MetricBadge
            icon={Activity}
            label="Packet Loss"
            value={`${results.packetLoss.toFixed(1)}%`}
            color="text-red-400"
          />
          <MetricBadge
            icon={ArrowDown}
            label="Download"
            value={`${results.downloadSpeed} Mbps`}
            color="text-green-400"
          />
          <MetricBadge
            icon={ArrowUp}
            label="Upload"
            value={`${results.uploadSpeed} Mbps`}
            color="text-yellow-400"
          />
        </div>
      )}

      {/* Speed Rating */}
      {progress.phase === 'complete' && results.downloadSpeed > 0 && (
        <SpeedRating downloadSpeed={results.downloadSpeed} />
      )}
    </div>
  );
};

interface MetricBadgeProps {
  icon: React.ElementType;
  label: string;
  value: string;
  color: string;
}

const MetricBadge: React.FC<MetricBadgeProps> = ({ icon: Icon, label, value, color }) => (
  <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
    <Icon className={`w-5 h-5 ${color}`} />
    <div>
      <p className="text-xs text-white/50">{label}</p>
      <p className="font-semibold text-white">{value}</p>
    </div>
  </div>
);

interface SpeedRatingProps {
  downloadSpeed: number;
}

const SpeedRating: React.FC<SpeedRatingProps> = ({ downloadSpeed }) => {
  const getRating = (speed: number): { text: string; color: string; description: string } => {
    if (speed >= 500) return {
      text: 'Excellent',
      color: 'from-green-400 to-emerald-500',
      description: 'Perfect for 4K streaming, gaming, and large file downloads'
    };
    if (speed >= 100) return {
      text: 'Very Good',
      color: 'from-blue-400 to-cyan-500',
      description: 'Great for HD streaming and video calls'
    };
    if (speed >= 25) return {
      text: 'Good',
      color: 'from-yellow-400 to-orange-500',
      description: 'Suitable for streaming and browsing'
    };
    if (speed >= 10) return {
      text: 'Fair',
      color: 'from-orange-400 to-red-500',
      description: 'Basic browsing and SD streaming'
    };
    return {
      text: 'Slow',
      color: 'from-red-400 to-pink-500',
      description: 'May experience buffering and slow downloads'
    };
  };

  const rating = getRating(downloadSpeed);

  return (
    <div className="rounded-xl bg-white/5 border border-white/10 p-6 text-center">
      <div className="flex items-center justify-center gap-2 mb-2">
        <Zap className="w-6 h-6 text-yellow-400" />
        <span className="text-lg text-white/60">Connection Rating</span>
      </div>
      <p className={`text-3xl font-bold bg-gradient-to-r ${rating.color} bg-clip-text text-transparent mb-2`}>
        {rating.text}
      </p>
      <p className="text-white/60">{rating.description}</p>
    </div>
  );
};
