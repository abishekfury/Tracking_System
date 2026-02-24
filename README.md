# Gym Client Tracking System

A comprehensive MERN stack application for gym trainers to manage clients, track attendance, handle payments, and assign workout plans.

## Features

### For Trainers (Admin)
- **Client Management**: Create, view, edit, and delete client profiles
- **Attendance Tracking**: Mark daily attendance with check-in/check-out times
- **Payment Management**: Record and track monthly payments and dues
- **Workout Plans**: Create and assign personalized workout plans to clients
- **Dashboard**: Overview of gym statistics and recent activities

### For Clients (Members)
- **Personal Dashboard**: View attendance stats and payment status
- **Workout Plans**: Access assigned workout routines and exercises
- **Attendance History**: Track personal gym sessions and progress
- **Payment History**: View payment records and status

## Tech Stack

### Backend
- **Node.js** with **Express.js**
- **MongoDB** with **Mongoose**
- **JWT** for authentication
- **bcryptjs** for password hashing
- **CORS** for cross-origin requests

### Frontend
- **React.js** with functional components and hooks
- **React Router** for navigation
- **Axios** for API calls
- **Context API** for state management

## Prerequisites

Before running this application, make sure you have the following installed:
- Node.js (v14 or higher)
- MongoDB (running locally on default port 27017)
- npm or yarn package manager

## Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd gym-tracking-system
```

### 2. Backend Setup
```bash
cd server
npm install

# Create environment file
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# Start the server
npm run dev
```

### 3. Frontend Setup
```bash
cd ../client
npm install

# Start the React app
npm start
```

### 4. Environment Variables

#### Server (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/gymtracking
JWT_SECRET=your_jwt_secret_key_here_change_in_production
JWT_EXPIRE=7d
```

#### Client (.env)
```
REACT_APP_API_URL=http://localhost:5000/api
```

## Default Access

### First Time Setup
1. Start both server and client
2. Visit http://localhost:3000
3. Register as a trainer using the "Register" option
4. Login with your trainer credentials
5. Start adding clients and managing your gym

### User Roles
- **Trainer**: Full administrative access to all features
- **Client**: Limited access to personal data only

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new trainer
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Clients (Trainer only)
- `GET /api/clients` - Get all clients
- `POST /api/clients` - Create new client
- `GET /api/clients/:id` - Get client by ID
- `PUT /api/clients/:id` - Update client
- `DELETE /api/clients/:id` - Delete client

### Attendance
- `GET /api/attendance` - Get attendance records (trainer)
- `GET /api/attendance/my-records` - Get client's own records
- `POST /api/attendance` - Mark attendance (trainer)
- `PUT /api/attendance/:id` - Update attendance (trainer)

### Payments
- `GET /api/payments` - Get payment records (trainer)
- `GET /api/payments/my-payments` - Get client's payments
- `POST /api/payments` - Record payment (trainer)
- `PUT /api/payments/:id` - Update payment (trainer)

### Workout Plans
- `GET /api/workouts` - Get all workout plans (trainer)
- `GET /api/workouts/my-plan` - Get client's workout plan
- `POST /api/workouts` - Create workout plan (trainer)
- `PUT /api/workouts/:id` - Update workout plan (trainer)

## Database Schema

### Users Collection
- username, email, password (hashed)
- role (trainer/client)
- isActive status

### Clients Collection
- User reference
- Personal information (name, phone, address)
- Membership details
- Emergency contact

### Attendance Collection
- Client reference
- Date, check-in/check-out times
- Duration and notes
- Marked by (trainer reference)

### Payments Collection
- Client reference
- Amount, payment date, payment month
- Payment method and status
- Recorded by (trainer reference)

### WorkoutPlans Collection
- Client reference
- Title, description, exercises array
- Days per week, duration
- Created by (trainer reference)

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Using bcryptjs with salt rounds
- **Role-based Access Control**: Different permissions for trainers and clients
- **Protected Routes**: API endpoints secured with middleware
- **Input Validation**: Server-side validation for all inputs

## Development

### Running in Development Mode
```bash
# Backend (with nodemon for auto-restart)
cd server
npm run dev

# Frontend (with hot reload)
cd client
npm start
```

### Building for Production
```bash
# Frontend build
cd client
npm run build

# Server can be started with
cd server
npm start
```

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running locally
   - Check the MONGODB_URI in your .env file

2. **CORS Errors**
   - Verify the REACT_APP_API_URL in client/.env
   - Ensure the server is running on the correct port

3. **Authentication Issues**
   - Check JWT_SECRET is set in server/.env
   - Clear browser localStorage if needed

4. **Port Already in Use**
   - Change PORT in server/.env
   - Update REACT_APP_API_URL accordingly

## Future Enhancements

- Email notifications for payment reminders
- Progress tracking and analytics
- Mobile app using React Native
- Barcode scanning for quick attendance
- Integration with payment gateways
- Advanced reporting and analytics
- Backup and data export features

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please contact the development team or create an issue in the repository.