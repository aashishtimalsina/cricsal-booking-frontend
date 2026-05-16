import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './components/layout/AdminLayout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import GoogleCallback from './pages/auth/GoogleCallback';
import Dashboard from './pages/admin/Dashboard';
import BookingList from './pages/admin/BookingList';
import BookingCreate from './pages/admin/BookingCreate';
import TimeSlots from './pages/admin/TimeSlots';
import StudentList from './pages/admin/StudentList';
import StudentCreate from './pages/admin/StudentCreate';
import StudentDetail from './pages/admin/StudentDetail';
import StudentEdit from './pages/admin/StudentEdit';
import LoyaltyRules from './pages/admin/LoyaltyRules';
import LoyaltyCards from './pages/admin/LoyaltyCards';
import Reports from './pages/admin/Reports';
import CustomerBookings from './pages/admin/CustomerBookings';
import CustomerBookingDetail from './pages/admin/CustomerBookingDetail';
import SmsLogs from './pages/admin/SmsLogs';
import UserList from './pages/admin/UserList';
import UserCreate from './pages/admin/UserCreate';
import UserEdit from './pages/admin/UserEdit';
import ActivityLogs from './pages/admin/ActivityLogs';
import RequireCustomer from './components/layout/RequireCustomer';
import BookingForm from './pages/customer/BookingForm';
import MyBookings from './pages/customer/MyBookings';
import MyLoyaltyCard from './pages/customer/MyLoyaltyCard';
import CompletePhone from './pages/customer/CompletePhone';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/book" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/auth/callback" element={<GoogleCallback />} />
      <Route
        path="/complete-profile"
        element={
          <RequireCustomer>
            <CompletePhone />
          </RequireCustomer>
        }
      />
      <Route
        path="/book"
        element={
          <RequireCustomer>
            <BookingForm />
          </RequireCustomer>
        }
      />
      <Route
        path="/my-bookings"
        element={
          <RequireCustomer>
            <MyBookings />
          </RequireCustomer>
        }
      />
      <Route
        path="/my-loyalty"
        element={
          <RequireCustomer>
            <MyLoyaltyCard />
          </RequireCustomer>
        }
      />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="bookings" element={<BookingList />} />
        <Route path="bookings/new" element={<BookingCreate />} />
        <Route path="customers/bookings/:userId" element={<CustomerBookingDetail />} />
        <Route path="customers/bookings" element={<CustomerBookings />} />
        <Route path="time-slots" element={<TimeSlots />} />
        <Route path="students" element={<StudentList />} />
        <Route path="students/new" element={<StudentCreate />} />
        <Route path="students/:id/edit" element={<StudentEdit />} />
        <Route path="students/:id" element={<StudentDetail />} />
        <Route path="loyalty/rules" element={<LoyaltyRules />} />
        <Route path="loyalty/cards" element={<LoyaltyCards />} />
        <Route path="reports" element={<Reports />} />
        <Route path="users" element={<UserList />} />
        <Route path="users/new" element={<UserCreate />} />
        <Route path="users/:id/edit" element={<UserEdit />} />
        <Route path="activity-logs" element={<ActivityLogs />} />
        <Route path="sms-logs" element={<SmsLogs />} />
      </Route>
      <Route path="*" element={<Navigate to="/book" replace />} />
    </Routes>
  );
}
