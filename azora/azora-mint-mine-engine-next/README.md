# 🚀 AZORA MINT-MINE ENGINE - Next.js Dashboard

Real-time cryptocurrency mining control center built with Next.js, TypeScript, and Tailwind CSS.

## Features

- ⛏️ **Real-Time Mining Status**: Live updates every second
- 💰 **Profit Tracking**: Daily, hourly, and monthly earnings
- ⚡ **System Monitoring**: CPU temperature, power usage, uptime
- 📊 **Mining Statistics**: Hashrate, accepted/rejected shares
- 🎛️ **Control Panel**: Start/stop mining operations
- 📱 **Responsive Design**: Works on desktop and mobile

## Target Hardware

- **CPU**: Intel Core i7-1065G7
- **Mining Algorithm**: Autolykos v2 (ERG)
- **Expected Performance**: ~35 MH/s
- **Daily Profit**: $6.50 (with FREE electricity)

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Deploy automatically on every push
3. Access your dashboard at: `https://your-app.vercel.app`

### Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

## Architecture

- **Frontend**: Next.js 16 with React 19
- **Styling**: Tailwind CSS 4
- **Language**: TypeScript
- **Deployment**: Vercel (serverless)

## Mining Integration

This dashboard simulates real mining data for demonstration. For actual mining:

1. Deploy this dashboard to Vercel
2. Run the mining software on your local hardware
3. The dashboard will display simulated data until real API integration

## Environment Variables

No environment variables required for basic functionality.

## License

Proprietary - Azora OS Mining Engine
