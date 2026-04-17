/**
 * Graph-Based Anomaly Detection Logic
 * Computes deviations between a sensor and its segment peer-group.
 */

const detectAnomalies = (sensors) => {
    // 1. Group sensors by pipeline
    const pipelineGroups = {};
    sensors.forEach(s => {
        if (!s.pipeline_id) return;
        if (!pipelineGroups[s.pipeline_id]) pipelineGroups[s.pipeline_id] = [];
        pipelineGroups[s.pipeline_id].push(s);
    });

    // 2. Compute peer-averages and deviations
    return sensors.map(s => {
        if (!s.pipeline_id) return { ...s, isAnomaly: false };

        const peers = pipelineGroups[s.pipeline_id];
        if (peers.length <= 1) return { ...s, isAnomaly: false };

        // Calculate segment averages (excluding current sensor for pure group baseline)
        const others = peers.filter(p => p.id !== s.id);
        const avgPressure = others.reduce((sum, p) => sum + (p.pressure || 0), 0) / others.length;
        const avgFlow = others.reduce((sum, p) => sum + (p.flow || 0), 0) / others.length;

        // Deviation calculation
        const pDev = Math.abs((s.pressure || 0) - avgPressure);
        const fDev = Math.abs((s.flow || 0) - avgFlow);

        // Anomaly Threshholds: 
        // Pressure deviation > 0.8 bar OR Flow deviation > 4 L/s
        const isAnomaly = pDev > 0.8 || fDev > 4;

        return {
            ...s,
            isAnomaly,
            peerAvgPressure: avgPressure,
            peerAvgFlow: avgFlow,
            pressureDeviation: pDev,
            flowDeviation: fDev,
            anomalyReason: isAnomaly ? (pDev > 0.8 ? "Pressure Deviation" : "Flow Anomaly") : null
        };
    });
};

module.exports = {
    detectAnomalies
};
