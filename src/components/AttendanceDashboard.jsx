import { useMemo, useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  MenuItem,
  Button,
  Stack,
  Chip,
  Grid,
  Card,
  IconButton,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import TableChartIcon from '@mui/icons-material/TableChart';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import GroupsIcon from '@mui/icons-material/Groups';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import DateRangeIcon from '@mui/icons-material/DateRange';
import { useAttendance } from '../context/AttendanceContext';
import { downloadCsv, downloadExcel } from '../utils/exportAttendance';

const DEPARTMENTS = [
  'Computer Science',
  'Information Technology',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Business Administration',
  'General Sciences'
];

function formatClock(d) {
  return d.toLocaleString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function formatTime(iso) {
  try {
    return new Date(iso).toLocaleTimeString();
  } catch {
    return iso;
  }
}

export default function AttendanceDashboard() {
  const { students, attendanceRecords, hydrated, clearAllData } = useAttendance();
  const today = new Date().toISOString().slice(0, 10);

  const [filterDate, setFilterDate] = useState(today);
  const [filterStudentId, setFilterStudentId] = useState('all');
  const [filterDept, setFilterDept] = useState('all');
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Filter records based on selected date, student and department
  const filteredRows = useMemo(() => {
    let list = attendanceRecords.filter((r) => r.date === filterDate);
    
    if (filterDept !== 'all') {
      list = list.filter((r) => r.department === filterDept);
    }
    if (filterStudentId !== 'all') {
      list = list.filter((r) => r.studentId === filterStudentId);
    }
    
    return list.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [attendanceRecords, filterDate, filterDept, filterStudentId]);

  // Statistics
  const totalStudentsInDept = useMemo(() => {
    if (filterDept === 'all') return students.length;
    return students.filter(s => s.department === filterDept).length;
  }, [students, filterDept]);

  const presentCount = useMemo(() => {
    // Count unique studentIds marked present today/selected date in the filtered subset
    const uniquePresent = new Set();
    filteredRows.forEach(r => uniquePresent.add(r.studentId));
    return uniquePresent.size;
  }, [filteredRows]);

  const absentCount = useMemo(() => {
    return Math.max(0, totalStudentsInDept - presentCount);
  }, [totalStudentsInDept, presentCount]);

  const attendancePercentage = useMemo(() => {
    if (totalStudentsInDept === 0) return 0;
    return Math.round((presentCount / totalStudentsInDept) * 100);
  }, [presentCount, totalStudentsInDept]);

  // Peak Scanning Hour Calculation
  const peakHour = useMemo(() => {
    if (filteredRows.length === 0) return 'N/A';
    const hourCounts = {};
    filteredRows.forEach(r => {
      try {
        const hr = new Date(r.timestamp).getHours();
        hourCounts[hr] = (hourCounts[hr] || 0) + 1;
      } catch (e) {
        console.error(e);
      }
    });

    let maxHr = -1;
    let maxVal = -1;
    Object.entries(hourCounts).forEach(([hr, val]) => {
      if (val > maxVal) {
        maxVal = val;
        maxHr = parseInt(hr);
      }
    });

    if (maxHr === -1) return 'N/A';
    const ampm = maxHr >= 12 ? 'PM' : 'AM';
    const displayHr = maxHr % 12 === 0 ? 12 : maxHr % 12;
    return `${displayHr}:00 ${ampm}`;
  }, [filteredRows]);

  // SVG Chart: Weekly Attendance History (Last 7 Days)
  const last7DaysData = useMemo(() => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      
      // Calculate count for this specific day
      const count = attendanceRecords.filter(r => r.date === dateStr).length;
      
      // Readable Label (e.g., "Mon", "Tue")
      const label = d.toLocaleDateString(undefined, { weekday: 'short' });
      data.push({ label, count, dateStr });
    }
    return data;
  }, [attendanceRecords]);

  const maxChartVal = useMemo(() => {
    const max = Math.max(...last7DaysData.map(d => d.count));
    return max === 0 ? 5 : Math.ceil(max * 1.2);
  }, [last7DaysData]);

  // SVG chart dimensions & paths
  const chartPoints = useMemo(() => {
    const width = 500;
    const height = 150;
    const paddingLeft = 40;
    const paddingRight = 20;
    const paddingTop = 20;
    const paddingBottom = 30;

    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    const points = last7DaysData.map((d, i) => {
      const x = paddingLeft + (i * (chartWidth / 6));
      const y = paddingTop + chartHeight - (d.count / maxChartVal) * chartHeight;
      return { x, y, label: d.label, val: d.count };
    });

    const pathD = points.reduce((acc, p, idx) => {
      return idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
    }, '');

    // Area path closed to bottom
    const areaD = points.length > 0 
      ? `${pathD} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`
      : '';

    return { points, pathD, areaD, width, height, paddingLeft, paddingRight, paddingTop, paddingBottom, chartWidth, chartHeight };
  }, [last7DaysData, maxChartVal]);

  const exportBase = `attendance_${filterDate}`;

  if (!hydrated) {
    return (
      <Typography color="text.secondary">Loading attendance database…</Typography>
    );
  }

  return (
    <Box>
      {/* Top Header Block */}
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', md: 'center' }}
        spacing={2}
        sx={{ mb: 4 }}
      >
        <Box>
          <Typography variant="h4" fontWeight={850} gutterBottom>
            Analytics Console
          </Typography>
          <Typography color="text.secondary">
            Real-time charts, department aggregates, and spreadsheet export logs.
          </Typography>
        </Box>
        <Paper
          elevation={0}
          sx={{
            px: 2.5,
            py: 1.5,
            display: 'flex',
            alignItems: 'center',
            gap: 1.2,
            bgcolor: 'primary.light',
            color: 'primary.dark',
            borderRadius: 3,
            border: 'none',
          }}
        >
          <AccessTimeIcon />
          <Typography variant="body1" fontWeight={700} fontFamily="monospace">
            {formatClock(now)}
          </Typography>
        </Paper>
      </Stack>

      {/* Metric Cards Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 3, border: '1px solid', borderColor: 'divider', position: 'relative', overflow: 'hidden' }} elevation={0}>
            <Stack spacing={1}>
              <Typography variant="overline" color="text.secondary" fontWeight={600}>
                Present Count
              </Typography>
              <Typography variant="h3" color="success.main" fontWeight={850}>
                {presentCount}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {attendancePercentage}% Present Rate
              </Typography>
            </Stack>
            <AssignmentTurnedInIcon sx={{ position: 'absolute', right: 16, bottom: 16, fontSize: 40, opacity: 0.1, color: 'success.main' }} />
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 3, border: '1px solid', borderColor: 'divider', position: 'relative', overflow: 'hidden' }} elevation={0}>
            <Stack spacing={1}>
              <Typography variant="overline" color="text.secondary" fontWeight={600}>
                Absent Count
              </Typography>
              <Typography variant="h3" color="error.main" fontWeight={850}>
                {absentCount}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Requires validation checks
              </Typography>
            </Stack>
            <PersonOutlineIcon sx={{ position: 'absolute', right: 16, bottom: 16, fontSize: 40, opacity: 0.1, color: 'error.main' }} />
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 3, border: '1px solid', borderColor: 'divider', position: 'relative', overflow: 'hidden' }} elevation={0}>
            <Stack spacing={1}>
              <Typography variant="overline" color="text.secondary" fontWeight={600}>
                Target Group Directory
              </Typography>
              <Typography variant="h3" fontWeight={850}>
                {totalStudentsInDept}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {filterDept === 'all' ? 'All departments' : filterDept}
              </Typography>
            </Stack>
            <GroupsIcon sx={{ position: 'absolute', right: 16, bottom: 16, fontSize: 40, opacity: 0.1 }} />
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 3, border: '1px solid', borderColor: 'divider', position: 'relative', overflow: 'hidden' }} elevation={0}>
            <Stack spacing={1}>
              <Typography variant="overline" color="text.secondary" fontWeight={600}>
                Peak Activity Hour
              </Typography>
              <Typography variant="h3" color="primary.main" fontWeight={850}>
                {peakHour}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Highest scanner traffic time
              </Typography>
            </Stack>
            <DateRangeIcon sx={{ position: 'absolute', right: 16, bottom: 16, fontSize: 40, opacity: 0.1, color: 'primary.main' }} />
          </Card>
        </Grid>
      </Grid>

      {/* Interactive Custom SVG Chart Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Weekly Line Chart */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" fontWeight={750} sx={{ mb: 3 }}>
              Weekly Activity Volume (Last 7 Days)
            </Typography>
            
            <Box sx={{ width: '100%', overflow: 'hidden' }}>
              <svg viewBox={`0 0 ${chartPoints.width} ${chartPoints.height}`} width="100%" height="auto" style={{ display: 'block' }}>
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid Lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((val, idx) => {
                  const y = chartPoints.paddingTop + val * chartPoints.chartHeight;
                  const label = Math.round(maxChartVal - val * maxChartVal);
                  return (
                    <g key={idx}>
                      <line 
                        x1={chartPoints.paddingLeft} 
                        y1={y} 
                        x2={chartPoints.width - chartPoints.paddingRight} 
                        y2={y} 
                        stroke="#f1f5f9" 
                        strokeWidth="1"
                      />
                      <text 
                        x={chartPoints.paddingLeft - 10} 
                        y={y + 4} 
                        fill="#94a3b8" 
                        fontSize="10" 
                        textAnchor="end"
                        fontFamily="monospace"
                      >
                        {label}
                      </text>
                    </g>
                  );
                })}

                {/* Shaded Area */}
                {chartPoints.areaD && (
                  <path d={chartPoints.areaD} fill="url(#chartGradient)" />
                )}

                {/* Chart Path Line */}
                {chartPoints.pathD && (
                  <path 
                    d={chartPoints.pathD} 
                    fill="none" 
                    stroke="#4f46e5" 
                    strokeWidth="3" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                  />
                )}

                {/* Data Nodes & Labels */}
                {chartPoints.points.map((p, idx) => (
                  <g key={idx}>
                    <circle 
                      cx={p.x} 
                      cy={p.y} 
                      r="5" 
                      fill="#ffffff" 
                      stroke="#4f46e5" 
                      strokeWidth="3" 
                    />
                    
                    {/* Value Badge on Node hover mock */}
                    <text
                      x={p.x}
                      y={p.y - 10}
                      fill="#0f172a"
                      fontSize="9"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {p.val > 0 ? p.val : ''}
                    </text>

                    {/* X Axis Label */}
                    <text 
                      x={p.x} 
                      y={chartPoints.height - 10} 
                      fill="#64748b" 
                      fontSize="10" 
                      fontWeight="600"
                      textAnchor="middle"
                    >
                      {p.label}
                    </text>
                  </g>
                ))}
              </svg>
            </Box>
          </Paper>
        </Grid>

        {/* Circular gauge */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" fontWeight={750} sx={{ mb: 2 }}>
              Group Target Load
            </Typography>
            
            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', py: 2 }}>
              <Box sx={{ position: 'relative', width: 140, height: 140 }}>
                {/* SVG Gauge */}
                <svg viewBox="0 0 100 100" width="100%" height="100%">
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="40" 
                    fill="none" 
                    stroke="#f1f5f9" 
                    strokeWidth="10" 
                  />
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="40" 
                    fill="none" 
                    stroke="#7c3aed" 
                    strokeWidth="10" 
                    strokeDasharray={`${2.51 * attendancePercentage} 251`}
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                  />
                </svg>
                {/* Visual Label */}
                <Box 
                  sx={{ 
                    position: 'absolute', 
                    top: 0, 
                    left: 0, 
                    right: 0, 
                    bottom: 0, 
                    display: 'flex', 
                    flexDirection: 'column',
                    alignItems: 'center', 
                    justifyContent: 'center' 
                  }}
                >
                  <Typography variant="h4" fontWeight={850}>
                    {attendancePercentage}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Present
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Typography variant="body2" color="text.secondary" align="center">
              Active Attendance Rate for selected filter parameters.
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Filters & Actions Panel */}
      <Paper sx={{ p: 3, mb: 3, border: '1px solid', borderColor: 'divider' }}>
        <Stack
          direction={{ xs: 'column', lg: 'row' }}
          spacing={2}
          alignItems={{ xs: 'stretch', lg: 'center' }}
          flexWrap="wrap"
        >
          <TextField
            label="Date"
            type="date"
            size="small"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 160 }}
          />

          <TextField
            select
            label="Class / Department"
            size="small"
            value={filterDept}
            onChange={(e) => {
              setFilterDept(e.target.value);
              setFilterStudentId('all'); // Reset student filter when department changes
            }}
            sx={{ minWidth: 180 }}
          >
            <MenuItem value="all">All Departments</MenuItem>
            {DEPARTMENTS.map((dept) => (
              <MenuItem key={dept} value={dept}>
                {dept}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Student profile"
            size="small"
            value={filterStudentId}
            onChange={(e) => setFilterStudentId(e.target.value)}
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="all">All student profiles</MenuItem>
            {students
              .filter(s => filterDept === 'all' || s.department === filterDept)
              .map((s) => (
                <MenuItem key={s.studentId} value={s.studentId}>
                  {s.name} ({s.studentId})
                </MenuItem>
              ))}
          </TextField>

          <Chip 
            label={`${filteredRows.length} Log Entries`} 
            size="small" 
            variant="outlined" 
            sx={{ py: 1.5, px: 1, fontWeight: 600, color: 'text.secondary' }}
          />

          <Box sx={{ flex: 1 }} />

          <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
            <Button
              startIcon={<DownloadIcon />}
              variant="outlined"
              onClick={() => downloadCsv(filteredRows, exportBase)}
              sx={{ borderRadius: 3 }}
            >
              CSV
            </Button>
            <Button
              startIcon={<TableChartIcon />}
              variant="contained"
              onClick={() => downloadExcel(filteredRows, exportBase)}
              sx={{ borderRadius: 3 }}
            >
              Excel
            </Button>
            <IconButton 
              color="error" 
              onClick={() => {
                if (window.confirm("Are you sure you want to clear all attendance logs and student biometric profiles?")) {
                  clearAllData();
                }
              }}
              title="Reset Database"
              sx={{ 
                bgcolor: 'rgba(239, 68, 68, 0.05)',
                '&:hover': {
                  bgcolor: 'rgba(239, 68, 68, 0.15)',
                },
                borderRadius: 3,
                p: 1.2
              }}
            >
              <DeleteSweepIcon />
            </IconButton>
          </Stack>
        </Stack>
      </Paper>

      {/* Attendance Logs Table */}
      <TableContainer component={Paper} sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Student Name</TableCell>
              <TableCell>Student ID</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Timestamp</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Box sx={{ py: 6, color: 'text.secondary' }}>
                    <Typography variant="body1" fontWeight={600} sx={{ mb: 0.5 }}>
                      No scan logs match filters
                    </Typography>
                    <Typography variant="body2">
                      Try selecting another date or launch the Face Scanner to mark presence.
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              filteredRows.map((r) => (
                <TableRow key={r.id} hover>
                  <TableCell sx={{ fontWeight: 700 }}>{r.studentName}</TableCell>
                  <TableCell sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>{r.studentId}</TableCell>
                  <TableCell>
                    <Chip 
                      label={r.department || 'Computer Science'} 
                      size="small" 
                      sx={{ bgcolor: 'rgba(79, 70, 229, 0.05)', color: 'primary.main', fontWeight: 600, height: 22 }}
                    />
                  </TableCell>
                  <TableCell>{r.date}</TableCell>
                  <TableCell>{formatTime(r.timestamp)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

