# Persona Matcher API Server

This is the backend server for the Persona Matcher application. It provides APIs for personality quiz, artwork recommendations, and user management.

## Project Structure

The server is structured following modern Node.js/Express best practices:

```
server-restructured/
├── config/           # Configuration files
├── controllers/      # Request handlers
├── middleware/       # Express middleware
├── models/           # Data models and types
├── routes/           # API routes
├── services/         # Business logic
├── utils/            # Utility functions
├── package.json      # Dependencies
├── server.js         # Entry point
└── README.md         # Documentation
```

## Setup

### Prerequisites

- Node.js (v16.x or higher)
- npm (v8.x or higher)

### Installation

1. Clone the repository
2. Install dependencies:

```bash
cd server-restructured
npm install
```

3. Create a `.env` file in the root directory with the following variables:

```
PORT=8000
NODE_ENV=development
GEMINI_API_KEY=your_gemini_api_key_here
```

### Running the Server

Development mode:

```bash
npm run dev:new
```

Production mode:

```bash
npm run start:new-prod
```

## API Endpoints

### Status

- `GET /api/status` - Check API status

### Recommendations

- `POST /api/recommendations/text` - Get recommendations based on text description
- `POST /api/recommendations/image` - Get recommendations based on image upload
- `POST /api/recommendations/personalized` - Get personalized recommendations

### Artwork

- `GET /api/artwork` - Get all artwork data
- `GET /api/artwork/:name` - Get artwork by name
- `GET /api/artwork/theme/:theme` - Get artwork by theme
- `GET /api/artwork/search/:keyword` - Search artwork by keyword

### Personality

- `GET /api/personality/quiz` - Get personality quiz questions
- `POST /api/personality/quiz/submit` - Submit personality quiz answers
- `GET /api/personality/report/:userId` - Get personality report
- `POST /api/personality/artwork-match` - Get artwork personality match

### Users

- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login user
- `GET /api/users/profile/:userId` - Get user profile
- `PUT /api/users/profile/:userId` - Update user profile
- `GET /api/users/preferences/:userId` - Get user preferences
- `PUT /api/users/preferences/:userId` - Update user preferences

## Integration with Frontend

The server serves the frontend React application from the `dist` folder when built. All non-API routes serve the React app for client-side routing.

## Key Features

- **Organized Structure**: Clean separation of concerns between routes, controllers, services, and models
- **Error Handling**: Comprehensive error handling with standardized error responses
- **Logging**: Detailed logging for requests and errors
- **Input Validation**: Request validation for all endpoints
- **API Consistency**: Standardized API responses for success and error cases

## Compatibility with Frontend

The restructured backend maintains full compatibility with the existing React frontend. All API endpoints maintain the same signature and response format to ensure seamless integration.