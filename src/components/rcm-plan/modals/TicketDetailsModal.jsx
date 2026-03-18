import React from 'react';
import { X, AlertTriangle, Info } from 'lucide-react';

export const TicketDetailsModal = ({ selectedTicket, setSelectedTicket }) => {
    if (!selectedTicket) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex justify-between items-center p-5 border-b border-slate-200 bg-slate-50">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-3">
                            <h3 className="text-xl font-extrabold text-slate-900">{selectedTicket.id}</h3>
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-md font-bold uppercase tracking-wide border border-blue-200">{selectedTicket.status}</span>
                        </div>
                        <p className="text-sm font-medium text-slate-600">{selectedTicket.title || selectedTicket.summary}</p>
                    </div>
                    <button onClick={() => setSelectedTicket(null)} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors bg-white border border-slate-200 shadow-sm"><X className="w-5 h-5" /></button>
                </div>

                {/* Scrollable Attributes Body */}
                <div className="p-6 overflow-y-auto bg-white flex-1 custom-scrollbar">
                    {selectedTicket.rawAttributes ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {Object.entries(selectedTicket.rawAttributes).map(([key, val]) => {
                                if (!val || val.trim() === '') return null; // Skip empty columns

                                // Determine if the value is long and needs full width
                                const isLongText = val.length > 80 || val.includes('\n');

                                return (
                                    <div key={key} className={`border border-slate-200 rounded-xl p-4 bg-slate-50/50 shadow-sm hover:shadow-md transition-shadow ${isLongText ? 'col-span-1 md:col-span-2 lg:col-span-3' : 'col-span-1'}`}>
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1.5 flex items-center gap-1.5">
                                            {key}
                                        </span>
                                        <div className="text-sm text-slate-900 font-medium whitespace-pre-wrap break-words leading-relaxed">
                                            {val}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-40 text-slate-500">
                            <AlertTriangle className="w-8 h-8 text-amber-500 mb-2" />
                            <p className="font-medium">No raw attribute data available.</p>
                            <p className="text-sm text-slate-400">Please upload a valid Jira CSV file.</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-between items-center">
                    <span className="text-xs text-slate-500 font-medium flex items-center gap-2">
                        <Info className="w-4 h-4" /> Showing raw data from CSV
                    </span>
                    <button onClick={() => setSelectedTicket(null)} className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-blue-700 hover:shadow transition-all focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                        Close Details
                    </button>
                </div>
            </div>
        </div>
    );
};
