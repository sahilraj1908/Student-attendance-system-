import { useCallback, useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import {
  Box,
  Paper,
  Typography,
  Alert,
  LinearProgress,
  Stack,
  Chip,
  Grid,
  Card,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Divider,
} from '@mui/material';
import { keyframes } from '@emotion/react';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';
import WarningIcon from '@mui/icons-material/Warning';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useAttendance } from '../context/AttendanceContext';
import { loadFaceModels, faceapi } from '../utils/faceModels';
import { findBestMatch } from '../utils/faceMatch';

const DETECT_INTERVAL_MS = 250;
const RECOGNITION_COOLDOWN_MS = 5000;

const videoConstraints = {
  width: { ideal: 640 },
  height: { ideal: 480 },
  facingMode: 'user',
};

// Scan line animation
const scanLine = keyframes`
  0% { transform: translateY(0); }
  50% { transform: translateY(300px); }
  100% { transform: translateY(0); }
`;

const pulse = keyframes`
  0% { opacity: 0.4; }
  50% { opacity: 0.8; }
  100% { opacity: 0.4; }
`;

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

export default function CameraFeed() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const lastRecognizeRef = useRef({ studentId: null, at: 0 });

  const { students, markAttendance, hydrated } = useAttendance();

  const [modelsReady, setModelsReady] = useState(false);
  const [modelError, setModelError] = useState(null);
  const [status, setStatus] = useState({ type: 'info', message: 'Initializing camera feed…' });
  const [sessionLogs, setSessionLogs] = useState([]);

  useEffect(() => {
    let cancelled = false;
    loadFaceModels()
      .then(() => {
        if (!cancelled) {
          setModelsReady(true);
          setStatus({ type: 'info', message: 'Biometric models loaded. Position face in frame.' });
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setModelError(e?.message || 'Failed to load face models');
          setStatus({ type: 'error', message: 'Could not load face models.' });
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const runDetection = useCallback(async () => {
    const video = webcamRef.current?.video;
    const canvas = canvasRef.current;
    if (!modelsReady || !video || !canvas || video.readyState !== 4) return;

    const displaySize = { width: video.videoWidth, height: video.videoHeight };
    if (!displaySize.width || !displaySize.height) return;

    faceapi.matchDimensions(canvas, displaySize);

    try {
      const detections = await faceapi
        .detectAllFaces(video, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }))
        .withFaceLandmarks()
        .withFaceDescriptors();

      const resized = faceapi.resizeResults(detections, displaySize);
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Custom draw boxes
      resized.forEach(det => {
        const { box } = det.detection;
        ctx.strokeStyle = '#4f46e5';
        ctx.lineWidth = 3;
        ctx.strokeRect(box.x, box.y, box.width, box.height);
      });

      if (!students.length) {
        setStatus({
          type: 'warning',
          message: 'Registry is empty. Register students in the Student Registry first.',
        });
        return;
      }

      if (resized.length === 0) {
        setStatus({ type: 'info', message: 'Scanning... Please look directly at the camera.' });
        return;
      }

      // Use the largest face (by box area) for recognition
      const bestFace = resized.reduce((a, b) => {
        const area = (d) => d.detection.box.width * d.detection.box.height;
        return area(a) >= area(b) ? a : b;
      });

      const match = findBestMatch(bestFace.descriptor, students);
      const now = Date.now();
      const cool = lastRecognizeRef.current;

      if (!match) {
        setStatus({
          type: 'warning',
          message: 'Face detected — unknown student. Please register your biometric file first.',
        });
        return;
      }

      const { student } = match;
      const sameRecent =
        cool.studentId === student.studentId && now - cool.at < RECOGNITION_COOLDOWN_MS;

      if (sameRecent) {
        setStatus({
          type: 'success',
          message: `Scanning active: Verified ${student.name}.`,
        });
        return;
      }

      lastRecognizeRef.current = { studentId: student.studentId, at: now };
      const result = markAttendance(student.studentId, student.name);

      const timestamp = new Date().toLocaleTimeString();
      const logEntry = {
        id: `${student.studentId}-${now}`,
        name: student.name,
        studentId: student.studentId,
        department: student.department || 'Computer Science',
        time: timestamp,
        status: result.duplicate ? 'Duplicate' : 'Success',
      };

      setSessionLogs((prev) => [logEntry, ...prev.slice(0, 9)]);

      if (result.duplicate) {
        setStatus({
          type: 'success',
          message: `${student.name} is already marked present for today.`,
        });
      } else {
        setStatus({
          type: 'success',
          message: `Attendance marked successfully for ${student.name}!`,
        });
      }
    } catch (e) {
      console.error(e);
      setStatus({ type: 'error', message: 'Face tracker frame error.' });
    }
  }, [modelsReady, students, markAttendance]);

  useEffect(() => {
    if (!modelsReady || !hydrated) return;

    const tick = () => {
      runDetection();
      rafRef.current = window.setTimeout(tick, DETECT_INTERVAL_MS);
    };
    tick();
    return () => {
      if (rafRef.current) clearTimeout(rafRef.current);
    };
  }, [modelsReady, hydrated, runDetection]);

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={850} gutterBottom>
          Face Attendance Terminal
        </Typography>
        <Typography color="text.secondary">
          Position your face in the camera viewport. The tracker will scan and record attendance automatically.
        </Typography>
      </Box>

      {modelError && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {modelError}
        </Alert>
      )}

      {!modelsReady && !modelError && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            Loading facial match layers...
          </Typography>
          <LinearProgress />
        </Box>
      )}

      <Grid container spacing={4}>
        {/* Left Pane - Live Camera Feed */}
        <Grid item xs={12} lg={7}>
          <Paper 
            sx={{ 
              position: 'relative', 
              overflow: 'hidden', 
              borderRadius: 5, 
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: '#0f172a', // Slate 900
              aspectRatio: '4/3',
              width: '100%',
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
            <canvas
              ref={canvasRef}
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
              }}
            />

            {/* Scanning Laser Line Overlay */}
            {modelsReady && (
              <Box
                sx={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: 0,
                  height: '4px',
                  background: 'linear-gradient(90deg, rgba(79,70,229,0) 0%, rgba(79,70,229,1) 50%, rgba(79,70,229,0) 100%)',
                  boxShadow: '0 0 12px #4f46e5, 0 0 20px #818cf8',
                  animation: `${scanLine} 4s linear infinite`,
                  pointerEvents: 'none',
                }}
              />
            )}

            {/* Corner Indicators */}
            <Box sx={{ position: 'absolute', top: 20, left: 20, width: 24, height: 24, borderLeft: '3px solid #4f46e5', borderTop: '3px solid #4f46e5' }} />
            <Box sx={{ position: 'absolute', top: 20, right: 20, width: 24, height: 24, borderRight: '3px solid #4f46e5', borderTop: '3px solid #4f46e5' }} />
            <Box sx={{ position: 'absolute', bottom: 20, left: 20, width: 24, height: 24, borderLeft: '3px solid #4f46e5', borderBottom: '3px solid #4f46e5' }} />
            <Box sx={{ position: 'absolute', bottom: 20, right: 20, width: 24, height: 24, borderRight: '3px solid #4f46e5', borderBottom: '3px solid #4f46e5' }} />
          </Paper>
        </Grid>

        {/* Right Pane - Scanner Controls & Real-Time Feed logs */}
        <Grid item xs={12} lg={5}>
          <Stack spacing={3} sx={{ height: '100%' }}>
            {/* Status Panel */}
            <Card sx={{ p: 3, border: '1px solid', borderColor: 'divider' }} elevation={0}>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                <Box 
                  sx={{ 
                    bgcolor: modelsReady ? 'success.light' : 'action.disabledBackground', 
                    color: modelsReady ? 'success.dark' : 'text.disabled',
                    p: 1, 
                    borderRadius: 3,
                    display: 'flex',
                    animation: modelsReady ? `${pulse} 2s infinite` : 'none',
                  }}
                >
                  <CameraAltIcon />
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Scanner State</Typography>
                  <Typography variant="body1" fontWeight={750}>
                    {modelsReady ? 'Active Sensing' : 'Waiting for Models'}
                  </Typography>
                </Box>
              </Stack>

              <Alert 
                severity={status.type === 'error' ? 'error' : status.type === 'success' ? 'success' : status.type === 'warning' ? 'warning' : 'info'}
                icon={status.type === 'success' ? <CheckCircleIcon /> : status.type === 'warning' ? <WarningIcon /> : <InfoIcon />}
                sx={{ borderRadius: 2 }}
              >
                {status.message}
              </Alert>
            </Card>

            {/* Live Scan Log Section */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 1.5 }}>
                Current Session Activity
              </Typography>
              
              <Paper sx={{ p: 2, flex: 1, overflow: 'auto', maxHeight: 330, border: '1px solid', borderColor: 'divider' }}>
                {sessionLogs.length === 0 ? (
                  <Box sx={{ p: 6, textAlign: 'center', color: 'text.secondary' }}>
                    <AccountCircleIcon sx={{ fontSize: 40, mb: 1, color: 'text.disabled' }} />
                    <Typography variant="body2">No scans registered in this session.</Typography>
                  </Box>
                ) : (
                  <List disablePadding>
                    {sessionLogs.map((log, idx) => (
                      <Box key={log.id}>
                        {idx > 0 && <Divider />}
                        <ListItem sx={{ py: 1.2, px: 1 }}>
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: stringToColor(log.name), fontWeight: 700, fontSize: '0.85rem' }}>
                              {log.name[0].toUpperCase()}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="body2" fontWeight={700}>
                                  {log.name}
                                </Typography>
                                <Chip 
                                  label={log.status} 
                                  color={log.status === 'Success' ? 'success' : 'warning'} 
                                  size="small" 
                                  sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700 }}
                                />
                              </Box>
                            }
                            secondary={
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.3 }}>
                                <Typography variant="caption" color="text.secondary">
                                  ID: {log.studentId} • {log.department}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {log.time}
                                </Typography>
                              </Box>
                            }
                          />
                        </ListItem>
                      </Box>
                    ))}
                  </List>
                )}
              </Paper>
            </Box>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}

