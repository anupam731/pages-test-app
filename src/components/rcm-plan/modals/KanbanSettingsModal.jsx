import React from 'react';
import { X, Settings, ChevronUp, ChevronDown, Info } from 'lucide-react';

export const KanbanSettingsModal = ({ isKanbanSettingsOpen, setIsKanbanSettingsOpen, dashboardData, setDashboardData }) => {
    if (!isKanbanSettingsOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50">
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2"><Settings className="w-5 h-5 text-slate-500" /> Configure Kanban Columns</h3>
                    <button onClick={() => setIsKanbanSettingsOpen(false)} className="p-1 hover:bg-slate-200 rounded-md text-slate-500 transition-colors"><X className="w-5 h-5" /></button>
                </div>

                <div className="p-4 overflow-y-auto space-y-3 custom-scrollbar flex-1 bg-white">
                    {dashboardData.kanbanColumns.map((col, idx) => (
                        <div key={`${col.id}-${idx}`} className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg shadow-sm">
                            <div className="flex flex-col gap-1">
                                <button
                                    onClick={() => {
                                        if (idx === 0) return;
                                        const newCols = [...dashboardData.kanbanColumns];
                                        [newCols[idx - 1], newCols[idx]] = [newCols[idx], newCols[idx - 1]];
                                        setDashboardData(prev => ({ ...prev, kanbanColumns: newCols }));
                                    }}
                                    disabled={idx === 0}
                                    className="p-0.5 text-slate-400 hover:text-slate-800 hover:bg-slate-200 rounded transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                                >
                                    <ChevronUp className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => {
                                        if (idx === dashboardData.kanbanColumns.length - 1) return;
                                        const newCols = [...dashboardData.kanbanColumns];
                                        [newCols[idx + 1], newCols[idx]] = [newCols[idx], newCols[idx + 1]];
                                        setDashboardData(prev => ({ ...prev, kanbanColumns: newCols }));
                                    }}
                                    disabled={idx === dashboardData.kanbanColumns.length - 1}
                                    className="p-0.5 text-slate-400 hover:text-slate-800 hover:bg-slate-200 rounded transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                                >
                                    <ChevronDown className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="flex-1">
                                <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Status Match (ID)</label>
                                <input
                                    value={col.id}
                                    onChange={(e) => {
                                        const newCols = [...dashboardData.kanbanColumns];
                                        newCols[idx].id = e.target.value;
                                        setDashboardData(prev => ({ ...prev, kanbanColumns: newCols }));
                                    }}
                                    className="w-full px-2 py-1.5 mt-1 border border-slate-300 rounded-md text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    placeholder="e.g., In Progress"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Display Title</label>
                                <input
                                    value={col.title}
                                    onChange={(e) => {
                                        const newCols = [...dashboardData.kanbanColumns];
                                        newCols[idx].title = e.target.value;
                                        setDashboardData(prev => ({ ...prev, kanbanColumns: newCols }));
                                    }}
                                    className="w-full px-2 py-1.5 mt-1 border border-slate-300 rounded-md text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    placeholder="e.g., Doing"
                                />
                            </div>
                            <div className="w-24">
                                <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Cap (Pts)</label>
                                <input
                                    type="number"
                                    value={col.capacity}
                                    onChange={(e) => {
                                        const newCols = [...dashboardData.kanbanColumns];
                                        newCols[idx].capacity = parseInt(e.target.value) || 0;
                                        setDashboardData(prev => ({ ...prev, kanbanColumns: newCols }));
                                    }}
                                    className="w-full px-2 py-1.5 mt-1 border border-slate-300 rounded-md text-sm font-semibold text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    min="0"
                                />
                            </div>
                            <button
                                onClick={() => {
                                    const newCols = dashboardData.kanbanColumns.filter((_, i) => i !== idx);
                                    setDashboardData(prev => ({ ...prev, kanbanColumns: newCols }));
                                }}
                                className="ml-2 mt-4 p-2 text-rose-500 hover:bg-rose-100 rounded-md transition-colors"
                                title="Remove Column"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                    <button
                        onClick={() => {
                            setDashboardData(prev => ({
                                ...prev,
                                kanbanColumns: [...prev.kanbanColumns, { id: 'New Status', title: 'New Status', capacity: 0 }]
                            }));
                            // Auto-scroll to bottom
                            setTimeout(() => {
                                const modalBody = document.querySelector('.custom-scrollbar');
                                if (modalBody) modalBody.scrollTop = modalBody.scrollHeight;
                            }, 100);
                        }}
                        className="w-full py-3 border-2 border-dashed border-slate-300 rounded-lg text-slate-500 font-bold hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50 transition-all"
                    >
                        + Add Kanban Stage
                    </button>
                </div>

                <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center rounded-b-xl">
                    <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                        <Info className="w-4 h-4 text-blue-500" />
                        Set capacity to 0 for unlimited load (Backlog/Done states).
                    </span>
                    <button
                        onClick={() => setIsKanbanSettingsOpen(false)}
                        className="px-6 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-slate-800 transition-colors"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
};
