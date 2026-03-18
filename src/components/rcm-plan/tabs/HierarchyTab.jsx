import React from 'react';
import { FolderTree, ChevronDown, ChevronRight, Folder, FileText } from 'lucide-react';
import { Card } from '../ui-components';
import { getTeamColor } from '../utils';

export const HierarchyTab = ({
    dashboardData,
    expandedNodes,
    toggleNode,
    setExpandedNodes,
    setSelectedTicket,
    hoveredInitiative,
    setHoveredInitiative,
    handleTeamChange,
    allAvailableTeams
}) => {
    return (
        <div className="space-y-6">
            <Card className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <h2 className="text-lg font-bold flex items-center gap-2 text-slate-800">
                        <FolderTree className="w-5 h-5 text-slate-500" /> Initiative Hierarchy
                    </h2>

                    <div className="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                        <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 px-2 hidden sm:block">Expand to:</span>
                        <button
                            onClick={() => setExpandedNodes({})}
                            className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 shadow-sm hover:border-blue-400 hover:text-blue-600 text-slate-700 rounded transition-all"
                        >
                            Programs
                        </button>
                        <button
                            onClick={() => {
                                const newNodes = {};
                                dashboardData.hierarchyData.forEach(p => newNodes[p.id] = true);
                                setExpandedNodes(newNodes);
                            }}
                            className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 shadow-sm hover:border-blue-400 hover:text-blue-600 text-slate-700 rounded transition-all"
                        >
                            Initiatives
                        </button>
                        <button
                            onClick={() => {
                                const newNodes = {};
                                dashboardData.hierarchyData.forEach(p => {
                                    newNodes[p.id] = true;
                                    p.initiatives.forEach(i => newNodes[i.id] = true);
                                });
                                setExpandedNodes(newNodes);
                            }}
                            className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 shadow-sm hover:border-blue-400 hover:text-blue-600 text-slate-700 rounded transition-all"
                        >
                            All Features
                        </button>
                    </div>
                </div>

                <div className="space-y-4">
                    {dashboardData.hierarchyData.map(program => {
                        const totalProgramFeatures = program.initiatives.reduce((acc, init) => acc + init.features.length, 0);
                        const totalProgramPoints = program.initiatives.reduce((acc, init) => acc + init.features.reduce((sum, f) => sum + f.points, 0), 0);
                        const completedProgramPoints = program.initiatives.reduce((acc, init) => acc + init.features.reduce((sum, f) => {
                            const isDone = ['done', 'closed', 'resolved', 'complete'].includes((f.status || '').toLowerCase());
                            return sum + (isDone ? f.points : 0);
                        }, 0), 0);
                        const programProgress = totalProgramPoints > 0 ? Math.round((completedProgramPoints / totalProgramPoints) * 100) : 0;

                        return (
                            <div key={program.id} className="select-none">
                                <div
                                    onClick={() => toggleNode(program.id)}
                                    className={`flex flex-wrap items-center gap-2 sm:gap-3 p-3 cursor-pointer rounded-lg border ${program.bg} border-slate-200 hover:shadow-sm transition-all`}
                                >
                                    {expandedNodes[program.id] ? <ChevronDown className="w-5 h-5 text-slate-500 flex-shrink-0" /> : <ChevronRight className="w-5 h-5 text-slate-500 flex-shrink-0" />}
                                    <FolderTree className={`w-5 h-5 ${program.color} flex-shrink-0`} />
                                    <span className="font-bold text-slate-800 text-base mr-2">{program.name}</span>

                                    <div className="flex items-center gap-1.5 text-xs">
                                        <span className="font-semibold text-slate-600 bg-white/60 px-2 py-0.5 rounded-md border border-slate-200 shadow-sm">
                                            {totalProgramFeatures} Features
                                        </span>
                                        <span className="font-bold text-indigo-700 bg-indigo-50/50 px-2 py-0.5 rounded-md border border-indigo-100 shadow-sm">
                                            {totalProgramPoints} pts
                                        </span>
                                        {programProgress > 0 && (
                                            <span className="font-bold text-emerald-700 bg-emerald-50/50 px-2 py-0.5 rounded-md border border-emerald-100 shadow-sm">
                                                {programProgress}% Done
                                            </span>
                                        )}
                                        {program.piStart && program.piEnd && (
                                            <span className="font-bold text-purple-700 bg-purple-50/50 px-2 py-0.5 rounded-md border border-purple-200 shadow-sm truncate max-w-[150px]" title="PI Range">
                                                {program.piStart === program.piEnd ? program.piStart : `${program.piStart} → ${program.piEnd}`}
                                            </span>
                                        )}
                                    </div>

                                    {/* Program Progress Bar */}
                                    <div className="ml-auto flex items-center gap-2 mr-4">
                                        <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden shadow-inner hidden sm:block">
                                            <div 
                                                className={`h-full ${programProgress === 100 ? 'bg-emerald-500' : 'bg-indigo-500'} transition-all duration-500`} 
                                                style={{ width: `${programProgress}%` }}
                                            />
                                        </div>
                                    </div>

                                    <span className="text-xs font-semibold bg-white text-slate-500 px-2 py-1 rounded border border-slate-200 shadow-sm flex-shrink-0">
                                        Program
                                    </span>
                                </div>

                                {expandedNodes[program.id] && (
                                    <div className="ml-7 pl-4 border-l-2 border-slate-200 mt-2 space-y-3">
                                        {program.initiatives.map(initiative => {
                                            const initTotalPoints = initiative.features.reduce((sum, f) => sum + f.points, 0);
                                            const initCompletedPoints = initiative.features.reduce((sum, f) => {
                                                const isDone = ['done', 'closed', 'resolved', 'complete'].includes((f.status || '').toLowerCase());
                                                return sum + (isDone ? f.points : 0);
                                            }, 0);
                                            const initProgress = initTotalPoints > 0 ? Math.round((initCompletedPoints / initTotalPoints) * 100) : 0;

                                            return (
                                            <div key={initiative.id}>
                                                <div
                                                    onClick={() => toggleNode(initiative.id)}
                                                    className="flex items-center gap-2 p-2 cursor-pointer hover:bg-slate-100 rounded-md transition-colors"
                                                >
                                                    {expandedNodes[initiative.id] ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                                                    <Folder className="w-4 h-4 text-slate-400" />
                                                    <span className="font-bold text-slate-700">{initiative.id}</span>
                                                    <span className="text-sm font-medium text-slate-600 truncate max-w-md">- {initiative.name}</span>
                                                    {initiative.status && (
                                                        <span className="ml-2 text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200 font-medium whitespace-nowrap">
                                                            {initiative.status}
                                                        </span>
                                                    )}
                                                    {initiative.piStart && initiative.piEnd && (
                                                        <span className="ml-2 text-[10px] bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded border border-purple-200 font-bold whitespace-nowrap truncate max-w-[150px]" title="PI Range">
                                                            {initiative.piStart === initiative.piEnd ? initiative.piStart : `${initiative.piStart} → ${initiative.piEnd}`}
                                                        </span>
                                                    )}
                                                    <span className="ml-2 text-xs font-medium text-slate-500 hidden sm:inline-block">({initiative.features.length} tickets, {initiative.features.reduce((acc, f) => acc + f.points, 0)} pts)</span>
                                                    
                                                    {/* Initiative Progress Bar */}
                                                    <div className="ml-auto flex items-center gap-2 mr-4">
                                                        <div className="w-20 h-1.5 bg-slate-200 rounded-full overflow-hidden shadow-inner hidden sm:block">
                                                            <div 
                                                                className={`h-full ${initProgress === 100 ? 'bg-emerald-400' : 'bg-blue-400'} transition-all duration-500`} 
                                                                style={{ width: `${initProgress}%` }}
                                                            />
                                                        </div>
                                                    </div>

                                                    <span className="text-[10px] uppercase tracking-wider font-bold bg-slate-200 px-2 py-0.5 rounded text-slate-600 flex-shrink-0">
                                                        Initiative
                                                    </span>
                                                </div>

                                                {expandedNodes[initiative.id] && (
                                                    <div className="ml-7 pl-4 border-l-2 border-slate-100 mt-2 space-y-2">
                                                        {initiative.features.map(feature => {
                                                            const isHoveredGroup = hoveredInitiative && hoveredInitiative === feature.parentKey && feature.parentKey !== 'None';
                                                            const isDimmed = hoveredInitiative && (!feature.parentKey || hoveredInitiative !== feature.parentKey);

                                                            return (
                                                                <div
                                                                    key={feature.id}
                                                                    onClick={() => setSelectedTicket(feature)}
                                                                    onMouseEnter={() => feature.parentKey && feature.parentKey !== 'None' ? setHoveredInitiative(feature.parentKey) : null}
                                                                    onMouseLeave={() => setHoveredInitiative(null)}
                                                                    className={`flex flex-col md:flex-row md:items-center justify-between p-3 bg-white border rounded-lg cursor-pointer transition-all duration-200 gap-4 ${isHoveredGroup
                                                                        ? 'border-indigo-500 ring-1 ring-indigo-500 shadow-md bg-indigo-50/30 scale-[1.01]'
                                                                        : isDimmed
                                                                            ? 'opacity-40 border-slate-200'
                                                                            : 'border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md'
                                                                        }`}
                                                                >
                                                                    <div className="flex items-start gap-3">
                                                                        <FileText className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isHoveredGroup ? 'text-indigo-500' : 'text-slate-400'}`} />
                                                                        <div>
                                                                            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                                                                                <div className={`text-sm font-bold ${isHoveredGroup ? 'text-indigo-700' : 'text-slate-800'}`}>{feature.id}</div>
                                                                                <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200 font-medium whitespace-nowrap">{feature.status}</span>
                                                                                {feature.pi && (
                                                                                    <span className="text-[10px] bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded border border-purple-200 font-bold whitespace-nowrap">{feature.pi}</span>
                                                                                )}
                                                                                <span className="text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded border border-indigo-100 font-medium truncate max-w-[150px]">{feature.program}</span>
                                                                            </div>
                                                                            <div className="text-sm text-slate-600">{feature.summary}</div>
                                                                        </div>
                                                                    </div>

                                                                    <div className="flex items-center gap-2 text-xs font-medium ml-7 md:ml-0 flex-shrink-0">
                                                                        <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded border border-slate-200">{feature.iteration}</span>
                                                                        <select
                                                                            value={feature.team}
                                                                            onClick={(e) => e.stopPropagation()}
                                                                            onMouseDown={(e) => e.stopPropagation()}
                                                                            onChange={(e) => handleTeamChange(feature.id, e.target.value)}
                                                                            className="text-xs text-white px-2 py-1 rounded shadow-sm cursor-pointer outline-none border-r-4 border-transparent hover:ring-2 hover:ring-white/50 transition-all appearance-none text-center font-bold"
                                                                            style={{ backgroundColor: getTeamColor(feature.team, dashboardData.teamAllocation) }}
                                                                        >
                                                                            {allAvailableTeams.map(t => <option key={t} value={t} className="text-slate-900 bg-white font-medium">{t}</option>)}
                                                                        </select>
                                                                        <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded font-bold w-16 text-center border border-blue-100">{feature.points} pts</span>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </Card>
        </div>
    );
};
