const { v4: uuidv4 } = require('uuid');
const { PIPELINE_NODES, bfsAffectedNodes } = require('../graph/pipeline');

// Sensor base configurations
const SENSOR_CONFIGS = [
  { id: 'S001', name: 'Reservoir North',   location: 'North Reservoir',    lat: 28.6190, lng: 77.2100 },
  { id: 'S002', name: 'Treatment Plant A', location: 'Treatment Plant A',  lat: 28.6155, lng: 77.2060 },
  { id: 'S003', name: 'Junction West',     location: 'Western Junction',   lat: 28.6180, lng: 77.2150 },
  { id: 'S004', name: 'Distribution Hub',  location: 'Central Hub',        lat: 28.6120, lng: 77.2040 },
  { id: 'S005', name: 'Village A Tap',     location: 'Village A',          lat: 28.6130, lng: 77.2080 },
  { id: 'S006', name: 'Village B Tap',     location: 'Village B',          lat: 28.6165, lng: 77.2180 },
  { id: 'S007', name: 'Village C Tap',     location: 'Village C',          lat: 28.6090, lng: 77.2020 },
  { id: 'S008', name: 'Village D Tap',     location: 'Village D',          lat: 28.6100, lng: 77.2100 },
];

// Current live readings — exported for API use
let currentReadings = {};
let sensorHistory = {}; // stores last 50 readings per sensor
let simulationMode = 'normal'; // 'normal' | 'leak' | 'contamination'
let leakSensorId = null;
let contaminationSensorId = null;
let simulatorInterval = null;

// Alerts store (shared with alerts route)
const alertsStore = require('./alertsStore');

function randBetween(min, max, decimals = 1) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function generateReading(sensor) {
  const isLeakSensor    = simulationMode === 'leak'          && sensor.id === leakSensorId;
  const isContaminated  = simulationMode === 'contamination' && sensor.id === contaminationSensorId;

  let pressure, flow, pH, turbidity, tds, status;

  if (isLeakSensor) {
    // Sudden pressure drop, high flow loss
    pressure   = randBetween(0.5, 1.8,  2);
    flow       = randBetween(0.2, 1.0,  2);
    pH         = randBetween(6.5, 8.2,  2);
    turbidity  = randBetween(1.0, 3.0,  2);
    tds        = randBetween(150, 400,   0);
    status     = 'leak';
  } else if (isContaminated) {
    // pH drops, turbidity spikes
    pressure   = randBetween(3.5, 5.5,  2);
    flow       = randBetween(2.0, 4.5,  2);
    pH         = randBetween(4.8, 6.1,  2);
    turbidity  = randBetween(7.5, 14.0, 2);
    tds        = randBetween(600, 1200,  0);
    status     = 'contamination';
  } else {
    // Normal operation
    pressure   = randBetween(3.8, 6.2,  2);
    flow       = randBetween(2.5, 5.0,  2);
    pH         = randBetween(6.8, 7.8,  2);
    turbidity  = randBetween(0.5, 3.5,  2);
    tds        = randBetween(80,  350,   0);
    status     = 'normal';
  }

  // Leak detection logic: leakage probability score
  const prevReading = currentReadings[sensor.id];
  let leakageProbability = 0;
  if (prevReading) {
    const pressureDrop = prevReading.pressure - pressure;
    if (pressureDrop > 1.5) leakageProbability = Math.min(100, Math.round(pressureDrop * 40));
    if (isLeakSensor)       leakageProbability = randBetween(75, 98, 0);
  }
  if (isContaminated) leakageProbability = 0;

  return {
    sensor_id:           sensor.id,
    name:                sensor.name,
    location:            sensor.location,
    lat:                 sensor.lat,
    lng:                 sensor.lng,
    pressure,
    flow,
    pH,
    turbidity,
    tds,
    status,
    leakageProbability,
    timestamp:           new Date().toISOString(),
  };
}

