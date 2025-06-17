#!/bin/bash

# generate-config.sh - Creates configuration files
set -e

echo "⚙️ Creating configuration files..."

# Create Tailwind config
cat > tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        green: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        }
      }
    },
  },
  plugins: [],
}
EOF

# Create PostCSS config
cat > postcss.config.js << 'EOF'
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOF

# Create environment template
cat > .env.example << 'EOF'
# API Configuration
REACT_APP_API_BASE_URL=http://localhost:8080/api
REACT_APP_ML_API_BASE_URL=http://localhost:8001

# Optional: Weather API Key
REACT_APP_WEATHER_API_KEY=your_weather_api_key_here

# Development settings
GENERATE_SOURCEMAP=false
EOF

# Create actual .env file
cp .env.example .env

# Update package.json with additional scripts
cat > package.json << 'EOF'
{
  "name": "maize-admin-webapp",
  "version": "1.0.0",
  "description": "Admin panel for Maize Yield Prediction System",
  "private": true,
  "dependencies": {
    "@testing-library/jest-dom": "^5.16.4",
    "@testing-library/react": "^13.3.0",
    "@testing-library/user-event": "^13.5.0",
    "lucide-react": "^0.263.1",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-scripts": "5.0.1",
    "recharts": "^2.7.2",
    "web-vitals": "^2.1.4"
  },
  "devDependencies": {
    "autoprefixer": "^10.4.14",
    "postcss": "^8.4.24",
    "tailwindcss": "^3.3.2"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject",
    "build:prod": "npm run build && echo 'Build completed for production'",
    "analyze": "npm run build && npx serve -s build",
    "clean": "rm -rf build node_modules && npm install"
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  },
  "proxy": "http://localhost:8080"
}
EOF

# Create main CSS file
cat > src/styles/globals.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    font-family: 'Inter', system-ui, sans-serif;
  }
}

@layer components {
  .btn-primary {
    @apply bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors;
  }
  
  .btn-secondary {
    @apply bg-gray-200 text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors;
  }
  
  .card {
    @apply bg-white rounded-xl shadow-sm border border-gray-100 p-6;
  }
  
  .input-field {
    @apply border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent;
  }
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Loading animation */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
EOF

# Update index.css
cat > src/index.css << 'EOF'
@import './styles/globals.css';

body {
  margin: 0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #f8fafc;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}

* {
  box-sizing: border-box;
}
EOF

# Create README.md
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

## Tech Stack

- **Frontend**: React 18, Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **Backend**: Spring Boot API (separate project)
- **Database**: PostgreSQL

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn
- Backend API running (Spring Boot)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
   Update the API URLs in `.env` file.

4. Start the development server:
   ```bash
   npm start
   ```

5. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Environment Variables

- `REACT_APP_API_BASE_URL`: Backend API base URL
- `REACT_APP_ML_API_BASE_URL`: ML service API base URL
- `REACT_APP_WEATHER_API_KEY`: Weather API key (optional)

## Available Scripts

- `npm start`: Run development server
- `npm run build`: Build for production
- `npm test`: Run tests
- `npm run build:prod`: Production build with optimizations
- `npm run analyze`: Analyze bundle size

## Project Structure

```
src/
├── components/          # Reusable components
│   ├── layout/         # Layout components
│   ├── dashboard/      # Dashboard components
│   ├── data/          # Data management components
│   ├── models/        # ML model components
│   └── common/        # Common UI components
├── pages/             # Page components
├── services/          # API services
├── hooks/             # Custom React hooks
├── utils/             # Utility functions
├── context/           # React context providers
└── styles/            # Global styles
```

## API Integration

The webapp integrates with the backend Spring Boot API. Make sure your backend implements the following endpoints:

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

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
EOF

echo "✅ Configuration files created successfully!"
