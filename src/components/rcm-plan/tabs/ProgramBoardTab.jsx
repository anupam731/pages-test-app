import React from 'react';
import { KanbanSquare, Settings, BarChart2 } from 'lucide-react';
import { FeatureCard } from '../FeatureCard';
import { getTeamColor, getStatusColor } from '../utils';

export const ProgramBoardTab = ({
    dashboardData,
    boardGroupBy,
    setBoardGroupBy,
    setIsKanbanSettingsOpen,
    showInitiativeSwimlanes,
    setShowInitiativeSwimlanes,
    zoomLevel,
    setZoomLevel,
    dragOverCell,
    setDragOverCell,
    handleDrop,
    handleTeamChange,
    setSelectedTicket,
    hoveredInitiative,
    setHoveredInitiative,
    allAvailableTeams,
    programStyles
}) => {
    // Define groupings based on active toggle
    let boardColumns = [];
    if (boardGroupBy === 'iteration') {
        boardColumns = dashboardData.loadCapacityData.map(d => ({ id: d.iteration, title: d.iteration, subtitle: d.description }));
    } else {
        boardColumns = dashboardData.kanbanColumns.map(c => ({ id: c.id, title: c.title, subtitle: 'Kanban Stage', capacity: c.capacity }));

        // Ensure tickets with unmapped statuses aren't lost by creating fallback columns
        const mappedStatusIds = new Set(boardColumns.map(c => c.id.toLowerCase()));
        const unmappedFeatures = dashboardData.programFeatures.filter(f => !mappedStatusIds.has((f.status || '').toLowerCase()));
        if (unmappedFeatures.length > 0) {
            const hiddenStatuses = new Set(['to do', 'planned']);
            const unmappedStatuses = Array.from(new Set(unmappedFeatures.map(f => f.status || 'Open')))
                .filter(s => !hiddenStatuses.has(s.toLowerCase()));
            unmappedStatuses.forEach(s => {
                boardColumns.push({ id: s, title: s, subtitle: 'Unmapped Status', capacity: 0 });
            });
        }
    }

    const programs = Array.from(new Set(dashboardData.programFeatures.map(f => f.program)));
    const swimlanes = programs.map(progName => {
        const features = dashboardData.programFeatures.filter(f => f.program === progName);
        const totalPoints = features.reduce((sum, f) => sum + (f.points || 0), 0);

        const completedPoints = features.reduce((sum, f) => {
            const isDone = ['done', 'closed', 'resolved', 'complete'].includes((f.status || '').toLowerCase());
            return sum + (isDone ? (f.points || 0) : 0);
        }, 0);
        const progressPercentage = totalPoints > 0 ? Math.round((completedPoints / totalPoints) * 100) : 0;

        // Build Initiatives & Teams mapping
        const initiativesMap = {};
        features.forEach(f => {
            // Initiative mapping
            const pKey = f.parentKey && f.parentKey !== 'None' ? f.parentKey : 'Independent Features';
            if (!initiativesMap[pKey]) initiativesMap[pKey] = { id: pKey, features: [] };
            initiativesMap[pKey].features.push(f);
        });

        // Map Initiative names
        Object.values(initiativesMap).forEach(init => {
            const firstWithSummary = init.features.find(f => f.parentSummary);
            const parentSummary = firstWithSummary?.parentSummary;
            const firstWithDesc = init.features.find(f => f.parentDescription);
            const parentDescription = firstWithDesc?.parentDescription;

            if (init.id !== 'Independent Features') {
                const progObj = dashboardData.hierarchyData.find(p => p.name === progName);
                const initObj = progObj?.initiatives.find(i => i.id === init.id);

                init.name = parentSummary || initObj?.name || init.id;

                // Only use description if it's different from the name
                const rawDesc = parentDescription || initObj?.description || '';
                init.description = (rawDesc && rawDesc !== init.name) ? rawDesc : '';
            } else {
                init.name = 'Independent Features';
                init.description = 'Features not linked to a specific initiative.';
                init.piRange = '';
            }
            
            // Generate PI Range if not set
            if (!init.piRange && init.features.length > 0) {
                const pis = init.features.map(f => f.pi).filter(Boolean).sort();
                if (pis.length > 0) {
                    init.piRange = pis[0] === pis[pis.length - 1] ? pis[0] : `${pis[0]} → ${pis[pis.length - 1]}`;
                }
            }
        });

        // Calculate program-level iteration distribution
        const iterDist = {};
        boardColumns.forEach(col => {
            const p = features.filter(f => boardGroupBy === 'iteration' ? f.iteration === col.id : (f.status || '').toLowerCase() === col.id.toLowerCase()).reduce((s, f) => s + f.points, 0);
            if (p > 0) iterDist[col.id] = p;
        });

        const progObj = (dashboardData.hierarchyData || []).find(p => p.name === progName);
        let piRange = '';
        if (progObj?.piStart && progObj?.piEnd) {
            piRange = progObj.piStart === progObj.piEnd ? progObj.piStart : `${progObj.piStart} → ${progObj.piEnd}`;
        } else if (features.length > 0) {
             const pis = features.map(f => f.pi).filter(Boolean).sort();
             if (pis.length > 0) {
                 piRange = pis[0] === pis[pis.length - 1] ? pis[0] : `${pis[0]} → ${pis[pis.length - 1]}`;
             }
        }

        return {
            name: progName,
            description: progObj?.description || 'Strategic program delivering key value stream features.',
            piRange,
            features,
            initiativesMap,
            iterDist,
            totalPoints,
            completedPoints,
            progressPercentage
        };
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex flex-col">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <KanbanSquare className="w-5 h-5 text-slate-500" /> Program Board (Swimlanes)
                    </h2>
                    <p className="text-sm text-slate-500 font-medium">Grouped by Value Stream / Program</p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    {/* Group By Controls */}
                    <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-lg border border-slate-200">
                        <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 px-2 hidden lg:block">Columns:</span>
                        <button
                            onClick={() => setBoardGroupBy('iteration')}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${boardGroupBy === 'iteration' ? 'bg-white shadow-sm text-blue-700' : 'text-slate-600 hover:text-slate-900'}`}
                        >
                            Iteration
                        </button>
                        <button
                            onClick={() => setBoardGroupBy('status')}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${boardGroupBy === 'status' ? 'bg-white shadow-sm text-blue-700' : 'text-slate-600 hover:text-slate-900'}`}
                        >
                            Status
                        </button>
                        {boardGroupBy === 'status' && (
                            <button
                                onClick={() => setIsKanbanSettingsOpen(true)}
                                className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-md transition-colors ml-1"
                                title="Configure Kanban Columns"
                            >
                                <Settings className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    {/* Sub-Swimlane Toggle */}
                    <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-lg border border-slate-200">
                        <label className="text-xs font-semibold text-slate-600 px-2 flex items-center gap-2 cursor-pointer hover:text-slate-900 transition-colors select-none">
                            <input
                                type="checkbox"
                                checked={showInitiativeSwimlanes}
                                onChange={(e) => setShowInitiativeSwimlanes(e.target.checked)}
                                className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                            />
                            Sub-Swimlanes
                        </label>
                    </div>

                    <div className="w-px h-6 bg-slate-200 hidden md:block"></div>

                    {/* Zoom Controls */}
                    <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-lg border border-slate-200">
                        <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 px-2 hidden lg:block">Zoom:</span>
                        <button
                            onClick={() => setZoomLevel(1)}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${zoomLevel === 1 ? 'bg-white shadow-sm text-blue-700' : 'text-slate-600 hover:text-slate-900'}`}
                        >
                            Compact
                        </button>
                        <button
                            onClick={() => setZoomLevel(2)}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${zoomLevel === 2 ? 'bg-white shadow-sm text-blue-700' : 'text-slate-600 hover:text-slate-900'}`}
                        >
                            Normal
                        </button>
                        <button
                            onClick={() => setZoomLevel(3)}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${zoomLevel === 3 ? 'bg-white shadow-sm text-blue-700' : 'text-slate-600 hover:text-slate-900'}`}
                        >
                            Detailed
                        </button>
                    </div>
                </div>
            </div>

            <div className="overflow-auto max-h-[75vh] custom-scrollbar border border-slate-200 rounded-xl bg-white shadow-sm">
                <div className="inline-block min-w-max w-full relative pb-4">

                    {/* Header Row */}
                    <div className="flex bg-slate-50 border-b border-slate-200 sticky top-0 z-40 shadow-[0_2px_5px_-2px_rgba(0,0,0,0.05)]">
                        {/* Sticky Program Header */}
                        <div className="w-64 flex-shrink-0 p-4 font-bold text-slate-700 border-r border-slate-200 sticky left-0 z-50 bg-slate-50 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                            Program / Value Stream
                        </div>
                        {/* Sticky Initiative Header (If Active) */}
                        {showInitiativeSwimlanes && (
                            <div className="w-48 flex-shrink-0 p-4 font-bold text-slate-700 border-r border-slate-200 sticky left-64 z-50 bg-slate-50 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                                Initiative / Epic
                            </div>
                        )}

                        {boardColumns.map(col => {
                            let load = 0;
                            let capacity = 0;

                            if (boardGroupBy === 'iteration') {
                                const iterCapacity = dashboardData.loadCapacityData.find(d => d.iteration === col.id);
                                load = iterCapacity?.load || 0;
                                capacity = iterCapacity?.capacity || 0;
                            } else {
                                load = dashboardData.programFeatures
                                    .filter(f => (f.status || '').toLowerCase() === col.id.toLowerCase())
                                    .reduce((sum, f) => sum + f.points, 0);
                                capacity = col.capacity || 0;
                            }

                            const isOver = capacity > 0 && load > capacity;
                            const actualPercentage = capacity > 0 ? Math.round((load / capacity) * 100) : 0;
                            const loadPercentage = Math.min(100, actualPercentage);

                            return (
                                <div key={col.id} className="w-72 flex-shrink-0 p-3 border-r border-slate-200 last:border-r-0 flex flex-col items-center justify-center">
                                    <span className="font-bold text-slate-800">{col.title}</span>
                                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">{col.subtitle}</span>

                                    {/* Iteration / Status Load vs Capacity Bar */}
                                    {(col.id !== 'Unassigned' && capacity > 0) ? (
                                        <div className="w-full max-w-[180px] flex flex-col gap-1">
                                            <div className="flex justify-between items-center text-[10px]">
                                                <span className={isOver ? 'text-rose-600 font-bold' : 'text-slate-600 font-medium'}>
                                                    Load: {load} pts ({actualPercentage}%)
                                                </span>
                                                <span className="text-slate-500 font-medium">Cap: {capacity} pts</span>
                                            </div>
                                            <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden flex">
                                                <div
                                                    className={`h-1.5 transition-all duration-300 ${isOver ? 'bg-rose-500' : 'bg-blue-500'}`}
                                                    style={{ width: `${loadPercentage}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="w-full max-w-[180px] flex flex-col gap-1 items-center justify-center h-full">
                                            <span className="text-slate-600 font-bold text-[10px] bg-slate-100 px-2 py-1 rounded border border-slate-200">
                                                Load: {load} pts
                                            </span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Swimlane Rows */}
                    {swimlanes.map(lane => (
                        <div key={lane.name} className="flex border-b border-slate-200 last:border-b-0 relative items-stretch">

                            {/* Left Pane: Program Summary */}
                            <div className="w-64 flex-shrink-0 p-4 border-r border-slate-200 bg-white sticky left-0 z-20 flex flex-col shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                                <div className="flex items-center gap-2 mb-1.5">
                                    <div className={`w-1.5 h-4 rounded-full ${programStyles[lane.name]?.replace('border-l-4 border-l-', 'bg-') || 'bg-slate-400'}`}></div>
                                    <h3 className="font-bold text-slate-800 text-sm leading-tight">{lane.name}</h3>
                                </div>
                                {lane.piRange && (
                                     <div className="flex items-center gap-1.5 mb-2 mt-[-2px] ml-3.5">
                                        <span className="text-[9px] font-bold text-slate-700 bg-white border border-slate-200 px-1.5 py-0.5 rounded shadow-sm">{lane.piRange}</span>
                                     </div>
                                )}

                                {lane.description && (
                                    <p className="text-[10px] text-slate-500 mb-3 leading-tight italic font-medium px-1">
                                        {lane.description}
                                    </p>
                                )}

                                <div className="bg-slate-50/80 rounded-lg p-2.5 border border-slate-100 mb-3">
                                    <div className="flex justify-between items-center mb-1 text-[10px]">
                                        <span className="text-slate-500 flex items-center gap-1"><BarChart2 className="w-3 h-3" /> Summary</span>
                                        <span className="font-bold text-indigo-600">{lane.totalPoints} pts</span>
                                    </div>

                                    <div className="w-full bg-slate-200 rounded-full h-1 mt-1.5 overflow-hidden flex">
                                        <div className="bg-emerald-500 h-1 transition-all duration-500" style={{ width: `${lane.progressPercentage}%` }}></div>
                                    </div>
                                    <div className="flex justify-between items-center mt-1">
                                        <span className="text-[9px] font-bold text-slate-400">{lane.progressPercentage}% Done</span>
                                        <span className="text-[9px] font-bold text-slate-400">{lane.features.length} epics</span>
                                    </div>
                                </div>

                                {/* Program-level iteration distribution sparkline */}
                                <div className="mt-2 pt-2 border-t border-slate-50">
                                    <div className="flex justify-between items-center mb-1.5">
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Program Dist.</span>
                                        <span className="text-[9px] font-bold text-indigo-500">{Object.keys(lane.iterDist).length} Iters</span>
                                    </div>
                                    <div className="flex items-end gap-1 h-8 px-1">
                                        {boardColumns.map(col => {
                                            const pts = lane.iterDist[col.id] || 0;
                                            const maxPts = Math.max(...Object.values(lane.iterDist), 1);
                                            const h = (pts / maxPts) * 100;
                                            return (
                                                <div
                                                    key={col.id}
                                                    className={`flex-1 rounded-t-[1px] transition-all duration-500 ${pts > 0 ? 'bg-indigo-300' : 'bg-slate-100'}`}
                                                    style={{ height: pts > 0 ? `${Math.max(25, h)}%` : '2px' }}
                                                    title={`${col.title}: ${pts} pts`}
                                                ></div>
                                            );
                                        })}
                                    </div>
                                    <div className="flex justify-between items-center text-[7px] font-black text-slate-300 uppercase mt-1 px-1">
                                        <span>{boardColumns[0]?.title}</span>
                                        <span>{boardColumns[boardColumns.length - 1]?.title}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Columns Container (Right Side) */}
                            <div className="flex flex-col w-full">
                                {/* PROGRAM SUMMARY ROLLUP ROW */}
                                <div className="flex bg-slate-50/50 border-b border-slate-200">
                                    <div className="w-48 flex-shrink-0 sticky left-64 z-10 p-2 px-3 flex items-center border-r border-slate-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] bg-slate-50">
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Iter. Rollup</span>
                                    </div>
                                    {boardColumns.map(col => {
                                        const pts = lane.features.filter(f => boardGroupBy === 'iteration' ? f.iteration === col.id : (f.status || '').toLowerCase() === col.id.toLowerCase()).reduce((s, f) => s + f.points, 0);
                                        const count = lane.features.filter(f => boardGroupBy === 'iteration' ? f.iteration === col.id : (f.status || '').toLowerCase() === col.id.toLowerCase()).length;
                                        return (
                                            <div key={col.id} className="w-72 flex-shrink-0 p-2.5 flex items-center justify-center border-r border-slate-200 last:border-r-0">
                                                {pts > 0 && (
                                                    <div className="flex items-center gap-3 bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-sm transition-all hover:border-indigo-300">
                                                        <div className="flex items-center gap-1">
                                                            <BarChart2 className="w-3.5 h-3.5 text-indigo-500" />
                                                            <span className="text-xs font-black text-slate-900">{pts}</span>
                                                            <span className="text-[10px] font-bold text-slate-500">pts</span>
                                                        </div>
                                                        <div className="w-px h-3 bg-slate-200"></div>
                                                        <div className="text-[10px] font-bold text-slate-500">
                                                            {count} <span className="text-[9px] uppercase tracking-tighter">epics</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {showInitiativeSwimlanes ? (
                                    /* INITIATIVE SUB-SWIMLANES */
                                    Object.values(lane.initiativesMap).map((init, initIdx) => (
                                        <div key={init.id} className={`flex w-full items-stretch ${initIdx !== Object.values(lane.initiativesMap).length - 1 ? 'border-b border-slate-200' : ''}`}>
                                            {/* Sticky Initiative Header */}
                                            <div className="w-48 flex-shrink-0 bg-slate-50/90 border-r border-slate-200 sticky left-64 z-10 p-3 flex flex-col justify-center shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] border-l-2 border-l-indigo-400">
                                                <div className="flex items-center justify-between mb-0.5">
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Initiative</span>
                                                    <span className="text-[10px] font-black text-indigo-400/80 font-mono tracking-tighter">{init.id}</span>
                                                </div>
                                                <span className="text-xs font-black text-slate-800 break-words leading-tight">{init.name}</span>
                                                {init.piRange && (
                                                     <div className="mt-1.5 mb-0.5">
                                                         <span className="text-[9px] font-bold text-slate-600 bg-white border border-slate-200 px-1.5 py-0.5 rounded shadow-sm inline-block">{init.piRange}</span>
                                                     </div>
                                                )}
                                                {init.description && (
                                                    <p className="text-[10px] text-slate-500 mt-1 leading-tight line-clamp-2 italic font-medium">
                                                        {init.description}
                                                    </p>
                                                )}
                                                <div className="mt-2.5 flex items-center gap-2">
                                                    <span className="text-[10px] font-bold text-indigo-700 bg-white px-1.5 py-0.5 rounded border border-indigo-100 shadow-sm">
                                                        {init.features.reduce((s, f) => s + f.points, 0)} pts
                                                    </span>
                                                    <span className="text-[10px] font-bold text-slate-500">
                                                        {init.features.length} epics
                                                    </span>
                                                </div>

                                                {/* Integrated Iteration Distribution Sparkline */}
                                                <div className="mt-3 pt-2 border-t border-slate-100">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Iter. Distribution</span>
                                                    </div>
                                                    <div className="flex items-end gap-0.5 h-4">
                                                        {(() => {
                                                            const iterDist = {};
                                                            boardColumns.forEach(col => {
                                                                const p = init.features.filter(f => boardGroupBy === 'iteration' ? f.iteration === col.id : (f.status || '').toLowerCase() === col.id.toLowerCase()).reduce((s, f) => s + f.points, 0);
                                                                if (p > 0) iterDist[col.id] = p;
                                                            });
                                                            const maxPts = Math.max(...Object.values(iterDist), 1);

                                                            return boardColumns.map(col => {
                                                                const pts = iterDist[col.id] || 0;
                                                                const h = (pts / maxPts) * 100;
                                                                return (
                                                                    <div
                                                                        key={col.id}
                                                                        className={`flex-1 rounded-t-[1px] transition-all duration-300 ${pts > 0 ? 'bg-indigo-400 opacity-80' : 'bg-slate-200 opacity-20'}`}
                                                                        style={{ height: pts > 0 ? `${Math.max(30, h)}%` : '1px' }}
                                                                        title={`${col.title}: ${pts} pts`}
                                                                    ></div>
                                                                );
                                                            });
                                                        })()}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Columns for this Initiative */}
                                            {boardColumns.map(col => {
                                                const cellId = `${lane.name}-${init.id}-${col.id}`;
                                                const isDragOver = dragOverCell === cellId;
                                                const cellFeatures = init.features.filter(f => boardGroupBy === 'iteration' ? f.iteration === col.id : (f.status || '').toLowerCase() === col.id.toLowerCase());

                                                return (
                                                    <div
                                                        key={col.id}
                                                        onDragOver={(e) => { e.preventDefault(); setDragOverCell(cellId); }}
                                                        onDragLeave={() => setDragOverCell(null)}
                                                        onDrop={(e) => handleDrop(e, col.id, lane.name, boardGroupBy)}
                                                        className={`w-72 flex-shrink-0 p-3 border-r border-slate-200 last:border-r-0 flex flex-col transition-colors ${zoomLevel === 1 ? 'gap-1.5' : zoomLevel === 3 ? 'gap-4' : 'gap-3'} ${isDragOver ? 'bg-blue-50/80 ring-2 ring-inset ring-blue-400' : 'bg-slate-50/30'}`}
                                                    >
                                                        {cellFeatures.length === 0 ? (
                                                            <div className={`flex items-center justify-center h-full min-h-[60px] border-2 border-dashed rounded-lg pointer-events-none transition-colors ${isDragOver ? 'border-blue-400 text-blue-500 bg-white/50' : 'border-transparent text-transparent'}`}>
                                                                <span className="text-xs font-medium">{isDragOver ? 'Drop feature here' : ''}</span>
                                                            </div>
                                                        ) : (
                                                            cellFeatures.map(feature => (
                                                                <FeatureCard
                                                                    key={feature.id}
                                                                    feature={feature}
                                                                    zoomLevel={zoomLevel}
                                                                    onClick={() => setSelectedTicket(feature)}
                                                                    onMouseEnter={() => feature.parentKey && feature.parentKey !== 'None' ? setHoveredInitiative(feature.parentKey) : null}
                                                                    onMouseLeave={() => setHoveredInitiative(null)}
                                                                    handleTeamChange={handleTeamChange}
                                                                    allAvailableTeams={allAvailableTeams}
                                                                    teamAllocation={dashboardData.teamAllocation}
                                                                    hoveredInitiative={hoveredInitiative}
                                                                    setDragOverCell={setDragOverCell}
                                                                />
                                                            ))
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ))
                                ) : (
                                    /* FLAT VIEW (No Sub-Swimlanes) */
                                    <div className="flex h-full w-full">
                                        {boardColumns.map(col => {
                                            const cellId = `${lane.name}-${col.id}`;
                                            const isDragOver = dragOverCell === cellId;
                                            const cellFeatures = lane.features.filter(f => boardGroupBy === 'iteration' ? f.iteration === col.id : (f.status || '').toLowerCase() === col.id.toLowerCase());

                                            return (
                                                <div
                                                    key={col.id}
                                                    onDragOver={(e) => { e.preventDefault(); setDragOverCell(cellId); }}
                                                    onDragLeave={() => setDragOverCell(null)}
                                                    onDrop={(e) => handleDrop(e, col.id, lane.name, boardGroupBy)}
                                                    className={`w-72 flex-shrink-0 p-3 border-r border-slate-200 last:border-r-0 flex flex-col transition-colors ${zoomLevel === 1 ? 'gap-1.5' : zoomLevel === 3 ? 'gap-4' : 'gap-3'} ${isDragOver ? 'bg-blue-50/80 ring-2 ring-inset ring-blue-400' : 'bg-slate-50/30'}`}
                                                >
                                                    {cellFeatures.length === 0 ? (
                                                        <div className={`flex items-center justify-center h-full min-h-[100px] border-2 border-dashed rounded-lg pointer-events-none transition-colors ${isDragOver ? 'border-blue-400 text-blue-500 bg-white/50' : 'border-slate-200 text-slate-400'}`}>
                                                            <span className="text-xs font-medium">{isDragOver ? 'Drop feature here' : 'No features'}</span>
                                                        </div>
                                                    ) : (
                                                        cellFeatures.map(feature => (
                                                            <FeatureCard
                                                                key={feature.id}
                                                                feature={feature}
                                                                zoomLevel={zoomLevel}
                                                                onClick={() => setSelectedTicket(feature)}
                                                                onMouseEnter={() => feature.parentKey && feature.parentKey !== 'None' ? setHoveredInitiative(feature.parentKey) : null}
                                                                onMouseLeave={() => setHoveredInitiative(null)}
                                                                handleTeamChange={handleTeamChange}
                                                                allAvailableTeams={allAvailableTeams}
                                                                teamAllocation={dashboardData.teamAllocation}
                                                                hoveredInitiative={hoveredInitiative}
                                                                setDragOverCell={setDragOverCell}
                                                            />
                                                        ))
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
