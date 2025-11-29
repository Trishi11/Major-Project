# Virtual Chemistry Lab Backend

This is the backend API for the Virtual Chemistry Lab application, built with Node.js, Express, and MongoDB.

## Features

- User authentication (register, login, profile)
- Experiment management (create, read, update, delete)
- RESTful API design
- JWT-based authentication
- MongoDB database integration

## Tech Stack

- **Node.js** - JavaScript runtime environment
- **Express.js** - Web framework for Node.js
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - JSON Web Tokens for authentication
- **Bcrypt.js** - Password hashing
- **Zod** - Validation library

## Project Structure

```
backend/
├── src/
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   ├── middleware/
│   ├── config/
│   └── server.js
├── .env
├── package.json
└── README.md
```

## Setup Instructions

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   Create a `.env` file based on the `.env.example` file

3. Start the development server:
   ```bash
   npm run dev
   ```

4. For production:
   ```bash
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (requires authentication)

### Experiments
- `GET /api/experiments` - Get all experiments
- `GET /api/experiments/:id` - Get experiment by ID
- `POST /api/experiments` - Create new experiment
- `PUT /api/experiments/:id` - Update experiment
- `DELETE /api/experiments/:id` - Delete experiment

## Environment Variables

- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT token generation

## License

This project is licensed under the MIT License.