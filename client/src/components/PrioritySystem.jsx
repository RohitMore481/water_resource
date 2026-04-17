import React, { useState, useEffect } from 'react';
import { ListFilter, ArrowRight, ShieldAlert, Users, TrendingUp } from 'lucide-react';
import axios from 'axios';

const PrioritySystem = () => {
    const [priorityData, setPriorityData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/ai/priority-list');
                setPriorityData(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold dark:text-white">Smart Resource Prioritization</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">AI-ranked list of villages requiring immediate intervention based on risk and population impact.</p>
                </div>
                <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <ListFilter size={20} className="text-gray-500" />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {priorityData.map((item, index) => (
                    <div key={index} className="glass-card hover:border-primary-400 dark:hover:border-primary-500 transition-all group overflow-hidden">
                        <div className="flex items-center">
                            <div className={`w-16 h-full min-h-[100px] flex items-center justify-center font-black text-2xl border-r border-gray-100 dark:border-gray-700 ${index === 0 ? 'bg-red-500 text-white shadow-xl px-4' : 'text-gray-300 dark:text-gray-600'}`}>
                                #{index + 1}
                            </div>
                            <div className="flex-1 p-6 grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
                                <div>
                                    <h3 className="font-bold text-lg dark:text-white group-hover:text-primary-500 transition-colors uppercase tracking-wide">{item.village}</h3>
                                    <p className="text-xs text-gray-500 font-semibold mt-1">VILLAGE ID: VR-0{index + 101}</p>
                                </div>

                                <div className="flex items-center space-x-4">
                                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-500">
                                        <Users size={18} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-tighter">Impacted</p>
                                        <p className="font-bold dark:text-white">{item.affectedPopulation} ppl</p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-4">
                                    <div className={`p-2 rounded-lg ${item.risk === 'High' ? 'bg-red-50 dark:bg-red-900/20 text-red-500' : 'bg-green-50 dark:bg-green-900/20 text-green-500'}`}>
                                        <ShieldAlert size={18} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-tighter">Maturity</p>
                                        <p className="font-bold dark:text-white">{item.risk} Risk</p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-end space-x-6">
                                    <div className="text-right">
                                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-tighter">Fix Score</p>
                                        <p className="text-2xl font-black text-primary-500">{item.priorityScore.toFixed(1)}</p>
                                    </div>
                                    <button className="p-3 rounded-xl bg-gray-50 dark:bg-gray-700 hover:bg-primary-500 hover:text-white transition-all">
                                        <ArrowRight size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                        {index === 0 && (
                            <div className="bg-red-500 flex justify-center py-1">
                                <span className="text-[10px] font-bold text-white uppercase tracking-[0.2em]">Immediate Action Required</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PrioritySystem;
