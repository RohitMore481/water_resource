import React, { useState } from 'react';
import { MessageSquare, MapPin, Flag, Send, Info, CheckCircle, TrendingUp } from 'lucide-react';
import axios from 'axios';
import useOffline from '../hooks/useOffline';

const Complaints = () => {
    const [formData, setFormData] = useState({ type: 'Leakage', description: '', location: '', priority: 'Low' });
    const [submitted, setSubmitted] = useState(false);

    const { isOnline, bufferComplaint } = useOffline();
    const [isOfflineStored, setIsOfflineStored] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isOnline) {
                await axios.post('http://localhost:5000/api/complaints', formData);
                setSubmitted(true);
                setTimeout(() => setSubmitted(false), 3000);
            } else {
                bufferComplaint(formData);
                setIsOfflineStored(true);
                setTimeout(() => setIsOfflineStored(false), 3000);
            }
            setFormData({ type: 'Leakage', description: '', location: '', priority: 'Low' });
        } catch (err) {
            console.error(err);
            // Fallback to offline buffer on unexpected network error
            bufferComplaint(formData);
            setIsOfflineStored(true);
            setTimeout(() => setIsOfflineStored(false), 3000);
            setFormData({ type: 'Leakage', description: '', location: '', priority: 'Low' });
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8 animate-in slide-in-from-bottom-8 duration-500">
            <div className="text-center">
                <div className="h-16 w-16 bg-blue-100 dark:bg-blue-900/30 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageSquare size={32} />
                </div>
                <h2 className="text-3xl font-black dark:text-white tracking-tight">Public Incident Reporting</h2>
                <p className="text-gray-500 mt-2">Report leaks, contamination, or supply issues directly to the smart monitoring team.</p>
            </div>

            <form onSubmit={handleSubmit} className="glass-card p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-gray-400 tracking-widest flex items-center"><Flag size={14} className="mr-2" /> Issue Type</label>
                        <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} className="w-full bg-gray-50 dark:bg-gray-700/50 border-none rounded-xl p-4 focus:ring-2 focus:ring-primary-500 dark:text-white">
                            <option>Leakage</option>
                            <option>Contamination</option>
                            <option>Low Pressure</option>
                            <option>Odor/Taste Issue</option>
                            <option>Other</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-gray-400 tracking-widest flex items-center"><TrendingUp size={14} className="mr-2" /> Self-Assessed Priority</label>
                        <select value={formData.priority} onChange={e => setFormData({ ...formData, priority: e.target.value })} className="w-full bg-gray-50 dark:bg-gray-700/50 border-none rounded-xl p-4 focus:ring-2 focus:ring-primary-500 dark:text-white">
                            <option>Low</option>
                            <option>Medium</option>
                            <option>High</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-gray-400 tracking-widest flex items-center"><MapPin size={14} className="mr-2" /> Location / Landmark</label>
                    <input required value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} className="w-full bg-gray-50 dark:bg-gray-700/50 border-none rounded-xl p-4 focus:ring-2 focus:ring-primary-500 dark:text-white" placeholder="Near Green Valley High School..." />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-gray-400 tracking-widest flex items-center"><Info size={14} className="mr-2" /> Detailed Description</label>
                    <textarea required value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full bg-gray-50 dark:bg-gray-700/50 border-none rounded-xl p-4 focus:ring-2 focus:ring-primary-500 dark:text-white min-h-[120px]" placeholder="Explain the issue in detail..." />
                </div>

                <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center space-x-2">
                    <Send size={18} /> <span>Submit Formal Complaint</span>
                </button>
            </form>

            {submitted && (
                <div className="bg-green-500 text-white p-4 rounded-xl flex items-center justify-center animate-pulse">
                    <CheckCircle size={20} className="mr-2" /> Complaint registered successfully!
                </div>
            )}

            {isOfflineStored && (
                <div className="bg-amber-500 text-white p-4 rounded-xl flex items-center justify-center animate-pulse">
                    <CheckCircle size={20} className="mr-2" /> Offline: Complaint saved to local buffer (Sync Pending)
                </div>
            )}
        </div>
    );
};

export default Complaints;
