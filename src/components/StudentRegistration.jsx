import { useEffect, useRef, useState, useMemo } from 'react';
import Webcam from 'react-webcam';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Stack,
  LinearProgress,
  MenuItem,
  Grid,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  IconButton,
  InputAdornment,
  Divider,
} from '@mui/material';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import SchoolIcon from '@mui/icons-material/School';
import { useAttendance } from '../context/AttendanceContext';
import { loadFaceModels, faceapi } from '../utils/faceModels';

const videoConstraints = {
  width: { ideal: 640 },
  height: { ideal: 480 },
  facingMode: 'user',
};

const DEPARTMENTS = [
  'Computer Science',
  'Information Technology',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Business Administration',
  'General Sciences'
];

function stringToColor(string) {
  let hash = 0;
  for (let i = 0; i < string.length; i++) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }
  return color;
}

export default function StudentRegistration() {
  const webcamRef = useRef(null);
  const { students, registerStudent, removeStudent } = useAttendance();

  const [studentId, setStudentId] = useState('');
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('Computer Science');
  const [modelsReady, setModelsReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);

  // Registry list states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDept, setFilterDept] = useState('all');

  useEffect(() => {
    let cancelled = false;
    loadFaceModels()
      .then(() => {
        if (!cancelled) setModelsReady(true);
      })
      .catch(() => {
        if (!cancelled) setMessage({ type: 'error', text: 'Failed to load face models.' });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const captureAndRegister = async () => {
    setMessage(null);
    const id = studentId.trim();
    const displayName = name.trim();
    if (!id || !displayName) {
      setMessage({ type: 'warning', text: 'Enter both student ID and name.' });
      return;
    }
    if (!modelsReady || !webcamRef.current) {
      setMessage({ type: 'error', text: 'Camera or models not ready.' });
      return;
    }

    setBusy(true);
    try {
      const screenshot = webcamRef.current.getScreenshot();
      if (!screenshot) {
        setMessage({ type: 'error', text: 'Could not read camera frame.' });
        return;
      }

      const img = await faceapi.fetchImage(screenshot);
      const detection = await faceapi
        .detectSingleFace(img, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }))
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        setMessage({
          type: 'error',
          text: 'No face found. Center your face in the camera, ensure good lighting, and try again.',
        });
        return;
      }

      const faceDescriptor = Array.from(detection.descriptor);
      const res = registerStudent({ 
        studentId: id, 
        name: displayName, 
        department, 
        faceDescriptor 
      });

      if (!res.ok) {
        setMessage({ type: 'error', text: res.error || 'Registration failed.' });
        return;
      }

      setMessage({
        type: 'success',
        text: `Successfully registered ${displayName} (${id}) to ${department}.`,
      });
      setStudentId('');
      setName('');
    } catch (e) {
      console.error(e);
      setMessage({ type: 'error', text: 'Capture failed — try again.' });
    } finally {
      setBusy(false);
    }
  };

  // Filter and search students
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchesSearch = 
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.studentId.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesDept = 
        filterDept === 'all' || 
        s.department === filterDept;

      return matchesSearch && matchesDept;
    });
  }, [students, searchQuery, filterDept]);

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={850} gutterBottom>
          Student Registry
        </Typography>
        <Typography color="text.secondary">
          Register new student face biometric signatures and manage existing records.
        </Typography>
      </Box>

      {!modelsReady && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            Loading facial recognition models...
          </Typography>
          <LinearProgress />
        </Box>
      )}

      <Grid container spacing={4}>
        {/* Left Pane - Register Student */}
        <Grid item xs={12} md={6}>
          <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 2 }}>
            Register New Student
          </Typography>
          
          <Stack spacing={3}>
            <Paper sx={{ p: 3, border: '1px solid', borderColor: 'divider' }}>
              <Stack spacing={2.5}>
                <TextField
                  label="Student ID"
                  placeholder="e.g., CS-2026-45"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  fullWidth
                  required
                  variant="outlined"
                  size="small"
                />
                <TextField
                  label="Full Name"
                  placeholder="e.g., Jane Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  fullWidth
                  required
                  variant="outlined"
                  size="small"
                />
                <TextField
                  select
                  label="Class / Department"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  fullWidth
                  required
                  variant="outlined"
                  size="small"
                >
                  {DEPARTMENTS.map((dept) => (
                    <MenuItem key={dept} value={dept}>
                      {dept}
                    </MenuItem>
                  ))}
                </TextField>

                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  startIcon={<PersonAddAltIcon />}
                  onClick={captureAndRegister}
                  disabled={busy || !modelsReady}
                  sx={{ py: 1.5 }}
                >
                  {busy ? 'Extracting biometric data…' : 'Capture & Register'}
                </Button>
                
                {message && (
                  <Alert severity={message.type} sx={{ borderRadius: 2 }}>
                    {message.text}
                  </Alert>
                )}
              </Stack>
            </Paper>

            <Paper
              elevation={0}
              sx={{
                position: 'relative',
                overflow: 'hidden',
                borderRadius: 4,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'black',
                aspectRatio: '4/3',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Webcam
                ref={webcamRef}
                audio={false}
                videoConstraints={videoConstraints}
                screenshotFormat="image/jpeg"
                mirrored={false}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
              
              {/* Camera Guide Corners Overlay */}
              <Box 
                sx={{
                  position: 'absolute',
                  top: '15%',
                  bottom: '15%',
                  left: '20%',
                  right: '20%',
                  border: '2px dashed rgba(255, 255, 255, 0.4)',
                  borderRadius: 4,
                  pointerEvents: 'none',
                }}
              />
              <Box 
                sx={{ 
                  position: 'absolute', 
                  bottom: 0, 
                  left: 0, 
                  right: 0, 
                  bgcolor: 'rgba(0, 0, 0, 0.65)', 
                  color: 'white',
                  px: 2, 
                  py: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <CameraAltIcon sx={{ fontSize: 16 }} />
                <Typography variant="caption">
                  Alignment Grid: Align face in target frame and ensure direct lighting.
                </Typography>
              </Box>
            </Paper>
          </Stack>
        </Grid>

        {/* Right Pane - Student Registry Directory */}
        <Grid item xs={12} md={6}>
          <Stack spacing={2} sx={{ height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" fontWeight={700}>
                Registered Records ({students.length})
              </Typography>
            </Box>

            <Paper sx={{ p: 2, border: '1px solid', borderColor: 'divider' }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  placeholder="Search by name or ID"
                  variant="outlined"
                  size="small"
                  fullWidth
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
                
                <TextField
                  select
                  value={filterDept}
                  onChange={(e) => setFilterDept(e.target.value)}
                  size="small"
                  sx={{ minWidth: { xs: '100%', sm: 180 } }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <FilterListIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                >
                  <MenuItem value="all">All Departments</MenuItem>
                  {DEPARTMENTS.map((dept) => (
                    <MenuItem key={dept} value={dept}>
                      {dept}
                    </MenuItem>
                  ))}
                </TextField>
              </Stack>
            </Paper>

            <Paper sx={{ flex: 1, overflow: 'auto', maxHeight: 600, border: '1px solid', borderColor: 'divider' }}>
              {filteredStudents.length === 0 ? (
                <Box sx={{ p: 6, textAlign: 'center' }}>
                  <SchoolIcon color="disabled" sx={{ fontSize: 48, mb: 1.5 }} />
                  <Typography variant="body1" color="text.secondary" fontWeight={600}>
                    No student files found
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Try adjusting search or add a new profile.
                  </Typography>
                </Box>
              ) : (
                <List disablePadding>
                  {filteredStudents.map((s, idx) => (
                    <Box key={s.studentId}>
                      {idx > 0 && <Divider />}
                      <ListItem
                        secondaryAction={
                          <IconButton 
                            edge="end" 
                            aria-label="delete" 
                            color="error"
                            onClick={() => removeStudent(s.studentId)}
                            sx={{
                              bgcolor: 'rgba(239, 68, 68, 0.05)',
                              '&:hover': {
                                bgcolor: 'rgba(239, 68, 68, 0.15)',
                              }
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        }
                        sx={{ py: 1.5, px: 2.5 }}
                      >
                        <ListItemAvatar>
                          <Avatar 
                            sx={{ 
                              bgcolor: stringToColor(s.name), 
                              fontWeight: 750,
                              fontSize: '0.95rem'
                            }}
                          >
                            {s.name.split(' ').map(part => part[0]).join('').substring(0, 2).toUpperCase()}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography variant="body1" fontWeight={700}>
                              {s.name}
                            </Typography>
                          }
                          secondary={
                            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mt: 0.5 }}>
                              <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                                ID: {s.studentId}
                              </Typography>
                              <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: 'text.disabled' }} />
                              <Typography variant="caption" color="primary.main" fontWeight={600}>
                                {s.department}
                              </Typography>
                            </Stack>
                          }
                        />
                      </ListItem>
                    </Box>
                  ))}
                </List>
              )}
            </Paper>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}

