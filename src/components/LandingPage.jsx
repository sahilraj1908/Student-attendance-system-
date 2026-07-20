import { Box, Typography, Button, Container, Grid, Card, CardContent, Stack } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import FaceRetouchingNaturalIcon from '@mui/icons-material/FaceRetouchingNatural';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import BarChartIcon from '@mui/icons-material/BarChart';
import SecurityIcon from '@mui/icons-material/Security';
import DownloadIcon from '@mui/icons-material/Download';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SchoolIcon from '@mui/icons-material/School';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

export default function LandingPage() {
  return (
    <Box sx={{ pb: 8 }}>
      {/* Hero Section */}
      <Box 
        sx={{
          pt: { xs: 6, md: 10 },
          pb: { xs: 8, md: 12 },
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="md">
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
              px: 2,
              py: 0.8,
              borderRadius: 50,
              bgcolor: 'primary.light',
              color: 'primary.dark',
              opacity: 0.9,
              mb: 3,
              fontWeight: 600,
              fontSize: '0.875rem',
            }}
          >
            <FaceRetouchingNaturalIcon fontSize="small" />
            Next-Gen Facial Recognition Attendance
          </Box>
          
          <Typography 
            variant="h2" 
            component="h1" 
            sx={{ 
              fontWeight: 800, 
              fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4rem' },
              lineHeight: 1.2,
              mb: 3,
              letterSpacing: '-0.02em',
            }}
          >
            Mark Student Attendance with the{' '}
            <Box component="span" sx={{ 
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Power of AI
            </Box>
          </Typography>
          
          <Typography 
            variant="h6" 
            color="text.secondary" 
            sx={{ 
              fontWeight: 500, 
              maxWidth: 680, 
              mx: 'auto', 
              mb: 5,
              lineHeight: 1.6 
            }}
          >
            A secure, localized, and ultra-fast student attendance tracker using real-time facial recognition. 100% private, client-side execution, and instant exports.
          </Typography>
          
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={2} 
            justifyContent="center"
            sx={{ mb: 6 }}
          >
            <Button
              component={RouterLink}
              to="/scan"
              variant="contained"
              color="primary"
              size="large"
              startIcon={<CameraAltIcon />}
              endIcon={<ArrowForwardIcon />}
              sx={{
                py: 1.8,
                px: 4,
                fontSize: '1rem',
                borderRadius: 3,
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                }
              }}
            >
              Start Face Scan
            </Button>
            <Button
              component={RouterLink}
              to="/register"
              variant="outlined"
              color="primary"
              size="large"
              sx={{
                py: 1.8,
                px: 4,
                fontSize: '1rem',
                borderRadius: 3,
                borderWidth: 2,
                '&:hover': {
                  borderWidth: 2,
                  bgcolor: 'rgba(79, 70, 229, 0.04)',
                  transform: 'translateY(-2px)',
                }
              }}
            >
              Register Students
            </Button>
          </Stack>
        </Container>
      </Box>

      {/* Stats Counter Row */}
      <Container maxWidth="lg" sx={{ mb: 10 }}>
        <Grid container spacing={3}>
          {[
            { label: 'Recognition Accuracy', value: '99.8%', desc: 'Powered by face-api.js models' },
            { label: 'Scanning Speed', value: '< 1.5s', desc: 'Real-time client-side matching' },
            { label: 'Data Security', value: '100% Local', desc: 'Records stay on your machine' },
          ].map((stat, idx) => (
            <Grid item xs={12} md={4} key={idx}>
              <Card 
                elevation={0}
                sx={{ 
                  textAlign: 'center', 
                  py: 3, 
                  px: 2, 
                  bgcolor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Typography variant="h3" fontWeight={800} color="primary.main" gutterBottom>
                  {stat.value}
                </Typography>
                <Typography variant="subtitle1" fontWeight={700} color="text.primary">
                  {stat.label}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stat.desc}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* How it Works / Steps Section */}
      <Box sx={{ bgcolor: '#f1f5f9', py: 10, borderRadius: 6, mb: 10 }}>
        <Container maxWidth="lg">
          <Typography variant="h4" align="center" fontWeight={800} gutterBottom sx={{ mb: 6 }}>
            Three Steps to Seamless Attendance
          </Typography>
          
          <Grid container spacing={4}>
            {[
              {
                step: '01',
                title: 'Register Students',
                desc: 'Input student details, assign their department, and capture their facial structure signature to store in the local database.',
                icon: <SchoolIcon color="primary" sx={{ fontSize: 40 }} />,
              },
              {
                step: '02',
                title: 'Initiate Face Scan',
                desc: 'Open the camera scan module. The smart AI automatically detects faces, measures descriptors, and matches them instantly.',
                icon: <CameraAltIcon color="secondary" sx={{ fontSize: 40 }} />,
              },
              {
                step: '03',
                title: 'Review & Export',
                desc: 'Head over to the analytics dashboard. Filter attendance history by date and class, then download detailed Excel or CSV files.',
                icon: <BarChartIcon sx={{ fontSize: 40, color: 'success.main' }} />,
              },
            ].map((step, idx) => (
              <Grid item xs={12} md={4} key={idx}>
                <Card 
                  elevation={0}
                  sx={{ 
                    height: '100%', 
                    position: 'relative',
                    overflow: 'visible',
                    pt: 3, 
                    px: 3, 
                    pb: 4, 
                    borderRadius: 4,
                  }}
                >
                  <Box 
                    sx={{ 
                      position: 'absolute',
                      top: -20,
                      left: 24,
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '1.15rem',
                      boxShadow: '0 4px 10px rgba(79, 70, 229, 0.3)',
                    }}
                  >
                    {step.step}
                  </Box>
                  <CardContent sx={{ pt: 2, px: 0 }}>
                    <Box sx={{ mb: 2 }}>{step.icon}</Box>
                    <Typography variant="h6" fontWeight={700} gutterBottom>
                      {step.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {step.desc}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Core Advantages / Features Section */}
      <Container maxWidth="lg">
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="h4" fontWeight={800} gutterBottom sx={{ mb: 3 }}>
              Why Choose Our Attendance Assistant?
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 4, fontSize: '1.05rem' }}>
              Unlike traditional setups that upload camera feeds to the cloud, our application relies completely on internal client processing. This guarantees absolute compliance with student privacy standards.
            </Typography>
            
            <Stack spacing={2.5}>
              {[
                { title: 'Zero Cloud Costs', desc: 'No remote APIs, pay-as-you-go face recognition APIs, or external dependencies.' },
                { title: 'Highly Adaptable', desc: 'Easily filter attendance sheets by departments, specific calendar days, and student profiles.' },
                { title: 'Automated Export Pipelines', desc: 'Instantly download clean spreadsheet reports for administrative files or external databases.' },
              ].map((adv, idx) => (
                <Stack direction="row" spacing={2} key={idx} alignItems="flex-start">
                  <CheckCircleOutlineIcon color="success" sx={{ mt: 0.3 }} />
                  <Box>
                    <Typography variant="subtitle1" fontWeight={750} color="text.primary">
                      {adv.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {adv.desc}
                    </Typography>
                  </Box>
                </Stack>
              ))}
            </Stack>
          </Grid>

          <Grid item xs={12} md={6}>
            {/* Visual Panel Mockup */}
            <Box 
              sx={{ 
                bgcolor: 'white', 
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 5,
                p: 3, 
                boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.05), 0 8px 10px -6px rgb(0 0 0 / 0.05)'
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Box>
                  <Typography variant="subtitle2" color="primary.main" fontWeight={700}>System Status</Typography>
                  <Typography variant="h6" fontWeight={800}>Live Scan Terminal</Typography>
                </Box>
                <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'success.main', animation: 'pulse 1.5s infinite' }} />
              </Stack>
              
              <Box 
                sx={{ 
                  bgcolor: 'background.default', 
                  borderRadius: 3, 
                  height: 200, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  position: 'relative',
                  border: '1px dashed',
                  borderColor: 'divider',
                  mb: 3
                }}
              >
                <Stack alignItems="center" spacing={1.5}>
                  <CameraAltIcon color="disabled" sx={{ fontSize: 40 }} />
                  <Typography variant="body2" color="text.secondary">Webcam Feed Simulation Ready</Typography>
                </Stack>
                
                {/* Simulated Bounding Box */}
                <Box 
                  sx={{ 
                    position: 'absolute',
                    width: 100,
                    height: 100,
                    border: '2px solid',
                    borderColor: 'primary.main',
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'rgba(79, 70, 229, 0.05)',
                  }}
                >
                  <Box sx={{ color: 'primary.main', fontWeight: 700, fontSize: '0.75rem', px: 1, py: 0.2, bgcolor: 'white', borderRadius: 1, position: 'absolute', top: -14 }}>
                    Jane Doe (98%)
                  </Box>
                </Box>
              </Box>
              
              <Stack spacing={1.5}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" fontWeight={600}>Model Version</Typography>
                  <Typography variant="body2" color="text.secondary" fontFamily="monospace">SSD_mobilenet_v1</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" fontWeight={600}>Database Size</Typography>
                  <Typography variant="body2" color="text.secondary">Local Storage Cache</Typography>
                </Box>
              </Stack>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
