import React, { useState, useEffect } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine
} from 'recharts';
import { Activity, Thermometer, Droplet, Wind } from 'lucide-react';
import axios from 'axios';

const Analytics = ({ sensors }) => {
    const [selectedSensor, setSelectedSensor] = useState(sensors[0]?.id || 1);
    const [data, setData] = useState([]);
    const [metric, setMetric] = useState('pressure');
    const [prediction, setPrediction] = useState(null);

    const metrics = [
        { id: 'pressure', label: 'Pressure', unit: 'bar', color: '#3b82f6', threshold: 2 },
        { id: 'flow', label: 'Flow', unit: 'L/s', color: '#8b5cf6', threshold: 10 },
        { id: 'ph', label: 'pH Level', unit: '', color: '#10b981', threshold: 7 },
        { id: 'turbidity', label: 'Turbidity', unit: 'NTU', color: '#f59e0b', threshold: 5 },
        { id: 'tds', label: 'TDS', unit: 'ppm', color: '#ef4444', threshold: 400 },
    ];

    const fetchData = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/analytics/${selectedSensor}`);
            setData(res.data);
            const predRes = await axios.get(`http://localhost:5000/api/ai/predict/${selectedSensor}`);
            setPrediction(predRes.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, [selectedSensor]);

    const currentMetric = metrics.find(m => m.id === metric);

    return (
        <div className="space-y-6 animate-in zoom-in-95 duration-500">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold dark:text-white">Predictive Analytics & Trends</h2>
                <div className="flex space-x-4">
                    <select
                        value={selectedSensor}
                        onChange={(e) => setSelectedSensor(e.target.value)}
                        className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm dark:text-gray-200"
                    >
                        {sensors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3 glass-card p-6 min-h-[500px] flex flex-col">
                    <div className="flex justify-between items-center mb-8">
                        <div className="flex space-x-2">
                            {metrics.map(m => (
                                <button
                                    key={m.id}
                                    onClick={() => setMetric(m.id)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${metric === m.id ? 'bg-primary-500 text-white shadow-lg' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                                >
                                    {m.label}
                                </button>
                            ))}
                        </div>
                        <div className="text-sm font-medium dark:text-gray-300">
                            Threshold: {currentMetric.threshold} {currentMetric.unit}
                        </div>
                    </div>

                    <div className="flex-1 min-h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" strokeOpacity={0.1} />
                                <XAxis
                                    dataKey="timestamp"
                                    tickFormatter={(t) => new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    stroke="#9ca3af"
                                />
                                <YAxis stroke="#9ca3af" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <ReferenceLine y={currentMetric.threshold} stroke={currentMetric.color} strokeDasharray="5 5" label={{ position: 'right', value: 'Threshold', fill: currentMetric.color, fontSize: 10 }} />
                                <Line
                                    type="monotone"
                                    dataKey={metric}
                                    stroke={currentMetric.color}
                                    strokeWidth={4}
                                    dot={false}
                                    activeDot={{ r: 8 }}
                                    animationDuration={1000}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="glass-card p-6 border-l-4 border-primary-500">
                        <h4 className="text-sm font-bold text-primary-500 uppercase tracking-wider mb-4 flex items-center">
                            <Activity size={16} className="mr-2" /> AI Predictions
                        </h4>
                        <div className="space-y-4">
                            {prediction?.predictions.map((p, i) => (
                                <div key={i} className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-100 dark:border-primary-800 text-sm dark:text-gray-200">
                                    {p}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="glass-card p-6">
                        <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Last Measurement</h4>
                        <div className="text-3xl font-bold text-gray-800 dark:text-white">
                            {data[data.length - 1]?.[metric]?.toFixed(2)} <span className="text-lg font-normal text-gray-400">{currentMetric.unit}</span>
                        </div>
                        <div className={`mt-2 flex items-center text-xs font-semibold ${data[data.length - 1]?.[metric] > currentMetric.threshold ? 'text-orange-500' : 'text-green-500'}`}>
                            {data[data.length - 1]?.[metric] > currentMetric.threshold ? 'Above threshold' : 'Within safe range'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
