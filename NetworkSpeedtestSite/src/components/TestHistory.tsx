import React, { useState, useEffect } from 'react';
import { History, Trash2, Share2, Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { SpeedTestResults } from '@/hooks/useSpeedTest';

interface HistoryItem extends SpeedTestResults {
  timestamp: string;
}

export const TestHistory: React.FC = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [selectedResult, setSelectedResult] = useState<HistoryItem | null>(null);
  const [showShareDialog, setShowShareDialog] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    try {
      const stored = localStorage.getItem('speedTestHistory');
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch {
      console.error('Failed to load history');
    }
  };

  const clearHistory = () => {
    localStorage.removeItem('speedTestHistory');
    setHistory([]);
  };

  const deleteItem = (timestamp: string) => {
    const updated = history.filter(item => item.timestamp !== timestamp);
    setHistory(updated);
    localStorage.setItem('speedTestHistory', JSON.stringify(updated));
  };

  const shareResult = (result: HistoryItem) => {
    setSelectedResult(result);
    setShowShareDialog(true);
  };

  const copyToClipboard = () => {
    if (!selectedResult) return;
    
    const text = `🚀 NetSpeed Pro Results
📅 ${new Date(selectedResult.timestamp).toLocaleString()}
📍 ${selectedResult.location}
🏢 ${selectedResult.isp}

📊 Results:
• Download: ${selectedResult.downloadSpeed} Mbps
• Upload: ${selectedResult.uploadSpeed} Mbps
• Ping: ${selectedResult.ping} ms
• Jitter: ${selectedResult.jitter} ms
• Packet Loss: ${selectedResult.packetLoss}%

Test your speed at: ${window.location.href}`;

    navigator.clipboard.writeText(text);
    setShowShareDialog(false);
  };

  const downloadCSV = () => {
    const headers = ['Date', 'Download (Mbps)', 'Upload (Mbps)', 'Ping (ms)', 'Jitter (ms)', 'Packet Loss (%)', 'ISP', 'Location'];
    const rows = history.map(item => [
      new Date(item.timestamp).toLocaleString(),
      item.downloadSpeed,
      item.uploadSpeed,
      item.ping,
      item.jitter,
      item.packetLoss,
      item.isp,
      item.location,
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `speed-test-history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (history.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-6xl mx-auto mt-12">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <History className="w-6 h-6 text-blue-400" />
          <h2 className="text-2xl font-bold text-white">Test History</h2>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={downloadCSV}
            className="border-white/20 text-white hover:bg-white/10"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={clearHistory}
            className="border-red-500/50 text-red-400 hover:bg-red-500/10"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {history.slice(0, 10).map((item, index) => (
          <div
            key={item.timestamp}
            className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-center gap-6">
              <div className="text-sm text-white/40">
                {new Date(item.timestamp).toLocaleDateString()}
                <br />
                {new Date(item.timestamp).toLocaleTimeString()}
              </div>
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <p className="text-xs text-white/50">Download</p>
                  <p className="text-lg font-semibold text-green-400">{item.downloadSpeed} Mbps</p>
                </div>
                <div>
                  <p className="text-xs text-white/50">Upload</p>
                  <p className="text-lg font-semibold text-yellow-400">{item.uploadSpeed} Mbps</p>
                </div>
                <div>
                  <p className="text-xs text-white/50">Ping</p>
                  <p className="text-lg font-semibold text-blue-400">{item.ping} ms</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => shareResult(item)}
                className="text-white/60 hover:text-white hover:bg-white/10"
              >
                <Share2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => deleteItem(item.timestamp)}
                className="text-white/60 hover:text-red-400 hover:bg-red-500/10"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="bg-slate-900 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Share Results</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-white/5">
              <pre className="text-sm text-white/80 whitespace-pre-wrap">
                {selectedResult && `🚀 NetSpeed Pro Results
📅 ${new Date(selectedResult.timestamp).toLocaleString()}
📍 ${selectedResult.location}
🏢 ${selectedResult.isp}

📊 Results:
• Download: ${selectedResult.downloadSpeed} Mbps
• Upload: ${selectedResult.uploadSpeed} Mbps
• Ping: ${selectedResult.ping} ms
• Jitter: ${selectedResult.jitter} ms
• Packet Loss: ${selectedResult.packetLoss}%`}
              </pre>
            </div>
            <Button
              onClick={copyToClipboard}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500"
            >
              Copy to Clipboard
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
