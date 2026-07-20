import { AppBar, Toolbar, Typography, Button, Box, Container } from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import FaceRetouchingNaturalIcon from '@mui/icons-material/FaceRetouchingNatural';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import HomeIcon from '@mui/icons-material/Home';

const links = [
  { to: '/', label: 'Home', icon: <HomeIcon sx={{ mr: 0.5, fontSize: 20 }} /> },
  { to: '/dashboard', label: 'Dashboard', icon: <DashboardIcon sx={{ mr: 0.5, fontSize: 20 }} /> },
  { to: '/scan', label: 'Face Scan', icon: <CameraAltIcon sx={{ mr: 0.5, fontSize: 20 }} /> },
  { to: '/register', label: 'Student Registry', icon: <PersonAddIcon sx={{ mr: 0.5, fontSize: 20 }} /> },
];

export default function Navbar() {
  const { pathname } = useLocation();

  return (
    <AppBar 
      position="sticky" 
      elevation={0} 
      sx={{ 
        bgcolor: 'background.paper', 
        color: 'text.primary',
        borderBottom: 1, 
        borderColor: 'divider',
        backdropFilter: 'none',
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ py: 1.5, gap: 2, flexWrap: 'wrap' }}>
          <Box 
            component={RouterLink}
            to="/"
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mr: 'auto', 
              gap: 1.2, 
              textDecoration: 'none', 
              color: 'text.primary' 
            }}
          >
            <Box 
              sx={{ 
                bgcolor: 'primary.main', 
                color: 'primary.contrastText', 
                p: 0.8, 
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FaceRetouchingNaturalIcon fontSize="medium" />
            </Box>
            <Typography variant="h6" component="span" fontWeight={800} letterSpacing="-0.02em">
              FaceAttend
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {links.map(({ to, label, icon }) => {
              const isActive = pathname === to;
              return (
                <Button
                  key={to}
                  component={RouterLink}
                  to={to}
                  variant={isActive ? 'contained' : 'text'}
                  color={isActive ? 'primary' : 'inherit'}
                  sx={{
                    borderRadius: 3,
                    px: 2,
                    py: 1,
                    fontWeight: 650,
                    color: isActive ? 'primary.contrastText' : 'text.secondary',
                    '&:hover': {
                      bgcolor: isActive ? 'primary.dark' : 'action.hover',
                      color: isActive ? 'primary.contrastText' : 'text.primary',
                    },
                  }}
                  startIcon={icon}
                >
                  {label}
                </Button>
              );
            })}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

