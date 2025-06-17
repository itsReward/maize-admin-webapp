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
