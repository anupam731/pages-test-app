import React, { useState } from 'react';
import { Calendar, ChevronDown, ChevronRight, FolderTree, Folder, FileText, Users } from 'lucide-react';
import { Card } from '../ui-components';
import { getTeamColor } from '../utils';

export const TimelineTab = ({ dashboardData }) => {
    const [expandedNodes, setExpandedNodes] = useState({});

    const toggleNode = (id) => {
        setExpandedNodes(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const renderTimelineBar = (item, level) => {
        const start = Math.max(1, item.startIter || 1);
        const end = Math.min(6, item.endIter || 1);
        const duration = end - start + 1;
        const color = item.color || getTeamColor(item.teams?.[0] || item.team, dashboardData.teamAllocation);

        return (
            <div className="col-span-7 relative h-8 bg-slate-50/50 rounded-md border border-slate-100 overflow-hidden group/bar">
                <div className="absolute inset-0 grid grid-cols-6 pointer-events-none">
                    {[0, 1, 2, 3, 4, 5].map(i => <div key={i} className="border-l border-slate-200/30 h-full"></div>)}
                </div>

                <div
                    className="absolute top-1 bottom-1 rounded shadow-sm opacity-90 group-hover/bar:opacity-100 transition-all flex items-center px-2 text-[10px] text-white font-bold overflow-hidden whitespace-nowrap z-10"
                    style={{
                        backgroundColor: color,
                        left: `${((start - 1) / 6) * 100}%`,
                        width: `${(duration / 6) * 100}%`
                    }}
                    title={`${item.name || item.id}: Iter ${start} - ${end}`}
                >
                    <span className="truncate">{item.status || (item.totalPoints ? `${item.totalPoints} pts` : '')}</span>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <Card className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold flex items-center gap-2 text-slate-800">
                        <Calendar className="w-5 h-5 text-indigo-500" /> PI Roadmap & Sequencing
                    </h2>
                    <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-slate-400 tracking-widest">
                        <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Planned</span>
                        <span className="flex items-center gap-1 ml-3"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Delivered</span>
                    </div>
                </div>

                <div className="overflow-x-auto custom-scrollbar">
                    <div className="min-w-[1000px] max-h-[65vh] overflow-y-auto pr-2 custom-scrollbar">
                        {/* Timeline Header Row */}
                        <div className="grid grid-cols-12 gap-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 border-b border-slate-100 pb-3 sticky top-0 bg-white z-20">
                            <div className="col-span-4 pl-8 bg-white">Hierarchy & Deliverables</div>
                            <div className="col-span-1 text-center font-black bg-white">Pts</div>
                            <div className="col-span-7 grid grid-cols-6 gap-0 bg-white">
                                {['Iter 1', 'Iter 2', 'Iter 3', 'Iter 4', 'Iter 5', 'Iter 6'].map(iter => (
                                    <div key={iter} className="text-center border-l border-slate-100 first:border-l-0">
                                        {iter}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Program Rows */}
                        <div className="space-y-3">
                            {dashboardData.hierarchyData.map(program => (
                                <div key={program.id} className="space-y-2">
                                    <div className="grid grid-cols-12 gap-4 items-center group">
                                        <div
                                            className="col-span-4 flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1.5 rounded-lg transition-colors"
                                            onClick={() => toggleNode(program.id)}
                                        >
                                            <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center">
                                                {expandedNodes[program.id] ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                                            </div>
                                            <FolderTree className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                                            <div className="flex flex-col truncate">
                                                <span className="text-sm font-black text-slate-800 truncate">{program.name}</span>
                                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Program</span>
                                            </div>
                                        </div>
                                        <div className="col-span-1 text-center text-xs font-black text-slate-600">
                                            {program.totalPoints}
                                        </div>
                                        {renderTimelineBar(program, 0)}
                                    </div>

                                    {/* Initiative Rows */}
                                    {expandedNodes[program.id] && (
                                        <div className="ml-8 pl-4 border-l-2 border-slate-100 space-y-2">
                                            {program.initiatives.map(initiative => (
                                                <div key={initiative.id} className="space-y-1.5">
                                                    <div className="grid grid-cols-12 gap-4 items-center group">
                                                        <div
                                                            className="col-span-4 flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1.5 rounded-lg transition-colors"
                                                            onClick={() => toggleNode(initiative.id)}
                                                        >
                                                            <div className="w-4 h-4 flex-shrink-0 flex items-center justify-center">
                                                                {expandedNodes[initiative.id] ? <ChevronDown className="w-3 h-3 text-slate-400" /> : <ChevronRight className="w-3 h-3 text-slate-400" />}
                                                            </div>
                                                            <Folder className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                                                            <div className="flex flex-col truncate">
                                                                <span className="text-xs font-bold text-slate-700 truncate">{initiative.name}</span>
                                                                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{initiative.id}</span>
                                                            </div>
                                                        </div>
                                                        <div className="col-span-1 text-center text-[11px] font-bold text-slate-500">
                                                            {initiative.totalPoints}
                                                        </div>
                                                        {renderTimelineBar(initiative, 1)}
                                                    </div>

                                                    {/* Feature Rows */}
                                                    {expandedNodes[initiative.id] && (
                                                        <div className="ml-6 pl-4 border-l border-slate-100 space-y-1.5 py-1">
                                                            {initiative.features.map(feature => (
                                                                <div key={feature.id} className="grid grid-cols-12 gap-4 items-center group opacity-85 hover:opacity-100 transition-opacity">
                                                                    <div className="col-span-4 flex items-center gap-2 pl-4">
                                                                        <FileText className="w-3 h-3 text-slate-300 flex-shrink-0" />
                                                                        <div className="flex flex-col truncate">
                                                                            <span className="text-[11px] font-medium text-slate-600 truncate">{feature.summary}</span>
                                                                            <span className="text-[8px] font-black text-slate-400 tracking-tighter">{feature.id}</span>
                                                                        </div>
                                                                    </div>
                                                                    <div className="col-span-1 text-center text-[10px] font-medium text-slate-400">
                                                                        {feature.points}
                                                                    </div>
                                                                    {renderTimelineBar({ ...feature, startIter: feature.iterNum, endIter: feature.iterNum }, 2)}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-4 bg-white border-l-4 border-l-indigo-500">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                            <Users className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Programs</div>
                            <div className="text-xl font-black text-slate-900">{dashboardData.hierarchyData.length}</div>
                        </div>
                    </div>
                </Card>
                <Card className="p-4 bg-white border-l-4 border-l-blue-500">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                            <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Sprints</div>
                            <div className="text-xl font-black text-slate-900">6 Iterations</div>
                        </div>
                    </div>
                </Card>
                <Card className="p-4 bg-white border-l-4 border-l-emerald-500">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                            <FolderTree className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Initiatives</div>
                            <div className="text-xl font-black text-slate-900">
                                {dashboardData.hierarchyData.reduce((acc, p) => acc + p.initiatives.length, 0)}
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};
