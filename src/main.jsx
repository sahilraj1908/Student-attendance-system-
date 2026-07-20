import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import App from './App';
import { AttendanceProvider } from './context/AttendanceContext';
import { theme } from './theme';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AttendanceProvider>
          <App />
        </AttendanceProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
