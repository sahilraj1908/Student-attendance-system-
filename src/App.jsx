import { Routes, Route } from 'react-router-dom';
import { Box, Container } from '@mui/material';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './components/LandingPage';
import AttendanceDashboard from './components/AttendanceDashboard';
import CameraFeed from './components/CameraFeed';
import StudentRegistration from './components/StudentRegistration';

/**
 * Routes:
 * / — landing page
 * /dashboard — dashboard (stats + table + filters + clock)
 * /scan — webcam + face-api live detection + attendance marking
 * /register — capture face embedding for new student + manage registry
 */
export default function App() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <Container maxWidth="lg" component="main" sx={{ flex: 1, py: 4 }}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<AttendanceDashboard />} />
          <Route path="/scan" element={<CameraFeed />} />
          <Route path="/register" element={<StudentRegistration />} />
        </Routes>
      </Container>
      <Footer />
    </Box>
  );
}

