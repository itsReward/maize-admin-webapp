#!/bin/bash

# maize-admin-setup.sh - Complete setup script for Maize Admin Webapp
set -e

echo "🌱 Maize Yield Prediction Admin Webapp Generator"
echo "=============================================="

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check prerequisites
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js first.${NC}"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed. Please install npm first.${NC}"
    exit 1
fi

echo -e "${BLUE}📋 Node.js version: $(node --version)${NC}"
echo -e "${BLUE}📋 npm version: $(npm --version)${NC}"

PROJECT_NAME="maize-admin-webapp"

# Check if project exists
if [ -d "$PROJECT_NAME" ]; then
    echo -e "${YELLOW}⚠️  Directory $PROJECT_NAME already exists.${NC}"
    read -p "Remove it and continue? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        rm -rf "$PROJECT_NAME"
        echo -e "${GREEN}✅ Removed existing directory${NC}"
    else
        echo -e "${RED}❌ Setup cancelled${NC}"
        exit 1
    fi
fi

# Create React app
echo -e "${BLUE}📦 Creating React application...${NC}"
npx create-react-app "$PROJECT_NAME"
cd "$PROJECT_NAME"

# Install dependencies
echo -e "${BLUE}📦 Installing dependencies...${NC}"
npm install recharts lucide-react
npm install --save-dev tailwindcss postcss autoprefixer

# Initialize Tailwind
echo -e "${BLUE}🎨 Setting up Tailwind CSS...${NC}"
npx tailwindcss init -p

echo -e "${YELLOW}📝 Generating all project files...${NC}"

# Create directory structure
mkdir -p src/{components/{layout,common,dashboard},pages,services,hooks,utils,styles}

