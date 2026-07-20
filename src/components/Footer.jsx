import { Box, Container, Typography, Link } from '@mui/material';

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        mt: 'auto',
        py: 3,
        borderTop: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <Container maxWidth="lg">
        <Typography variant="body2" color="text.secondary" align="center">
          Student Attendance System — Face detection via{' '}
          <Link href="https://github.com/justadudewhohacks/face-api.js" target="_blank" rel="noreferrer">
            face-api.js
          </Link>
          . Data stored locally in your browser.
        </Typography>
      </Container>
    </Box>
  );
}
