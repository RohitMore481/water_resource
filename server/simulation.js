const db = require('./db');
const smsService = require('./services/smsService');

let simulationInterval = null;
let simulationState = {
    leak: false,
    contamination: false
};

const simulateReadings = async () => {
    try {
        const _db = db.getDB();
        const sensors = await _db.all('SELECT id FROM sensors');
        for (const sensor of sensors) {
            let pressure = 3.5 + (Math.random() - 0.5) * 0.2; // 3.5 bar avg
            let flow = 15 + (Math.random() - 0.5) * 2; // 15 L/s avg
            let ph = 7.2 + (Math.random() - 0.5) * 0.4; // 7.2 avg
            let turbidity = 1.2 + (Math.random() - 0.5) * 0.5; // 1.2 NTU avg
            let tds = 250 + (Math.random() - 0.5) * 50; // 250 ppm avg

            if (simulationState.leak && sensor.id === 2) {
                pressure -= 1.5;
                flow += 5;
            }

            if (simulationState.contamination && sensor.id === 4) {
                ph = 8.8 + (Math.random() * 0.5);
                turbidity = 15 + (Math.random() * 5);
                tds = 800 + (Math.random() * 100);
            }

            await _db.run(
                'INSERT INTO sensor_readings (sensor_id, pressure, flow, ph, turbidity, tds) VALUES (?, ?, ?, ?, ?, ?)',
                [sensor.id, pressure, flow, ph, turbidity, tds]
            );

            let status = 'Active';
            if (pressure < 2 || ph < 6.5 || ph > 8.5 || turbidity > 5) status = 'Warning';
            if (pressure < 1 || turbidity > 10 || ph > 9 || ph < 6) status = 'Critical';

            await _db.run('UPDATE sensors SET status = ? WHERE id = ?', [status, sensor.id]);

            // --- SMS ALERT TRIGGER LOGIC ---
            if (status === 'Critical') {
                const sensorData = await _db.get('SELECT name, pipeline_id FROM sensors WHERE id = ?', [sensor.id]);
                const pipeData = await _db.get('SELECT name FROM pipelines WHERE id = ?', [sensorData.pipeline_id]);

                let smsType = 'Leak Alert';
                let message = `🚨 LEAK ALERT | ${pipeData?.name || 'Network Segment'}\nHigh pressure drop detected at ${sensorData.name}\nAction: Inspect immediately`;

                if (turbidity > 10) {
                    smsType = 'Contamination Alert';
                    message = `⚠️ WATER ALERT | ${pipeData?.name || 'Supply Line'}\nHigh turbidity detected at ${sensorData.name}\nAction: Avoid usage`;
                }

                if (sensorData.pipeline_id) {
                    await smsService.notifyAffectedUsers(sensorData.pipeline_id, message, smsType);
                }
            }
        }
    } catch (error) {
        console.error('Simulation error:', error);
    }
};

const startSimulation = () => {
    if (!simulationInterval) {
        simulationInterval = setInterval(simulateReadings, 3000); // Every 3 seconds
        console.log('Sensor simulation started');
    }
};

const setSimulationState = (state) => {
    simulationState = { ...simulationState, ...state };
};

module.exports = { startSimulation, setSimulationState };