# Generate all files in one go
cat > src/App.js << 'EOF'
import React, { useState } from 'react';
import './styles/globals.css';
import { 
  Users, Sprout, TrendingUp, Cloud, Settings, BarChart3, 
  Home, TreePine, Brain, User, Download 
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Mock data for demonstration
const mockData = {
  stats: { totalUsers: 1247, totalFarmers: 892, activeSessions: 234, totalPredictions: 5678, avgYield: 4.2, modelAccuracy: 89.3 },
  yieldTrends: [
    { month: 'Jan', yield: 3.8 }, { month: 'Feb', yield: 4.1 }, { month: 'Mar', yield: 4.5 },
    { month: 'Apr', yield: 4.3 }, { month: 'May', yield: 4.7 }, { month: 'Jun', yield: 4.2 }
  ],
  weatherData: [
    { date: '2025-06-10', rainfall: 15 }, { date: '2025-06-11', rainfall: 5 }, { date: '2025-06-12', rainfall: 0 },
    { date: '2025-06-13', rainfall: 12 }, { date: '2025-06-14', rainfall: 8 }, { date: '2025-06-15', rainfall: 20 }
  ]
};

const StatsCard = ({ title, value, icon: Icon, trend }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        {trend && <p className="text-sm text-green-600 mt-1">+{trend}% from last month</p>}
      </div>
      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
        <Icon className="w-6 h-6 text-green-600" />
      </div>
    </div>
  </div>
);

const Sidebar = ({ currentPage, setCurrentPage }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'farmers', label: 'Farmers', icon: TreePine },
    { id: 'planting', label: 'Planting Sessions', icon: Sprout },
    { id: 'weather', label: 'Weather Data', icon: Cloud },
    { id: 'models', label: 'ML Models', icon: Brain },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <aside className="bg-gray-900 text-white w-64 min-h-screen">
      <div className="p-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
            <Sprout className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg">Maize Admin</span>
        </div>
      </div>
      <nav className="mt-8">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`w-full flex items-center space-x-3 px-6 py-3 text-left hover:bg-gray-800 transition-colors ${
                currentPage === item.id ? 'bg-green-600 border-r-4 border-green-400' : ''
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

const Header = ({ currentPage }) => (
  <header className="bg-white border-b border-gray-200 px-6 py-4">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 capitalize">{currentPage}</h1>
        <p className="text-sm text-gray-600">Maize Yield Prediction System</p>
      </div>
      <div className="flex items-center space-x-4">
        <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2">
          <Download className="w-4 h-4" />
          <span>Export Data</span>
        </button>
        <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
          <User className="w-4 h-4 text-white" />
        </div>
      </div>
    </div>
  </header>
);

const Dashboard = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
      <StatsCard title="Total Users" value={mockData.stats.totalUsers.toLocaleString()} icon={Users} trend={12} />
      <StatsCard title="Active Farmers" value={mockData.stats.totalFarmers.toLocaleString()} icon={TreePine} trend={8} />
      <StatsCard title="Planting Sessions" value={mockData.stats.activeSessions.toLocaleString()} icon={Sprout} trend={15} />
      <StatsCard title="Predictions Made" value={mockData.stats.totalPredictions.toLocaleString()} icon={Brain} trend={23} />
      <StatsCard title="Avg Yield (t/ha)" value={mockData.stats.avgYield} icon={TrendingUp} trend={5} />
      <StatsCard title="Model Accuracy" value={`${mockData.stats.modelAccuracy}%`} icon={Brain} trend={2} />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Yield Trends</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={mockData.yieldTrends}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="yield" stroke="#16a34a" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Weather</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={mockData.weatherData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="rainfall" fill="#16a34a" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  </div>
);

const PlaceholderPage = ({ title }) => (
  <div className="bg-white rounded-lg p-8 text-center">
    <h2 className="text-2xl font-bold text-gray-900 mb-4">{title}</h2>
    <p className="text-gray-600">This page will contain {title.toLowerCase()} management functionality.</p>
    <p className="text-sm text-gray-500 mt-2">Connect to your API endpoints to see real data here.</p>
  </div>
);

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard />;
      case 'users': return <PlaceholderPage title="User Management" />;
      case 'farmers': return <PlaceholderPage title="Farmer Management" />;
      case 'planting': return <PlaceholderPage title="Planting Sessions" />;
      case 'weather': return <PlaceholderPage title="Weather Data" />;
      case 'models': return <PlaceholderPage title="ML Models" />;
      case 'analytics': return <PlaceholderPage title="Analytics" />;
      case 'settings': return <PlaceholderPage title="Settings" />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <div className="flex-1">
        <Header currentPage={currentPage} />
        <main className="p-6">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

export default App;
EOF

# Configuration files
cat > tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        green: {
          50: '#f0fdf4', 100: '#dcfce7', 200: '#bbf7d0', 300: '#86efac',
          400: '#4ade80', 500: '#22c55e', 600: '#16a34a', 700: '#15803d',
          800: '#166534', 900: '#14532d'
        }
      }
    },
  },
  plugins: [],
}
EOF

cat > src/styles/globals.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html { font-family: 'Inter', system-ui, sans-serif; }
}

@layer components {
  .btn-primary { @apply bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors; }
  .card { @apply bg-white rounded-xl shadow-sm border border-gray-100 p-6; }
  .input-field { @apply border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent; }
}
EOF

cat > src/index.css << 'EOF'
@import './styles/globals.css';

body {
  margin: 0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #f8fafc;
}

* { box-sizing: border-box; }
EOF

cat > .env << 'EOF'
REACT_APP_API_BASE_URL=http://localhost:8080/api
REACT_APP_ML_API_BASE_URL=http://localhost:8001
REACT_APP_WEATHER_API_KEY=your_weather_api_key_here
GENERATE_SOURCEMAP=false
EOF

cat > README.md << 'EOF'
# Maize Yield Prediction Admin Webapp

A modern, responsive admin panel for managing the Maize Yield Prediction System.

## Features

- 📊 **Dashboard**: Real-time system statistics and insights
- 👥 **User Management**: Complete user and farmer management
- 🌱 **Planting Sessions**: Track and manage planting activities
- 🌤️ **Weather Data**: Weather monitoring and historical data
- 🧠 **ML Models**: Model training, versioning, and performance tracking
- 📈 **Analytics**: Data visualization and trend analysis
- ⚙️ **Settings**: System configuration and preferences

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   Update the API URLs in `.env` file to match your backend.

3. **Start development server:**
   ```bash
   npm start
   ```

4. **Open in browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Tech Stack

- **Frontend**: React 18, Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **Backend**: Spring Boot API (separate project)
- **Database**: PostgreSQL

## API Integration

The webapp expects these endpoints from your Spring Boot backend:

### Core Endpoints
- `GET /api/dashboard/stats` - Dashboard statistics
- `GET /api/users` - User management
- `GET /api/farmers` - Farmer data
- `GET /api/planting-sessions` - Planting sessions
- `GET /api/weather-data` - Weather information

### ML Endpoints
- `GET /model/versions` - Model versions
- `POST /model/train` - Train new model
- `GET /features/importance` - Feature importance

## Available Scripts

- `npm start` - Run development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run build:prod` - Production build
- `npm run clean` - Clean and reinstall

## Project Structure

```
src/
├── components/     # Reusable components
├── pages/         # Page components
├── services/      # API services
├── hooks/         # Custom React hooks
├── utils/         # Utility functions
└── styles/        # Global styles
```

## Environment Variables

- `REACT_APP_API_BASE_URL` - Backend API base URL
- `REACT_APP_ML_API_BASE_URL` - ML service API base URL
- `REACT_APP_WEATHER_API_KEY` - Weather API key (optional)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License
EOF

# Update gitignore
cat >> .gitignore << 'EOF'

# Environment variables
.env.local
.env.development.local
.env.test.local
.env.production.local

# API keys and secrets
.env.secrets

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db
EOF

echo -e "${GREEN}🎉 Maize Admin Webapp setup complete!${NC}"
echo -e "${BLUE}📁 Project created in: $(pwd)${NC}"
echo ""
echo -e "${YELLOW}🚀 Next steps:${NC}"
echo "1. Configure your API endpoints in .env file"
echo "2. Start the development server: npm start"
echo "3. Open http://localhost:3000 to view the app"
echo ""
echo -e "${BLUE}📋 Available scripts:${NC}"
echo "  npm start          - Start development server"
echo "  npm run build      - Build for production"
echo "  npm test           - Run tests"
echo ""
echo -e "${GREEN}✨ Happy coding!${NC}"
