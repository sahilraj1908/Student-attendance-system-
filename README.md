# Student Attendance Face System

A modern, web-based student attendance system built with React, Material-UI, and Vite. It utilizes facial recognition technology (`face-api.js`) to automatically mark student attendance via a webcam feed and provides an easy way to export attendance records to Excel.

## Features

- 📸 **Facial Recognition**: Automated attendance tracking using real-time face detection with `face-api.js`.
- 📷 **Webcam Integration**: Seamless webcam capture directly in the browser via `react-webcam`.
- 📊 **Excel Export**: Export the collected daily or monthly attendance data into `.xlsx` format for administrative use.
- 🎨 **Modern UI**: Clean, responsive, and intuitive user interface built using React and Material-UI.
- ⚡ **Fast Performance**: Powered by Vite for lightning-fast Hot Module Replacement (HMR) and optimized production builds.

## Tech Stack

- **Frontend Framework**: React 18, React Router DOM
- **Build Tool**: Vite
- **UI Component Library**: Material-UI (MUI) and Emotion
- **Facial Recognition**: `face-api.js`
- **Camera Handling**: `react-webcam`
- **Data Export**: `xlsx`

## Getting Started

Follow these instructions to set up and run the project locally.

### Prerequisites

- [Node.js](https://nodejs.org/) (version 16 or later recommended)
- `npm` or `yarn` installed

### Installation

1. Clone the repository (or extract the project folder):
   ```bash
   git clone <your-repository-url>
   cd "student attendence system"
   ```

2. Install the dependencies:
   ```bash
   npm install
   ```

3. Download the necessary `face-api.js` models. Create a `models` folder inside the `public` directory (if not already present), and place the required model files (e.g., `tiny_face_detector_model`, `face_landmark_68_model`, `face_recognition_model`) inside it.

### Running the App Locally

To start the Vite development server, run:

```bash
npm run dev
```

Your app will be available at `http://localhost:5173/`.

### Building for Production

To create an optimized production build, run:

```bash
npm run build
```

This will generate a `dist` folder containing the compiled assets. To preview the production build locally, run:

```bash
npm run preview
```

## Folder Structure

```
student attendence system/
├── public/               # Static assets (including face-api models)
├── src/                  # Application source code
│   ├── components/       # Reusable React components
│   ├── pages/            # Application routes/pages
│   ├── App.jsx           # Main App component
│   └── main.jsx          # Entry point
├── index.html            # Main HTML template
├── package.json          # Project metadata and dependencies
└── vite.config.js        # Vite configuration
```

## License

This project is licensed under the [MIT License](LICENSE).
