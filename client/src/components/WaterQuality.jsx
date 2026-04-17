import React, { useState } from 'react';
import { Upload, FileText, CheckCircle2, XCircle, Info, Download } from 'lucide-react';

const WaterQuality = () => {
    const [file, setFile] = useState(null);
    const [data, setData] = useState([]);
    const [analysis, setAnalysis] = useState(null);

    const handleFileUpload = (e) => {
        const uploadedFile = e.target.files[0];
        if (uploadedFile) {
            setFile(uploadedFile);
            // Simulate CSV parsing
            setTimeout(() => {
                const dummyData = [
                    { param: 'pH', value: 7.2, status: 'Safe', limit: '6.5 - 8.5' },
                    { param: 'Turbidity', value: 3.5, status: 'Safe', limit: '< 5 NTU' },
                    { param: 'Total Hardness', value: 350, status: 'Warning', limit: '< 300' },
                    { param: 'E. Coli', value: 0, status: 'Safe', limit: '0/100ml' },
                    { param: 'Chlorine', value: 0.1, status: 'Poor', limit: '0.2 - 0.5' },
                    { param: 'Fluoride', value: 1.2, status: 'Safe', limit: '< 1.5' },
                ];
                setData(dummyData);
                setAnalysis({
                    total: dummyData.length,
                    safe: dummyData.filter(d => d.status === 'Safe').length,
                    unsafe: dummyData.filter(d => d.status !== 'Safe').length,
                    recommendation: 'Conduct secondary chlorination. Total hardness is slightly elevated but acceptable for non-potable use.'
                });
            }, 1000);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold dark:text-white">Water Quality Laboratory Module</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Upload lab results in CSV format for automated AI compliance analysis.</p>
                </div>
                <button className="flex items-center text-primary-500 text-sm font-semibold hover:underline">
                    <Download size={16} className="mr-2" /> Download Template
                </button>
            </div>

            {!file ? (
                <div className="glass-card p-12 flex flex-col items-center justify-center border-dashed border-2 bg-gray-50/50 dark:bg-gray-800/20 border-gray-300 dark:border-gray-600">
                    <div className="h-16 w-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center text-primary-500 mb-6">
                        <Upload size={32} />
                    </div>
                    <h3 className="text-lg font-bold dark:text-white mb-2">Upload Lab Data</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm mb-6 text-sm">
                        Drag and drop your laboratory CSV file here or click to browse. Supported formats: .csv, .xlsx
                    </p>
                    <input
                        type="file"
                        id="csv-upload"
                        className="hidden"
                        accept=".csv"
                        onChange={handleFileUpload}
                    />
                    <label
                        htmlFor="csv-upload"
                        className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg transition-all cursor-pointer transform active:scale-95"
                    >
                        Select File
                    </label>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 glass-card overflow-hidden">
                        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 border-b dark:border-gray-700 flex justify-between items-center">
                            <span className="text-sm font-bold dark:text-gray-200">Parsing: {file.name}</span>
                            <button onClick={() => setFile(null)} className="text-xs text-red-500 font-bold hover:underline">Remove</button>
                        </div>
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b dark:border-gray-700">
                                    <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Parameter</th>
                                    <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Recorded Value</th>
                                    <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest">WHO Limit</th>
                                    <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Result</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((row, i) => (
                                    <tr key={i} className="border-b last:border-0 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-700/20 overflow-hidden">
                                        <td className="p-4 font-bold dark:text-white">
                                            <div className="flex items-center">
                                                <FileText size={14} className="mr-2 text-gray-400" /> {row.param}
                                            </div>
                                        </td>
                                        <td className="p-4 dark:text-gray-300 font-mono">{row.value}</td>
                                        <td className="p-4 text-xs text-gray-500 dark:text-gray-400 font-mono">{row.limit}</td>
                                        <td className="p-4 text-right">
                                            <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase ${row.status === 'Safe' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {row.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="space-y-6">
                        <div className="glass-card p-6 bg-gradient-to-br from-primary-500 to-blue-600 text-white border-none shadow-xl">
                            <h4 className="font-bold mb-4 flex items-center"><CheckCircle2 size={18} className="mr-2" /> Analysis Summary</h4>
                            {analysis && (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-xs text-primary-100 uppercase tracking-[0.2em]">Efficiency</p>
                                            <p className="text-4xl font-black">{Math.round((analysis.safe / analysis.total) * 100)}%</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-primary-100 uppercase tracking-[0.2em]">Quality</p>
                                            <p className="text-lg font-bold">Standard</p>
                                        </div>
                                    </div>
                                    <div className="bg-white/10 p-3 rounded-lg text-xs leading-relaxed border border-white/20">
                                        {analysis.recommendation}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="glass-card p-6">
                            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Laboratory Notes</h4>
                            <p className="text-xs text-gray-500 leading-relaxed mb-4">Manual override is available for field technicians if sensor calibration is drifting. Ensure all E.Coli tests are repeated every 48 hours for unsafe zones.</p>
                            <button className="w-full bg-gray-800 dark:bg-gray-700 text-white py-3 rounded-xl text-sm font-bold hover:bg-gray-900 transition-all">Generate Full PDF Report</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WaterQuality;
