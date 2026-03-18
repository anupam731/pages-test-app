import React, { useState } from 'react';
import { Calendar, ChevronDown, ChevronRight, FolderTree, Folder, FileText, Layers, Filter } from 'lucide-react';
import { Card } from '../ui-components';
import { getTeamColor } from '../utils';

export const MultiPITimelineTab = ({ dashboardData, selectedPIs, setSelectedTicket }) => {
    const [expandedNodes, setExpandedNodes] = useState({});
    const globalPIs = dashboardData.allPIs || [];
    
    const globalPrograms = dashboardData.hierarchyData || [];
    const globalProgramIds = globalPrograms.map(p => p.id);
    const [selectedPrograms, setSelectedPrograms] = useState(globalProgramIds);

    React.useEffect(() => {
        if (globalProgramIds.length > 0) {
            setSelectedPrograms(globalProgramIds);
        }
    }, [globalProgramIds.join(',')]);

    const toggleNode = (id) => {
        setExpandedNodes(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const toggleProgram = (programId) => {
        setSelectedPrograms(prev =>
            prev.includes(programId)
                ? prev.filter(p => p !== programId)
                : [...prev, programId]
        );
    };

    const displayedPIs = selectedPIs || [];

    // Calculate PI Summary Metrics based on selected programs
    const piMetrics = React.useMemo(() => {
        const metrics = {};
        displayedPIs.forEach(pi => {
            metrics[pi] = { points: 0, programs: new Set(), initiatives: new Set(), features: 0 };
        });

        let totalSelectedPoints = 0;

        (dashboardData.hierarchyData || [])
            .filter(p => selectedPrograms.includes(p.id))
            .forEach(program => {
                totalSelectedPoints += (program.totalPoints || 0);

                // Add to PI if program falls within
                const pStartIdx = displayedPIs.indexOf(program.piStart);
                const pEndIdx = displayedPIs.indexOf(program.piEnd);
                
                if (pStartIdx !== -1 || pEndIdx !== -1) {
                     const startIdx = pStartIdx !== -1 ? pStartIdx : 0;
                     const endIdx = pEndIdx !== -1 ? pEndIdx : displayedPIs.length - 1;
                     for (let i = startIdx; i <= endIdx; i++) {
                         metrics[displayedPIs[i]].programs.add(program.id);
                     }
                }

                (program.initiatives || []).forEach(init => {
                    const iStartIdx = displayedPIs.indexOf(init.piStart);
                    const iEndIdx = displayedPIs.indexOf(init.piEnd);
                    
                    if (iStartIdx !== -1 || iEndIdx !== -1) {
                         const startIdx = iStartIdx !== -1 ? iStartIdx : 0;
                         const endIdx = iEndIdx !== -1 ? iEndIdx : displayedPIs.length - 1;
                         for (let i = startIdx; i <= endIdx; i++) {
                             metrics[displayedPIs[i]].initiatives.add(init.id);
                         }
                    }

                    (init.features || []).forEach(feat => {
                        if (feat.pi && metrics[feat.pi]) {
                            metrics[feat.pi].points += (feat.points || 0);
                            metrics[feat.pi].features += 1;
                        }
                    });
                });
            });

        return { data: metrics, totalPoints: totalSelectedPoints };
    }, [dashboardData.hierarchyData, displayedPIs, selectedPrograms]);

    const renderTimelineBar = (item, level) => {
        const piStart = item.piStart;
        const piEnd = item.piEnd;

        const containerClasses = "col-span-7 relative h-8 bg-slate-50/20 rounded-md border border-slate-50";

        if (!piStart || !piEnd || displayedPIs.length === 0) {
            return <div className={containerClasses}></div>;
        }

        // Clip start/end to displayed range
        const actualStart = displayedPIs.find(pi => pi >= piStart);
        const actualEnd = [...displayedPIs].reverse().find(pi => pi <= piEnd);

        if (!actualStart || !actualEnd || actualStart > actualEnd) {
            return <div className={containerClasses}></div>;
        }

        const startIndex = displayedPIs.indexOf(actualStart);
        const endIndex = displayedPIs.indexOf(actualEnd);
        const duration = endIndex - startIndex + 1;
        const color = item.color || getTeamColor(item.teams?.[0] || item.team, dashboardData.teamAllocation);

        return (
            <div className="col-span-7 relative h-8 bg-slate-50/50 rounded-md border border-slate-100 overflow-hidden group/bar">
                <div
                    className="absolute inset-0 grid pointer-events-none"
                    style={{ gridTemplateColumns: `repeat(${displayedPIs.length}, minmax(0, 1fr))` }}
                >
                    {displayedPIs.map((pi, i) => <div key={pi} className="border-l border-slate-200/30 h-full"></div>)}
                </div>

                <div
                    className="absolute top-1 bottom-1 rounded shadow-sm opacity-90 group-hover/bar:opacity-100 transition-all flex items-center px-2 text-[10px] text-white font-bold overflow-hidden whitespace-nowrap z-10"
                    style={{
                        backgroundColor: color,
                        left: `${(startIndex / displayedPIs.length) * 100}%`,
                        width: `${(duration / displayedPIs.length) * 100}%`
                    }}
                    title={`${item.name || item.id}: ${piStart} - ${piEnd}`}
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
                        <Layers className="w-5 h-5 text-indigo-500" /> Multi-PI Roadmap
                    </h2>
                    <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-slate-400 tracking-widest">
                        <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-indigo-500"></div> Planned Duration</span>
                    </div>
                </div>

                <div className="overflow-x-auto custom-scrollbar">
                    <div className="min-w-[1200px] max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                        {globalPIs.length > 0 ? (
                            <>
                                {/* Timeline Header Row */}
                                <div className="grid grid-cols-12 gap-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 border-b border-slate-100 pb-3 sticky top-0 bg-white z-20">
                                    <div className="col-span-4 pl-8 bg-white">Program & Initiatives</div>
                                    <div className="col-span-1 text-center font-black bg-white">Pts</div>
                                    <div
                                        className="col-span-7 grid gap-0 bg-white"
                                        style={{ gridTemplateColumns: `repeat(${displayedPIs.length}, minmax(0, 1fr))` }}
                                    >
                                        {displayedPIs.map(pi => (
                                            <div key={pi} className="text-center border-l border-slate-100 first:border-l-0 px-1 truncate">
                                                {pi}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* PI Summary Row */}
                                <div className="grid grid-cols-12 gap-4 items-stretch mb-6 border-b border-indigo-100 pb-4 sticky top-[38px] bg-slate-50/80 backdrop-blur-sm z-10 rounded-lg p-2 shadow-sm border border-slate-200">
                                    <div className="col-span-4 pl-6 flex items-center gap-2">
                                        <div className="p-1.5 bg-indigo-100 rounded-lg">
                                            <Layers className="w-4 h-4 text-indigo-600" />
                                        </div>
                                        <div>
                                            <div className="text-xs font-black text-slate-800 tracking-tight">PI Summary Metrics</div>
                                            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Aggregate totals</div>
                                        </div>
                                    </div>
                                    <div className="col-span-1 flex items-center justify-center text-sm font-black text-indigo-600">
                                        {piMetrics.totalPoints}
                                    </div>
                                    <div
                                        className="col-span-7 grid gap-2"
                                        style={{ gridTemplateColumns: `repeat(${displayedPIs.length}, minmax(0, 1fr))` }}
                                    >
                                        {displayedPIs.map(pi => {
                                            const m = piMetrics.data[pi];
                                            const pct = piMetrics.totalPoints > 0 ? Math.round((m.points / piMetrics.totalPoints) * 100) : 0;
                                            return (
                                                <div key={pi} className="flex flex-col gap-1 bg-white border border-slate-200 rounded p-1.5 shadow-sm min-w-0">
                                                    <div className="flex justify-between items-center bg-indigo-50 px-1 rounded">
                                                        <span className="text-[10px] font-black text-indigo-700">{m.points} pts</span>
                                                        <span className="text-[9px] font-bold text-indigo-400">{pct}%</span>
                                                    </div>
                                                    <div className="grid grid-cols-3 gap-0.5 text-center mt-0.5">
                                                        <div className="flex flex-col" title="Programs">
                                                            <span className="text-[8px] font-bold text-slate-400 uppercase">Prg</span>
                                                            <span className="text-[9px] font-black text-slate-700">{m.programs.size}</span>
                                                        </div>
                                                        <div className="flex flex-col border-l border-slate-100" title="Initiatives/Epics">
                                                            <span className="text-[8px] font-bold text-slate-400 uppercase">Ini</span>
                                                            <span className="text-[9px] font-black text-slate-700">{m.initiatives.size}</span>
                                                        </div>
                                                        <div className="flex flex-col border-l border-slate-100" title="Features">
                                                            <span className="text-[8px] font-bold text-slate-400 uppercase">Ftr</span>
                                                            <span className="text-[9px] font-black text-slate-700">{m.features}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Program Rows */}
                                <div className="space-y-4">
                                    {(dashboardData.hierarchyData || []).map(program => {
                                        const isSelected = selectedPrograms.includes(program.id);
                                        return (
                                        <div key={program.id} className="space-y-2">
                                            <div className={`grid grid-cols-12 gap-4 items-center group transition-opacity ${!isSelected ? 'opacity-50 grayscale' : ''}`}>
                                                <div
                                                    className="col-span-4 flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1.5 rounded-lg transition-colors"
                                                    onClick={() => toggleNode(program.id)}
                                                >
                                                    <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center">
                                                        {expandedNodes[program.id] ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                                                    </div>
                                                    <div className="flex items-center justify-center mr-1" onClick={(e) => e.stopPropagation()}>
                                                        <input 
                                                            type="checkbox" 
                                                            className="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer"
                                                            checked={isSelected}
                                                            onChange={() => toggleProgram(program.id)}
                                                        />
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
                                                {isSelected ? renderTimelineBar(program, 0) : <div className="col-span-7 relative h-8 bg-slate-50/20 rounded-md border border-slate-50"></div>}
                                            </div>

                                            {/* Initiative Rows */}
                                            {expandedNodes[program.id] && isSelected && (
                                                <div className="ml-8 pl-4 border-l-2 border-slate-100 space-y-3">
                                                    {(program.initiatives || []).map(initiative => (
                                                        <div key={initiative.id} className="space-y-2">
                                                            <div className="grid grid-cols-12 gap-4 items-center group">
                                                                <div className="col-span-4 flex items-center gap-2 p-1.5 rounded-lg transition-colors hover:bg-blue-50">
                                                                    <div
                                                                        className="w-4 h-4 flex-shrink-0 flex items-center justify-center cursor-pointer"
                                                                        onClick={() => toggleNode(initiative.id)}
                                                                    >
                                                                        {expandedNodes[initiative.id] ? <ChevronDown className="w-3 h-3 text-slate-400" /> : <ChevronRight className="w-3 h-3 text-slate-400" />}
                                                                    </div>
                                                                    <div
                                                                        className="flex items-center gap-1.5 cursor-pointer flex-1 min-w-0"
                                                                        onClick={() => setSelectedTicket && setSelectedTicket({
                                                                            id: initiative.id,
                                                                            status: 'Epic',
                                                                            summary: initiative.name || initiative.id,
                                                                            rawAttributes: {
                                                                                'Initiative ID': initiative.id,
                                                                                'Name': initiative.name || initiative.id,
                                                                                'Description': initiative.description || '',
                                                                                'Total Points': String(initiative.totalPoints || 0),
                                                                                'Teams': (initiative.teams || []).join(', '),
                                                                                'PI Range': `${initiative.piStart || 'N/A'} → ${initiative.piEnd || 'N/A'}`,
                                                                                'Features Count': String((initiative.features || []).length)
                                                                            }
                                                                        })}
                                                                    >
                                                                        <Folder className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                                                                        <div className="flex flex-col truncate">
                                                                            <span className="text-xs font-bold text-slate-700 truncate hover:text-blue-600 transition-colors">
                                                                                {initiative.id} {initiative.name && initiative.name !== initiative.id ? `- ${initiative.name}` : ''}
                                                                            </span>
                                                                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Initiative</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="col-span-1 text-center text-[11px] font-bold text-slate-500">
                                                                    {initiative.totalPoints}
                                                                </div>
                                                                {renderTimelineBar(initiative, 1)}
                                                            </div>

                                                            {/* Feature Rows */}
                                                            {expandedNodes[initiative.id] && (
                                                                <div className="ml-6 pl-4 border-l border-slate-100 space-y-2 py-1">
                                                                    {(initiative.features || []).filter(f => f && f.id).map(feature => (
                                                                        <div
                                                                            key={feature.id}
                                                                            className="grid grid-cols-12 gap-4 items-center group opacity-85 hover:opacity-100 transition-opacity cursor-pointer hover:bg-indigo-50/50 rounded-lg px-1"
                                                                            onClick={() => setSelectedTicket && setSelectedTicket(feature)}
                                                                        >
                                                                            <div className="col-span-4 flex items-center gap-2 pl-4">
                                                                                <FileText className="w-3 h-3 text-slate-300 group-hover:text-indigo-400 flex-shrink-0 transition-colors" />
                                                                                <div className="flex flex-col truncate">
                                                                                    <span className="text-[11px] font-medium text-slate-600 group-hover:text-indigo-700 truncate transition-colors">{feature.summary}</span>
                                                                                    <span className="text-[8px] font-black text-slate-400 tracking-tighter">{feature.id}</span>
                                                                                </div>
                                                                            </div>
                                                                            <div className="col-span-1 text-center text-[10px] font-medium text-slate-400">
                                                                                {feature.points}
                                                                            </div>
                                                                            {renderTimelineBar({ ...feature, piStart: feature.pi || '', piEnd: feature.pi || '' }, 2)}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                    })}
                                </div>
                            </>
                        ) : null}
                    </div>
                </div>
            </Card>
        </div>
    );
};
