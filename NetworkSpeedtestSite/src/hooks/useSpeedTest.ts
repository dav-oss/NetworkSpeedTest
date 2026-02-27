import { useState, useCallback, useRef, useEffect } from 'react';

export interface SpeedTestResults {
  downloadSpeed: number;
  uploadSpeed: number;
  ping: number;
  jitter: number;
  packetLoss: number;
  connectionType: string;
  isp: string;
  ip: string;
  location: string;
  server: string;
}

export interface TestProgress {
  phase: 'idle' | 'ping' | 'download' | 'upload' | 'complete';
  progress: number;
  currentSpeed: number;
}

const TEST_FILES = [
  { size: 1 * 1024 * 1024, url: 'https://speed.cloudflare.com/__down?bytes=1000000' },
  { size: 10 * 1024 * 1024, url: 'https://speed.cloudflare.com/__down?bytes=10000000' },
  { size: 25 * 1024 * 1024, url: 'https://speed.cloudflare.com/__down?bytes=25000000' },
  { size: 100 * 1024 * 1024, url: 'https://speed.cloudflare.com/__down?bytes=100000000' },
];

const UPLOAD_SIZES = [1, 5, 10, 25]; // MB

export function useSpeedTest() {
  const [results, setResults] = useState<SpeedTestResults>({
    downloadSpeed: 0,
    uploadSpeed: 0,
    ping: 0,
    jitter: 0,
    packetLoss: 0,
    connectionType: '',
    isp: '',
    ip: '',
    location: '',
    server: 'Cloudflare',
  });
  
  const [progress, setProgress] = useState<TestProgress>({
    phase: 'idle',
    progress: 0,
    currentSpeed: 0,
  });
  
  const [isTesting, setIsTesting] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const pingTimesRef = useRef<number[]>([]);

  const getConnectionInfo = useCallback(async () => {
    try {
      // Get IP and basic info
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      
      // Get connection type from Navigator API
      const conn = (navigator as any).connection;
      let connectionType = 'Unknown';
      if (conn) {
        connectionType = conn.effectiveType?.toUpperCase() || 'Unknown';
        if (conn.type) connectionType = conn.type;
      }
      
      setResults(prev => ({
        ...prev,
        ip: data.ip,
        isp: data.org || data.asn,
        location: `${data.city}, ${data.country_name}`,
        connectionType,
      }));
    } catch (error) {
      console.error('Failed to get connection info:', error);
    }
  }, []);

  const measurePing = useCallback(async (): Promise<{ ping: number; jitter: number; packetLoss: number }> => {
    const pings: number[] = [];
    const maxAttempts = 10;
    let failures = 0;
    
    for (let i = 0; i < maxAttempts; i++) {
      const start = performance.now();
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);
        
        await fetch('https://www.cloudflare.com/cdn-cgi/trace', {
          method: 'HEAD',
          cache: 'no-store',
          signal: controller.signal,
        });
        
        clearTimeout(timeout);
        const end = performance.now();
        pings.push(end - start);
      } catch {
        failures++;
      }
      
      setProgress(prev => ({
        ...prev,
        progress: ((i + 1) / maxAttempts) * 100,
      }));
      
      // Small delay between pings
      if (i < maxAttempts - 1) {
        await new Promise(r => setTimeout(r, 100));
      }
    }
    
    if (pings.length === 0) {
      return { ping: 0, jitter: 0, packetLoss: 100 };
    }
    
    const avgPing = pings.reduce((a, b) => a + b, 0) / pings.length;
    
    // Calculate jitter (average variation between consecutive pings)
    let jitterSum = 0;
    for (let i = 1; i < pings.length; i++) {
      jitterSum += Math.abs(pings[i] - pings[i - 1]);
    }
    const jitter = pings.length > 1 ? jitterSum / (pings.length - 1) : 0;
    
    const packetLoss = (failures / maxAttempts) * 100;
    
    return { ping: Math.round(avgPing), jitter: Math.round(jitter), packetLoss };
  }, []);

  const measureDownload = useCallback(async (): Promise<number> => {
    let totalBytes = 0;
    let totalTime = 0;
    const measurements: number[] = [];
    
    for (let i = 0; i < TEST_FILES.length; i++) {
      const file = TEST_FILES[i];
      const startTime = performance.now();
      
      try {
        abortControllerRef.current = new AbortController();
        const response = await fetch(file.url, {
          cache: 'no-store',
          signal: abortControllerRef.current.signal,
        });
        
        if (!response.ok) continue;
        
        const reader = response.body?.getReader();
        if (!reader) continue;
        
        let received = 0;
        const chunkStart = performance.now();
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          received += value.length;
          
          const elapsed = (performance.now() - chunkStart) / 1000;
          if (elapsed > 0) {
            const speed = (received * 8) / (1024 * 1024 * elapsed); // Mbps
            setProgress(prev => ({
              ...prev,
              currentSpeed: speed,
            }));
          }
        }
        
        const endTime = performance.now();
        const duration = (endTime - startTime) / 1000;
        
        if (duration > 0) {
          const speed = (file.size * 8) / (1024 * 1024 * duration); // Mbps
          measurements.push(speed);
          totalBytes += file.size;
          totalTime += duration;
        }
        
        setProgress(prev => ({
          ...prev,
          progress: ((i + 1) / TEST_FILES.length) * 100,
        }));
        
      } catch (error) {
        console.error('Download test error:', error);
      }
    }
    
    // Return median of measurements for more stable result
    if (measurements.length === 0) return 0;
    measurements.sort((a, b) => a - b);
    const median = measurements[Math.floor(measurements.length / 2)];
    return Math.round(median * 10) / 10;
  }, []);

  const measureUpload = useCallback(async (): Promise<number> => {
    const measurements: number[] = [];
    
    for (let i = 0; i < UPLOAD_SIZES.length; i++) {
      const sizeMB = UPLOAD_SIZES[i];
      const data = new Blob([new ArrayBuffer(sizeMB * 1024 * 1024)]);
      
      const startTime = performance.now();
      
      try {
        abortControllerRef.current = new AbortController();
        
        await fetch('https://speed.cloudflare.com/__up', {
          method: 'POST',
          body: data,
          cache: 'no-store',
          signal: abortControllerRef.current.signal,
        });
        
        const endTime = performance.now();
        const duration = (endTime - startTime) / 1000;
        
        if (duration > 0) {
          const speed = (sizeMB * 8) / duration; // Mbps
          measurements.push(speed);
          
          setProgress(prev => ({
            ...prev,
            currentSpeed: speed,
            progress: ((i + 1) / UPLOAD_SIZES.length) * 100,
          }));
        }
        
      } catch (error) {
        console.error('Upload test error:', error);
      }
    }
    
    if (measurements.length === 0) return 0;
    measurements.sort((a, b) => a - b);
    const median = measurements[Math.floor(measurements.length / 2)];
    return Math.round(median * 10) / 10;
  }, []);

  const startTest = useCallback(async () => {
    if (isTesting) return;
    
    setIsTesting(true);
    pingTimesRef.current = [];
    
    // Reset results
    setResults(prev => ({
      ...prev,
      downloadSpeed: 0,
      uploadSpeed: 0,
      ping: 0,
      jitter: 0,
      packetLoss: 0,
    }));
    
    // Get connection info
    await getConnectionInfo();
    
    // Phase 1: Ping test
    setProgress({ phase: 'ping', progress: 0, currentSpeed: 0 });
    const { ping, jitter, packetLoss } = await measurePing();
    setResults(prev => ({ ...prev, ping, jitter, packetLoss }));
    
    // Phase 2: Download test
    setProgress({ phase: 'download', progress: 0, currentSpeed: 0 });
    const downloadSpeed = await measureDownload();
    setResults(prev => ({ ...prev, downloadSpeed }));
    
    // Phase 3: Upload test
    setProgress({ phase: 'upload', progress: 0, currentSpeed: 0 });
    const uploadSpeed = await measureUpload();
    setResults(prev => ({ ...prev, uploadSpeed }));
    
    // Complete
    setProgress({ phase: 'complete', progress: 100, currentSpeed: 0 });
    setIsTesting(false);
    
    // Save to history
    saveToHistory({ ...results, downloadSpeed, uploadSpeed, ping, jitter, packetLoss });
  }, [isTesting, getConnectionInfo, measurePing, measureDownload, measureUpload]);

  const stopTest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsTesting(false);
    setProgress({ phase: 'idle', progress: 0, currentSpeed: 0 });
  }, []);

  const saveToHistory = (result: SpeedTestResults) => {
    try {
      const history = JSON.parse(localStorage.getItem('speedTestHistory') || '[]');
      history.unshift({
        ...result,
        timestamp: new Date().toISOString(),
      });
      // Keep only last 50 results
      if (history.length > 50) history.pop();
      localStorage.setItem('speedTestHistory', JSON.stringify(history));
    } catch {
      // Ignore storage errors
    }
  };

  useEffect(() => {
    getConnectionInfo();
  }, [getConnectionInfo]);

  return {
    results,
    progress,
    isTesting,
    startTest,
    stopTest,
  };
}