function startSimulator(io) {
  // Initialize with normal readings immediately
  SENSOR_CONFIGS.forEach((s) => {
    currentReadings[s.id] = generateReading(s);
    sensorHistory[s.id]   = [currentReadings[s.id]];
  });

  // Emit updates every 2-4 seconds
  simulatorInterval = setInterval(() => {
    const updates = [];

    SENSOR_CONFIGS.forEach((sensor) => {
      const reading = generateReading(sensor);
      currentReadings[sensor.id] = reading;

      // Rolling history (max 50)
      if (!sensorHistory[sensor.id]) sensorHistory[sensor.id] = [];
      sensorHistory[sensor.id].push(reading);
      if (sensorHistory[sensor.id].length > 50) {
        sensorHistory[sensor.id].shift();
      }

      updates.push(reading);

      // Auto-generate alerts for anomalies
      if (reading.status === 'leak' && Math.random() > 0.7) {
        const alert = {
          id:        uuidv4(),
          type:      'leak',
          sensorId:  sensor.id,
          sensorName:sensor.name,
          location:  sensor.location,
          message:   `🔴 Leak detected at ${sensor.name} — Pressure: ${reading.pressure} bar`,
          severity:  'critical',
          resolved:  false,
          timestamp: new Date().toISOString(),
          affectedNodes: bfsAffectedNodes(sensor.id),
        };
        alertsStore.addAlert(alert);
        io.emit('leak_alert', alert);
      }

      if (reading.status === 'contamination' && Math.random() > 0.7) {
        const alert = {
          id:        uuidv4(),
          type:      'contamination',
          sensorId:  sensor.id,
          sensorName:sensor.name,
          location:  sensor.location,
          message:   `🟡 Contamination at ${sensor.name} — pH: ${reading.pH}, Turbidity: ${reading.turbidity} NTU`,
          severity:  'high',
          resolved:  false,
          timestamp: new Date().toISOString(),
          affectedNodes: bfsAffectedNodes(sensor.id),
        };
        alertsStore.addAlert(alert);
        io.emit('contamination_alert', alert);
      }
    });

    io.emit('sensor_update', updates);
  }, 3000);

  console.log('💧 Sensor simulator started — updates every 3s');
}

function triggerLeak(io) {
  const randomSensor = SENSOR_CONFIGS[Math.floor(Math.random() * SENSOR_CONFIGS.length)];
  simulationMode  = 'leak';
  leakSensorId    = randomSensor.id;
  console.log(`[SIM] Leak triggered at ${randomSensor.name} (${randomSensor.id})`);

  const alert = {
    id:           uuidv4(),
    type:         'leak',
    sensorId:     randomSensor.id,
    sensorName:   randomSensor.name,
    location:     randomSensor.location,
    message:      `🔴 SIMULATED LEAK at ${randomSensor.name} — Emergency detected!`,
    severity:     'critical',
    resolved:     false,
    timestamp:    new Date().toISOString(),
    affectedNodes: bfsAffectedNodes(randomSensor.id),
  };
  alertsStore.addAlert(alert);
  io.emit('leak_alert', alert);
  io.emit('simulation_mode', { mode: 'leak', sensorId: randomSensor.id, sensorName: randomSensor.name });
}

function triggerContamination(io) {
  const randomSensor = SENSOR_CONFIGS[Math.floor(Math.random() * SENSOR_CONFIGS.length)];
  simulationMode         = 'contamination';
  contaminationSensorId  = randomSensor.id;
  console.log(`[SIM] Contamination triggered at ${randomSensor.name} (${randomSensor.id})`);

  const alert = {
    id:           uuidv4(),
    type:         'contamination',
    sensorId:     randomSensor.id,
    sensorName:   randomSensor.name,
    location:     randomSensor.location,
    message:      `🟡 SIMULATED CONTAMINATION at ${randomSensor.name} — pH critical!`,
    severity:     'high',
    resolved:     false,
    timestamp:    new Date().toISOString(),
    affectedNodes: bfsAffectedNodes(randomSensor.id),
  };
  alertsStore.addAlert(alert);
  io.emit('contamination_alert', alert);
  io.emit('simulation_mode', { mode: 'contamination', sensorId: randomSensor.id, sensorName: randomSensor.name });
}

function resetSimulation(io) {
  simulationMode        = 'normal';
  leakSensorId          = null;
  contaminationSensorId = null;
  console.log('[SIM] Simulation reset to normal');
  io.emit('simulation_mode', { mode: 'normal' });
}

function getCurrentReadings() {
  return Object.values(currentReadings);
}

function getSensorHistory(sensorId) {
  return sensorHistory[sensorId] || [];
}

module.exports = {
  startSimulator,
  triggerLeak,
  triggerContamination,
  resetSimulation,
  getCurrentReadings,
  getSensorHistory,
};
