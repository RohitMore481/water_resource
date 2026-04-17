# JeevanRakshak 🫧

**Water pipeline monitoring & analytics** — detects water contamination (TDS/impurities) and pipeline leaks using pressure and TDS sensors, visualized with an interactive GIS-enabled React dashboard.

---

## Overview

JeevanRakshak is an end-to-end platform for monitoring water quality and pipeline health. It ingests sensor data (pressure & Total Dissolved Solids), runs detection algorithms for contamination and leaks, and presents results on an interactive dashboard with GIS mapping, charts, alerts, and historical trends.

This repository contains: a Flask-based analysis and simulation backend (EPANet integration and analytics), and two React applications for visualization: `Dashboard` (main UI) and `gisTracking-main` (GIS-focused tracking interface).

---

## Features ✅

- Real-time and historical visualization of sensor feeds (Pressure & TDS)
- Contamination detection using TDS thresholds and trend analysis
- Leak detection via pressure anomaly detection (sudden drops/changes)
- Interactive GIS map for sensor locations and incident overlays
- Dashboards and charts (time series, summaries, comparisons)
- Alerts / Notification center and event history
- Modular React components and context-based state management

---

## Tech stack 🔧

- Frontend: React, Tailwind CSS, CRACO
- Backend / Analysis: Flask, EPANet (via `epanettools`), Python (pandas, numpy)
- Realtime / Hosting: Firebase (see `src/firebaseConfig.js` in `Dashboard`) or other configured backends
- Charts & Maps: (charting & GIS libraries used in project)

---

## Quick Start 🚀

### Prerequisites

- Node.js + npm
- Python 3.8+
- (Optional) Create a Python virtual environment

### Run the Flask analysis & simulation modules

1. Create and activate a Python virtual environment (recommended)

```bash
python -m venv venv
# Windows
venv\Scripts\activate
# macOS / Linux
source venv/bin/activate
```

2. Install Python requirements

```bash
pip install -r requirements.txt
# or install manually:
# pip install Flask Flask-Cors pandas numpy matplotlib seaborn scikit-learn tensorflow epanettools
```

3. Run specific analysis scripts

```bash
py waterquality.py
py sensor_allocation_final.py
py finalpilferage.py
py leak_model.py
```

> Note: Some scripts expect EPANet input files and configuration. Check the script headers for usage details.

### Run the React GIS app (`gisTracking-main`)

```bash
cd gisTracking-main
npm install
npm start
```

Open http://localhost:3000

### Run the Dashboard app (`Dashboard`)

```bash
cd Dashboard
npm install
npm start
```

Open http://localhost:3000 and navigate to dashboard / GIS pages.

> Configure API keys and Firebase settings in `Dashboard/src/firebaseConfig.js` before using realtime features.

---

## How it works (short) 💡

Sensors stream pressure and TDS values to a backend (or Firebase). The backend runs threshold checks and simple anomaly detection models to flag contamination or leaks. The frontend shows live sensor statuses on a GIS map, provides charts for trends, and displays alerts for operator response.

---

## Recommended GitHub Topics

`water-quality`, `leak-detection`, `contamination-detection`, `gis`, `react`, `dashboard`, `iot`, `sensors`, `firebase`, `tailwindcss`

---

## Contributing

Contributions are welcome. Please open an issue or submit a pull request with tests and clear description of changes.

---

## License

This project is available under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

## Credits & Acknowledgements

- EPANet / `epanettools` for hydraulic network simulation
- Flask for backend web modules
- TensorFlow / scikit-learn for model implementations
- React and UI libraries for interactive dashboards

---

## Screenshots / Demo

*(Add screenshots or a link to a live demo here to make the README more engaging.)*

---

If you'd like, I can also add badges (build, license, demo) and a screenshot to the top of this file. Let me know what demo link or CI you want included.

