# NetSpeed

A professional network speed testing web application built with React, TypeScript, and Tailwind CSS. Test your internet connection with comprehensive metrics including download/upload speeds, ping, jitter, packet loss, and more.


<img width="1404" height="718" alt="Screenshot 2026-02-27 111834" src="https://github.com/user-attachments/assets/ef6d0d85-016b-4014-8b0b-f18adecfad57" />

## Features

### Core Speed Tests
- **Download Speed** - Measures how fast data downloads to your device (tests up to 100MB files)
- **Upload Speed** - Measures how fast data uploads from your device
- **Ping/Latency** - Tests round-trip time to servers (10 ping samples averaged)
- **Jitter** - Calculates variation between ping responses for stability assessment
- **Packet Loss** - Detects percentage of failed data transmissions

### Connection Information
- **IP Address** - Your public IP address
- **ISP Detection** - Identifies your Internet Service Provider
- **Location** - Geographic location based on IP
- **Connection Type** - Network type (4G, 5G, WiFi, Ethernet, etc.)
- **Server** - Test server location (Cloudflare)

### User Interface
- **Animated Speed Gauges** - Real-time canvas-based gauges with smooth animations
- **Dark Theme** - Modern glassmorphism design with gradient backgrounds
- **Progress Tracking** - Visual progress bar during tests
- **Connection Rating** - Quality assessment based on download speed

### History & Sharing
- **Test History** - Automatically saves last 50 tests to browser storage
- **Export CSV** - Download test history for analysis
- **Share Results** - Copy formatted results to clipboard
- **Delete Individual Tests** - Manage your history

## Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **Speed Test API**: Cloudflare Speed Test

## Getting Started

### Prerequisites
- Node.js 20+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd netspeed-pro
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Usage

1. **Start a Test**: Click the "Start Test" button to begin
2. **Wait for Completion**: The test runs through ping, download, and upload phases
3. **View Results**: See your speeds displayed on animated gauges
4. **Check Connection Info**: View your ISP, location, and IP address
5. **Review History**: Scroll down to see past tests
6. **Share or Export**: Use the buttons to share results or export history

## How It Works

### Speed Test Algorithm

**Ping Test:**
- Sends 10 HEAD requests to Cloudflare
- Measures round-trip time for each request
- Calculates average ping and jitter (variation between pings)
- Tracks failed requests as packet loss

**Download Test:**
- Downloads test files of increasing sizes (1MB, 10MB, 25MB, 100MB)
- Uses real-time streaming to measure speed during download
- Calculates median speed from all test files

**Upload Test:**
- Uploads test data blobs of various sizes
- Measures time to complete each upload
- Calculates median upload speed

### Data Storage

Test history is stored in the browser's `localStorage`:
- Maximum 50 tests stored
- Each test includes timestamp, speeds, ping, and connection info
- Data persists across browser sessions
- Can be cleared or exported at any time

## Project Structure

```
src/
├── components/
│   ├── ConnectionInfo.tsx    # ISP, IP, location display
│   ├── MetricCard.tsx        # Reusable metric card component
│   ├── SpeedGauge.tsx        # Canvas-based speed gauge
│   ├── SpeedTestInterface.tsx # Main test UI
│   └── TestHistory.tsx       # History list and management
├── hooks/
│   └── useSpeedTest.ts       # Core speed test logic
├── App.tsx                   # Main application
├── index.css                 # Global styles
└── main.tsx                  # Entry point
```

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Requires support for:
- Fetch API with streaming
- Canvas API
- localStorage
- ES2020+ JavaScript features

## API Endpoints Used

- `https://ipapi.co/json/` - IP geolocation
- `https://speed.cloudflare.com/__down?bytes={size}` - Download tests
- `https://speed.cloudflare.com/__up` - Upload tests
- `https://www.cloudflare.com/cdn-cgi/trace` - Ping tests

## Customization

### Changing Max Speed Gauges

Edit the `maxSpeed` prop in `SpeedTestInterface.tsx`:

```tsx
<SpeedGauge
  speed={results.downloadSpeed}
  maxSpeed={2000}  // Change this value
  label="Download"
  unit="Mbps"
  color="#10b981"
/>
```

### Adding Custom Test Servers

Modify the `TEST_FILES` array in `useSpeedTest.ts`:

```typescript
const TEST_FILES = [
  { size: 10 * 1024 * 1024, url: 'https://your-server.com/test10MB.zip' },
  // Add more test files
];
```

### Theming

Colors are defined in Tailwind classes and component props. Main colors:
- Download: `#10b981` (green)
- Upload: `#f59e0b` (yellow/orange)
- Ping: `#3b82f6` (blue)

## Performance Considerations

- Canvas gauges use `requestAnimationFrame` for smooth 60fps animations
- Speed tests use streaming to provide real-time speed updates
- Test files are cached with `cache: 'no-store'` to prevent browser caching
- History is limited to 50 items to prevent localStorage bloat

## Limitations

- Requires internet connection to function
- Speed tests consume data (up to ~150MB per full test)
- ISP detection may not be 100% accurate
- VPNs and proxies may affect location detection
- Browser power saving modes may throttle background tabs

## License

MIT License - feel free to use, modify, and distribute.

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## Acknowledgments

- Speed test powered by [Cloudflare](https://www.cloudflare.com/)
- IP geolocation by [ipapi](https://ipapi.co/)
- UI components by [shadcn/ui](https://ui.shadcn.com/)
