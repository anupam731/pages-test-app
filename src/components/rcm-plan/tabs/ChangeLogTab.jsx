import React from 'react';
import { History, Users, KanbanSquare, Undo2 } from 'lucide-react';
import { Card } from '../ui-components';

export const ChangeLogTab = ({ updateHistory, handleRevert }) => {
    return (
        <div className="space-y-6">
            <Card className="p-6">
                <h2 className="text-lg font-bold flex items-center gap-2 mb-6 text-slate-800">
                    <History className="w-5 h-5 text-slate-500" /> Ticket Change Log
                </h2>

                {updateHistory.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                        <History className="w-10 h-10 text-slate-300 mb-3" />
                        <h3 className="text-sm font-bold text-slate-600">No updates recorded yet</h3>
                        <p className="text-xs text-slate-500 mt-1 max-w-md text-center">
                            Changes made to tickets during this session (like reassigning a team or moving a feature to a different sprint) will appear here.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {updateHistory.map(log => (
                            <div key={log.id} className="flex items-start gap-4 p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                <div className={`p-2 rounded-lg ${log.type === 'Team' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                    {log.type === 'Team' ? <Users className="w-5 h-5" /> : <KanbanSquare className="w-5 h-5" />}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-slate-800">{log.ticketId}</span>
                                            <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-500 rounded">{log.type} Update</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                                                {log.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                            </span>
                                            <button
                                                onClick={() => handleRevert(log.id)}
                                                className="flex items-center gap-1 text-xs font-bold text-slate-600 bg-white hover:bg-slate-100 hover:text-slate-900 px-2.5 py-1 rounded-md border border-slate-200 transition-all shadow-sm active:scale-95"
                                            >
                                                <Undo2 className="w-3 h-3" /> Undo
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-sm font-medium text-slate-600 mb-2">{log.ticketTitle}</p>
                                    <div className="text-sm text-slate-800 bg-slate-50 inline-flex items-center px-3 py-1.5 rounded-md border border-slate-200">
                                        {log.message}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );
};
