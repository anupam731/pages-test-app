import React from 'react';
import { X } from 'lucide-react';

export const SummaryKPIModal = ({ selectedMetric, setSelectedMetric, dashboardData, metricTitles }) => {
    if (!selectedMetric) return null;

    const renderSummaryModalContent = () => {
        switch (selectedMetric) {
            case 'epics':
                return (
                    <div className="space-y-4">
                        {dashboardData.epicSequencing.map(epic => (
                            <div key={epic.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="font-bold text-blue-600">{epic.id}</span>
                                    <span className="text-xs bg-slate-200 text-slate-700 px-2 py-1 rounded">{epic.status}</span>
                                </div>
                                <p className="font-semibold text-slate-800">{epic.title}</p>
                                <div className="mt-2 text-sm text-slate-500 flex gap-4">
                                    <span>Team: {epic.team}</span>
                                    <span>Points: {epic.points}</span>
                                    <span>Target: Iteration {epic.endIter}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                );
            case 'points':
                return (
                    <div className="space-y-4">
                        {dashboardData.epicSequencing.map(epic => (
                            <div key={epic.id} className="flex justify-between items-center p-3 border-b border-slate-100 last:border-0">
                                <div>
                                    <p className="font-semibold text-slate-800">{epic.id}</p>
                                    <p className="text-sm text-slate-500">{epic.title}</p>
                                </div>
                                <div className="text-lg font-bold text-indigo-600">{epic.points} pts</div>
                            </div>
                        ))}
                        <div className="flex justify-between items-center p-3 bg-indigo-50 rounded-lg mt-4 font-bold text-indigo-900">
                            <span>Total Planned Points</span>
                            <span>{dashboardData.summaryMetrics.totalPoints} pts</span>
                        </div>
                    </div>
                );
            case 'teams':
                return (
                    <div className="space-y-4">
                        {dashboardData.teamAllocation.map(team => (
                            <div key={team.name} className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: team.color }}></div>
                                    <span className="font-semibold text-slate-800">{team.name}</span>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-slate-900">{team.points} Points</div>
                                    <div className="text-sm text-slate-500">{team.value}% of Capacity</div>
                                </div>
                            </div>
                        ))}
                    </div>
                );
            case 'capacity':
                return (
                    <div className="space-y-2">
                        <div className="grid grid-cols-4 text-xs font-bold text-slate-500 uppercase tracking-wider p-2 border-b border-slate-200">
                            <div>Iteration</div>
                            <div>Focus</div>
                            <div className="text-right">Load</div>
                            <div className="text-right">Capacity</div>
                        </div>
                        {dashboardData.loadCapacityData.map(iter => (
                            <div key={iter.iteration} className="grid grid-cols-4 items-center p-2 border-b border-slate-100 text-sm">
                                <div className="font-semibold">{iter.iteration}</div>
                                <div className="text-slate-500">{iter.description}</div>
                                <div className={`text-right font-bold ${iter.load > iter.capacity ? 'text-rose-500' : 'text-slate-700'}`}>{iter.load}</div>
                                <div className="text-right text-slate-500">{iter.capacity}</div>
                            </div>
                        ))}
                    </div>
                );
            case 'risk':
                return (
                    <div className="space-y-4">
                        {dashboardData.risks.map(risk => (
                            <div key={risk.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200 border-l-4" style={{ borderLeftColor: risk.level === 'High' ? '#f43f5e' : '#f59e0b' }}>
                                <div className="flex justify-between items-start mb-1">
                                    <span className="font-bold text-slate-800">{risk.title}</span>
                                    <span className={`text-xs px-2 py-1 rounded font-bold ${risk.level === 'High' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>{risk.level}</span>
                                </div>
                                <p className="text-sm text-slate-500 font-medium mb-2">{risk.type}</p>
                                <p className="text-sm text-slate-700">{risk.description}</p>
                            </div>
                        ))}
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50">
                    <h3 className="text-lg font-bold text-slate-900">{metricTitles[selectedMetric]}</h3>
                    <button onClick={() => setSelectedMetric(null)} className="p-1 hover:bg-slate-200 rounded-md text-slate-500 transition-colors"><X className="w-5 h-5" /></button>
                </div>
                <div className="p-4 overflow-y-auto">{renderSummaryModalContent()}</div>
                <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
                    <button onClick={() => setSelectedMetric(null)} className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors">Close</button>
                </div>
            </div>
        </div>
    );
};
