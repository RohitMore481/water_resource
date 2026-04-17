import React from 'react';

const SensorDetails = ({ sensor }) => {
    if (!sensor) return null;
    return (
        <div className="glass-card p-6">
            <h3 className="text-lg font-bold dark:text-white mb-4">{sensor.name} - Detailed View</h3>
            <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p className="text-xs text-gray-500 uppercase font-bold">Bacterial Count</p>
                    <p className="text-xl font-bold dark:text-white">2 CFU/100ml</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p className="text-xs text-gray-500 uppercase font-bold">Chlorine Level</p>
                    <p className="text-xl font-bold dark:text-white">0.3 mg/L</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p className="text-xs text-gray-500 uppercase font-bold">Temperature</p>
                    <p className="text-xl font-bold dark:text-white">24.5 °C</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p className="text-xs text-gray-500 uppercase font-bold">Dissolved Oxygen</p>
                    <p className="text-xl font-bold dark:text-white">7.8 mg/L</p>
                </div>
            </div>
        </div>
    );
};

export default SensorDetails;
