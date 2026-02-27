import React from 'react';
import { Globe, Wifi, Server, MapPin, Building2 } from 'lucide-react';
import { MetricCard } from './MetricCard';
import type { SpeedTestResults } from '@/hooks/useSpeedTest';

interface ConnectionInfoProps {
  results: SpeedTestResults;
}

export const ConnectionInfo: React.FC<ConnectionInfoProps> = ({ results }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
      <MetricCard
        icon={Globe}
        label="IP Address"
        value={results.ip || '---'}
        color="#3b82f6"
        delay={0}
      />
      <MetricCard
        icon={Building2}
        label="ISP"
        value={results.isp || '---'}
        color="#8b5cf6"
        delay={50}
      />
      <MetricCard
        icon={MapPin}
        label="Location"
        value={results.location || '---'}
        color="#ec4899"
        delay={100}
      />
      <MetricCard
        icon={Wifi}
        label="Connection"
        value={results.connectionType || '---'}
        color="#10b981"
        delay={150}
      />
      <MetricCard
        icon={Server}
        label="Server"
        value={results.server}
        color="#f59e0b"
        delay={200}
      />
    </div>
  );
};
