import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Home from './pages/public/Home';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import TrainSearch from './pages/public/TrainSearch';
import VendorProfile from './pages/public/VendorProfile';
import FileComplaint from './pages/public/FileComplaint';
import TrackComplaint from './pages/public/TrackComplaint';
import TransparencyDashboard from './pages/public/TransparencyDashboard';
import PassengerDashboard from './pages/passenger/Dashboard';
import VendorDashboard from './pages/vendor/Dashboard';
import StationAdminDashboard from './pages/admin/StationDashboard';
import SuperAdminDashboard from './pages/admin/SuperDashboard';
import PayVendor from './pages/public/PayVendor';
import Receipt from './pages/public/Receipt';
import VendorRegister from './pages/public/VendorRegister';
import VendorRegisterSuccess from './pages/public/VendorRegisterSuccess';




function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/pay/:vendorId" element={<PayVendor />} />
        <Route path="/receipt/:receiptId" element={<Receipt />} />
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/search" element={<TrainSearch />} />
        <Route path="/vendor/:id" element={<VendorProfile />} />
        <Route path="/complaint" element={<FileComplaint />} />
        <Route path="/track" element={<TrackComplaint />} />
        <Route path="/transparency" element={<TransparencyDashboard />} />
        <Route path="/dashboard" element={
          <ProtectedRoute roles={['passenger']}>
            <PassengerDashboard />
          </ProtectedRoute>
        } />
        <Route path="/vendor-dashboard" element={
          <ProtectedRoute roles={['vendor']}>
            <VendorDashboard />
          </ProtectedRoute>
        } />
        <Route path="/station-admin" element={
          <ProtectedRoute roles={['station_admin', 'super_admin']}>
            <StationAdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/super-admin" element={
          <ProtectedRoute roles={['super_admin']}>
            <SuperAdminDashboard />
          </ProtectedRoute>
        } />
      </Routes>
      <Route path="/vendor-register" element={<VendorRegister />} />
<Route path="/vendor-register-success" element={<VendorRegisterSuccess />} />
    </BrowserRouter>
  );
}

export default App;