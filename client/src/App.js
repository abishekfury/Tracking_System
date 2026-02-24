import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ThemeProvider from './theme/ThemeProvider';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Public pages
import Home from './pages/Home';
import Login from './pages/Login';

// Trainer pages
import TrainerDashboard from './pages/trainer/Dashboard';
import ClientList from './pages/trainer/ClientList';
import AddClient from './pages/trainer/AddClient';
import EditClient from './pages/trainer/EditClient';
import ViewClient from './pages/trainer/ViewClient';
import AttendanceManagement from './pages/trainer/AttendanceManagement';
import PaymentManagement from './pages/trainer/PaymentManagement';
import WorkoutPlanManagement from './pages/trainer/WorkoutPlanManagement';
import DietPlanManagement from './pages/trainer/DietPlanManagement';
import ClientProgressViewer from './pages/trainer/ClientProgressViewer';

// Client pages
import ClientDashboard from './pages/client/Dashboard';
import MyWorkoutPlan from './pages/client/MyWorkoutPlan';
import MyDietPlan from './pages/client/MyDietPlan';
import MyAttendance from './pages/client/MyAttendance';
import MyPayments from './pages/client/MyPayments';
import ProgressImageUpload from './pages/client/ProgressImageUpload';

// Shared pages
import Settings from './pages/Settings';
import HelpSupport from './pages/HelpSupport';

// Roboto font for Material UI
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

// Inter font for modern UI
import '@fontsource/inter/300.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Navigate to="/login" replace />} />

            {/* Trainer routes */}
            <Route path="/trainer" element={
              <ProtectedRoute allowedRoles={['trainer']}>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<TrainerDashboard />} />
              <Route path="clients" element={<ClientList />} />
              <Route path="clients/add" element={<AddClient />} />
              <Route path="clients/:id" element={<ViewClient />} />
              <Route path="clients/:id/edit" element={<EditClient />} />
              <Route path="attendance" element={<AttendanceManagement />} />
              <Route path="payments" element={<PaymentManagement />} />
              <Route path="workouts" element={<WorkoutPlanManagement />} />
              <Route path="diet-plans" element={<DietPlanManagement />} />
              <Route path="progress" element={<ClientProgressViewer />} />
              <Route path="settings" element={<Settings />} />
              <Route path="help" element={<HelpSupport />} />
            </Route>

            {/* Client routes */}
            <Route path="/client" element={
              <ProtectedRoute allowedRoles={['client']}>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<ClientDashboard />} />
              <Route path="workout" element={<MyWorkoutPlan />} />
              <Route path="diet" element={<MyDietPlan />} />
              <Route path="attendance" element={<MyAttendance />} />
              <Route path="payments" element={<MyPayments />} />
              <Route path="progress" element={<ProgressImageUpload />} />
              <Route path="settings" element={<Settings />} />
              <Route path="help" element={<HelpSupport />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

