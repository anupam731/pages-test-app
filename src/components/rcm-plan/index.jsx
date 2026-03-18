import React, { useState, useEffect } from 'react';
import {
    LayoutDashboard, Info, Download, Upload, AlertCircle, ChevronDown,
    Zap, BrainCircuit, RefreshCcw, Layers, Target, Users, ShieldAlert,
    Calendar, Filter, Check
} from 'lucide-react';
import { Card } from './ui-components';
import {
    initialData,
    aiInsights,
    metricTitles,
    programStyles
} from './mock-data';
import {
    parseCSV,
    getColIdx,
    getTeamColor,
    aggregateBoardData
} from './utils';

// Modals
import { SummaryKPIModal } from './modals/SummaryKPIModal';
import { TicketDetailsModal } from './modals/TicketDetailsModal';
import { KanbanSettingsModal } from './modals/KanbanSettingsModal';

// Tabs
import { OverviewTab } from './tabs/OverviewTab';
import { TimelineTab } from './tabs/TimelineTab';
import { ProgramBoardTab } from './tabs/ProgramBoardTab';
import { TeamLoadTab } from './tabs/TeamLoadTab';
import { HierarchyTab } from './tabs/HierarchyTab';
import { ChangeLogTab } from './tabs/ChangeLogTab';
import { RisksTab } from './tabs/RisksTab';
import { MultiPITimelineTab } from './tabs/MultiPITimelineTab';

const RcmPlan = () => {
    // Basic Persistence & UI State
    const [activeTab, setActiveTab] = useState('board');
    const [uploadError, setUploadError] = useState(null);
    const [lastHistoryId, setLastHistoryId] = useState(0);

    // Zoom and Grouping State
    const [zoomLevel, setZoomLevel] = useState(2);
    const [boardGroupBy, setBoardGroupBy] = useState('iteration');
    const [showInitiativeSwimlanes, setShowInitiativeSwimlanes] = useState(true);
    const [dragOverCell, setDragOverCell] = useState(null);
    const [hoveredInitiative, setHoveredInitiative] = useState(null);
    const [expandedNodes, setExpandedNodes] = useState({});

    // Modal State
    const [selectedMetric, setSelectedMetric] = useState(null);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [isKanbanSettingsOpen, setIsKanbanSettingsOpen] = useState(false);

    // CORE DATA STATE
    const [dashboardData, setDashboardData] = useState({
        programFeatures: initialData.programFeatures,
        teamAllocation: [],
        loadCapacityData: [],
        epicSequencing: [],
        hierarchyData: [],
        summaryMetrics: initialData.summaryMetrics,
        kanbanColumns: initialData.kanbanColumns,
        risks: initialData.risks
    });

    const [updateHistory, setUpdateHistory] = useState([]);

    // Derived State
    const allAvailableTeams = Array.from(new Set(dashboardData.programFeatures.map(f => f.team))).filter(t => t !== 'Unassigned').sort();

    // GLOBAL STATUS & PI FILTERS
    const getStatusCategory = (status) => {
        const s = (status || '').toLowerCase();
        if (['done', 'closed', 'resolved', 'complete'].includes(s)) return 'Closed';
        if (['in progress', 'active', 'doing'].includes(s)) return 'In Progress';
        return 'Open';
    };

    const StatusOptions = ['Open', 'In Progress', 'Closed'];
    const [statusFilter, setStatusFilter] = useState([...StatusOptions]);
    const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);

    // PI Filter State
    const globalAllPIs = React.useMemo(() => {
        const pis = new Set();
        (dashboardData.programFeatures || []).forEach(f => {
            if (f.pi) pis.add(f.pi);
        });
        return Array.from(pis).sort();
    }, [dashboardData.programFeatures]);

    const [selectedPIs, setSelectedPIs] = useState(globalAllPIs);
    const [isPIDropdownOpen, setIsPIDropdownOpen] = useState(false);

    // Sync PI filter when data changes (e.g. initial upload)
    React.useEffect(() => {
        if (globalAllPIs.length > 0 && selectedPIs.length === 0) {
            setSelectedPIs(globalAllPIs);
        }
    }, [globalAllPIs.join(',')]);

    const filteredFeatures = React.useMemo(() => {
        return dashboardData.programFeatures.filter(f => {
            const category = getStatusCategory(f.status);
            const matchesStatus = statusFilter.includes(category);
            const matchesPI = selectedPIs.includes(f.pi) || !f.pi; // Include empty PIs currently
            return matchesStatus && matchesPI;
        });
    }, [dashboardData.programFeatures, statusFilter, selectedPIs]);

    // Re-calculate aggregations whenever core data or filters change
    const activeDashboardData = React.useMemo(() => {
        const aggregated = aggregateBoardData(filteredFeatures, dashboardData.kanbanColumns);
        return {
            ...dashboardData,     // keep raw risks, kanbanColumns, etc.
            ...aggregated,        // override with newly aggregated metrics based on filtered data
            programFeatures: filteredFeatures, // override raw features with filtered features for all tabs
            allPIs: globalAllPIs  // expose all available PIs for UI that needs it regardless of filter
        };
    }, [filteredFeatures, dashboardData, globalAllPIs]);

    // HANDLERS
    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploadError(null);

        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const text = evt.target.result;
                const rows = parseCSV(text);
                if (rows.length < 2) throw new Error("CSV appears to be empty or has only one row.");

                let headerIdx = -1;
                let idxKey = -1, idxSummary = -1;

                for (let i = 0; i < Math.min(5, rows.length); i++) {
                    idxKey = getColIdx(rows[i], ['Issue key', 'Key', 'Issue']);
                    idxSummary = getColIdx(rows[i], ['Summary', 'Title']);
                    if (idxKey !== -1 && idxSummary !== -1) {
                        headerIdx = i;
                        break;
                    }
                }

                if (headerIdx === -1) throw new Error("Could not find header row with 'Issue key' and 'Summary'.");

                const headers = rows[headerIdx];
                const idxTeam = getColIdx(headers, ['Scrum Team', 'Team']);
                const idxIteration = getColIdx(headers, ['Iteration', 'Sprint']);
                const idxPoints = getColIdx(headers, ['Feature Points (Job Size)', 'Story Points', 'Points']);
                const idxStatus = getColIdx(headers, ['Status', 'State']);
                const idxParent = getColIdx(headers, ['Parent Key', 'Parent', 'Epic Link']);
                const idxParentSummary = getColIdx(headers, ['Parent Summary', 'Epic Link Summary', 'Initiative Summary', 'Epic Name']);
                const idxParentDescription = getColIdx(headers, ['Parent Description', 'Epic Description', 'Initiative Description']);
                const idxAssignee = getColIdx(headers, ['Assignee', 'Member']);
                const idxProgram = getColIdx(headers, ['Program', 'Value Stream', 'Project', 'ValueStream', 'Program Name']);
                const idxPI = getColIdx(headers, ['Program Increment', 'PI', 'Increment']);

                const newFeatures = rows.slice(headerIdx + 1).map((row, rIdx) => {
                    const status = idxStatus !== -1 ? row[idxStatus] : 'To Do';
                    const team = idxTeam !== -1 ? row[idxTeam] : 'Unassigned';
                    const member = idxAssignee !== -1 ? (row[idxAssignee] || team) : team;

                    const attr = {};
                    headers.forEach((h, i) => { attr[h] = row[i]; });

                    return {
                        id: row[idxKey],
                        summary: row[idxSummary],
                        team,
                        member,
                        iteration: idxIteration !== -1 ? row[idxIteration] : 'Unassigned',
                        pi: idxPI !== -1 ? row[idxPI] : 'Current PI',
                        points: idxPoints !== -1 ? (parseFloat(row[idxPoints]) || 0) : 0,
                        status,
                        parentKey: idxParent !== -1 ? row[idxParent] : 'None',
                        parentSummary: idxParentSummary !== -1 ? row[idxParentSummary] : '',
                        parentDescription: idxParentDescription !== -1 ? row[idxParentDescription] : '',
                        program: (idxProgram !== -1 && row[idxProgram]) ? row[idxProgram] : 'Imported Program',
                        rawAttributes: attr
                    };
                }).filter(f => f.id);

                setDashboardData(prev => ({ ...prev, programFeatures: newFeatures }));
                setUpdateHistory([]);
                setActiveTab('board');
            } catch (err) {
                setUploadError(err.message);
            }
        };
        reader.readAsText(file);
    };

    const handleTeamChange = (ticketId, newTeam) => {
        const ticket = dashboardData.programFeatures.find(f => f.id === ticketId);
        if (!ticket || ticket.team === newTeam) return;

        const oldTeam = ticket.team;
        setDashboardData(prev => ({
            ...prev,
            programFeatures: prev.programFeatures.map(f => f.id === ticketId ? { ...f, team: newTeam } : f)
        }));

        const newLog = {
            id: lastHistoryId + 1,
            ticketId,
            ticketTitle: ticket.summary,
            type: 'Team',
            oldValue: oldTeam,
            newValue: newTeam,
            message: `Moved from ${oldTeam} to ${newTeam}`,
            timestamp: new Date()
        };
        setUpdateHistory([newLog, ...updateHistory]);
        setLastHistoryId(lastHistoryId + 1);
    };

    const handleDrop = (e, colId, laneName, groupBy) => {
        e.preventDefault();
        const ticketId = e.dataTransfer.getData('text/plain');
        const ticket = dashboardData.programFeatures.find(f => f.id === ticketId);
        if (!ticket) return;

        const isUpdateNeeded = (groupBy === 'iteration' && ticket.iteration !== colId) ||
            (groupBy === 'status' && ticket.status !== colId);

        if (!isUpdateNeeded) return;

        const oldVal = groupBy === 'iteration' ? ticket.iteration : ticket.status;
        setDashboardData(prev => ({
            ...prev,
            programFeatures: prev.programFeatures.map(f => f.id === ticketId ? { ...f, [groupBy]: colId } : f)
        }));

        const newLog = {
            id: lastHistoryId + 1,
            ticketId,
            ticketTitle: ticket.summary,
            type: groupBy === 'iteration' ? 'Iteration' : 'Status',
            oldValue: oldVal,
            newValue: colId,
            message: `Moved from ${oldVal} to ${colId}`,
            timestamp: new Date()
        };
        setUpdateHistory([newLog, ...updateHistory]);
        setLastHistoryId(lastHistoryId + 1);
        setDragOverCell(null);
    };

    const handleRevert = (logId) => {
        const log = updateHistory.find(l => l.id === logId);
        if (!log) return;

        setDashboardData(prev => ({
            ...prev,
            programFeatures: prev.programFeatures.map(f => {
                if (f.id === log.ticketId) {
                    const key = log.type === 'Team' ? 'team' : log.type.toLowerCase();
                    return { ...f, [key]: log.oldValue };
                }
                return f;
            })
        }));
        setUpdateHistory(updateHistory.filter(l => l.id !== logId));
    };

    const toggleNode = (id) => {
        setExpandedNodes(prev => ({ ...prev, [id]: !prev[id] }));
    };

    return (
        <div className="flex flex-col min-h-screen">
            {/* Header section */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-[60] shadow-sm">
                <div className="w-full px-4 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-indigo-600 p-2 rounded-xl shadow-indigo-200 shadow-lg">
                            <LayoutDashboard className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-slate-800 tracking-tight">RCM Plan Manager</h1>
                            <div className="flex items-center gap-2">
                                <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-0.5 rounded border border-slate-100 italic">
                                    Strategic Delivery Insights
                                </span>
                                <div className="h-1 w-1 rounded-full bg-slate-300"></div>
                                <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">v2.0 Beta</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg cursor-pointer transition-all border border-slate-200 group text-slate-700">
                            <Upload className="w-4 h-4 text-slate-500 group-hover:text-slate-800" />
                            <span className="text-sm font-bold">Import CSV</span>
                            <input type="file" className="hidden" accept=".csv" onChange={handleFileUpload} />
                        </label>
                        <button className="flex items-center gap-2 bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-lg transition-all shadow-md hover:shadow-lg active:scale-95 border border-slate-800">
                            <Download className="w-4 h-4" />
                            <span className="text-sm font-bold">Export Plan</span>
                        </button>
                    </div>
                </div>

                {uploadError && (
                    <div className="bg-rose-50 border-t border-rose-100 px-6 py-2 flex items-center gap-2 text-rose-700 text-xs font-bold animate-in slide-in-from-top duration-300">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" /> {uploadError}
                    </div>
                )}

                <div className="bg-white border-t border-slate-100">
                    <div className="w-full px-4 lg:px-8 flex items-center justify-between">
                        <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar py-2">
                            {[
                                { id: 'board', label: 'Program Board', icon: Zap },
                                { id: 'overview', label: 'Overview', icon: LayoutDashboard },
                                { label: 'Timeline', id: 'timeline', icon: Calendar },
                                { label: 'Multi-PI Roadmap', id: 'multipiroadmap', icon: Layers },
                                { label: 'Team Load', id: 'teamload', icon: Users },
                                { id: 'hierarchy', label: 'Initiative Hierarchy', icon: BrainCircuit },
                                { id: 'updates', label: 'Change Log', icon: RefreshCcw },
                                { id: 'risks', label: 'Risks', icon: AlertCircle }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100 ring-1 ring-indigo-200/50' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
                                >
                                    <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-indigo-600' : 'text-slate-400'}`} />
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                        {/* Filters Section */}
                        <div className="flex items-center gap-3 pr-2 whitespace-nowrap">
                            {/* PI Multi-Select Filter */}
                            {globalAllPIs.length > 0 && (
                                <div className="relative">
                                    <button
                                        onClick={() => {
                                            setIsPIDropdownOpen(!isPIDropdownOpen);
                                            setIsStatusDropdownOpen(false); // Close other dropdown
                                        }}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all shadow-sm ${selectedPIs.length !== globalAllPIs.length ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-300'}`}
                                    >
                                        <Filter className={`w-3.5 h-3.5 ${selectedPIs.length !== globalAllPIs.length ? 'text-indigo-500' : 'text-slate-400'}`} />
                                        <span className="hidden sm:inline">Filter</span> PIs
                                        <div className="flex -space-x-1">
                                            {selectedPIs.length === globalAllPIs.length ? (
                                                <span className="ml-1 text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full border border-slate-200">All</span>
                                            ) : (
                                                <span className="ml-1 text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full border border-indigo-200">{selectedPIs.length}</span>
                                            )}
                                        </div>
                                        <ChevronDown className="w-3 h-3 text-slate-400" />
                                    </button>

                                    {isPIDropdownOpen && (
                                        <>
                                            <div className="fixed inset-0 z-40" onClick={() => setIsPIDropdownOpen(false)} />
                                            <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-xl shadow-xl border border-slate-200 z-50 p-2 overflow-hidden animate-in fade-in slide-in-from-top-2">
                                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 pb-2 mb-2 border-b border-slate-100">
                                                    Filter PIs
                                                </div>
                                                <div className="max-h-60 overflow-y-auto px-1 custom-scrollbar">
                                                    {globalAllPIs.map(pi => {
                                                        const isChecked = selectedPIs.includes(pi);
                                                        return (
                                                            <label key={pi} className="flex items-center justify-between px-2 py-1.5 hover:bg-slate-50 rounded-lg cursor-pointer group transition-colors">
                                                                <span className={`text-sm font-bold ${isChecked ? 'text-slate-800' : 'text-slate-500'}`}>{pi}</span>
                                                                <input 
                                                                    type="checkbox" 
                                                                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer"
                                                                    checked={isChecked}
                                                                    onChange={() => {
                                                                        if (isChecked) {
                                                                            setSelectedPIs(selectedPIs.filter(p => p !== pi));
                                                                        } else {
                                                                            setSelectedPIs([...selectedPIs, pi]);
                                                                        }
                                                                    }}
                                                                />
                                                            </label>
                                                        )
                                                    })}
                                                </div>
                                                <div className="pt-2 mt-2 border-t border-slate-100 px-2 flex justify-between">
                                                    <button 
                                                        onClick={() => setSelectedPIs(globalAllPIs)}
                                                        className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 w-full text-left p-1 rounded hover:bg-indigo-50 transition-colors"
                                                    >
                                                        Select All
                                                    </button>
                                                    <button 
                                                        onClick={() => setSelectedPIs([])}
                                                        className="text-[10px] font-bold text-slate-500 hover:text-slate-700 w-full text-right p-1 rounded hover:bg-slate-50 transition-colors"
                                                    >
                                                        Clear
                                                    </button>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}

                            {/* Status Filter */}
                            <div className="relative flex items-center gap-2 ml-2 flex-shrink-0">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest hidden md:inline">Status Filter:</span>
                                <div className="relative">
                                    <button
                                        onClick={() => {
                                            setIsStatusDropdownOpen(!isStatusDropdownOpen);
                                            setIsPIDropdownOpen(false); // Close other dropdown
                                        }}
                                        className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 hover:border-indigo-300 rounded-lg text-xs font-bold text-slate-700 shadow-sm"
                                    >
                                        <Filter className="w-3.5 h-3.5 text-indigo-500" />
                                        <span className="hidden sm:inline">Filter</span> Status
                                        <div className="flex -space-x-1">
                                            {statusFilter.length === StatusOptions.length ? (
                                                <span className="ml-1 text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full border border-slate-200">All</span>
                                            ) : (
                                                <span className="ml-1 text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full border border-indigo-200">{statusFilter.length}</span>
                                            )}
                                        </div>
                                        <ChevronDown className="w-3 h-3 text-slate-400" />
                                    </button>

                                    {isStatusDropdownOpen && (
                                        <>
                                            <div className="fixed inset-0 z-40" onClick={() => setIsStatusDropdownOpen(false)}></div>
                                            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-xl border border-slate-200 z-50 p-2 overflow-hidden animate-in fade-in slide-in-from-top-2">
                                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 pb-2 mb-2 border-b border-slate-100">
                                                    Map & Filter
                                                </div>
                                                {StatusOptions.map(opt => {
                                                    const isChecked = statusFilter.includes(opt);
                                                    return (
                                                        <label key={opt} className="flex items-center justify-between px-2 py-1.5 hover:bg-slate-50 rounded-lg cursor-pointer group transition-colors">
                                                            <span className={`text-sm font-bold ${isChecked ? 'text-slate-800' : 'text-slate-500'}`}>{opt}</span>
                                                            <input 
                                                                type="checkbox" 
                                                                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer"
                                                                checked={isChecked}
                                                                onChange={() => {
                                                                    if (isChecked) {
                                                                        setStatusFilter(statusFilter.filter(s => s !== opt));
                                                                    } else {
                                                                        setStatusFilter([...statusFilter, opt]);
                                                                    }
                                                                }}
                                                            />
                                                        </label>
                                                    );
                                                })}
                                                <div className="pt-2 mt-2 border-t border-slate-100 px-2 flex justify-between">
                                                    <button 
                                                        onClick={() => setStatusFilter(StatusOptions)}
                                                        className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 w-full text-left p-1 rounded hover:bg-indigo-50 transition-colors"
                                                    >
                                                        Select All
                                                    </button>
                                                    <button 
                                                        onClick={() => setStatusFilter([])}
                                                        className="text-[10px] font-bold text-slate-500 hover:text-slate-700 w-full text-right p-1 rounded hover:bg-slate-50 transition-colors"
                                                    >
                                                        Clear
                                                    </button>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* KPI Cards section */}
            <div className="bg-slate-50/50 border-b border-slate-200">
                <div className="w-full px-4 lg:px-8 py-4">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {[
                            { id: 'epics', label: 'Total Epics/Parents', icon: Layers, color: 'text-blue-600', bg: 'bg-blue-50', value: activeDashboardData.summaryMetrics.epics },
                            { id: 'points', label: 'Total Points', icon: Target, color: 'text-indigo-600', bg: 'bg-indigo-50', value: activeDashboardData.summaryMetrics.totalPoints },
                            { id: 'teams', label: 'Delivery Teams', icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50', value: activeDashboardData.summaryMetrics.teams },
                            { id: 'capacity', label: 'Capacity Util.', icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50', value: `${activeDashboardData.summaryMetrics.totalCapacity ? Math.round((activeDashboardData.summaryMetrics.totalPoints / activeDashboardData.summaryMetrics.totalCapacity) * 100) : 0}%` },
                            { id: 'risk', label: 'Risk Profile', icon: ShieldAlert, color: 'text-rose-600', bg: 'bg-rose-50', value: activeDashboardData.summaryMetrics.riskLevel }
                        ].map(metric => (
                            <button
                                key={metric.id}
                                onClick={() => setSelectedMetric(metric.id)}
                                className="group flex flex-col p-2.5 bg-white border border-slate-200 rounded-xl hover:shadow-md hover:border-blue-400 transition-all text-left active:scale-[0.98]"
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <div className={`p-1 rounded-lg ${metric.bg} ${metric.color}`}>
                                        <metric.icon className="w-4 h-4" />
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{metric.label}</span>
                                </div>
                                <div className="text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">{metric.value}</div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <main className="flex-1 w-full px-4 lg:px-8 py-8 transition-all duration-300">
                {activeTab === 'overview' && <OverviewTab dashboardData={activeDashboardData} aiInsights={aiInsights} />}
                {activeTab === 'timeline' && <TimelineTab dashboardData={activeDashboardData} />}
                {activeTab === 'multipiroadmap' && <MultiPITimelineTab dashboardData={activeDashboardData} selectedPIs={selectedPIs} setSelectedTicket={setSelectedTicket} />}
                {activeTab === 'board' && (
                    <ProgramBoardTab
                        dashboardData={activeDashboardData}
                        boardGroupBy={boardGroupBy}
                        setBoardGroupBy={setBoardGroupBy}
                        setIsKanbanSettingsOpen={setIsKanbanSettingsOpen}
                        showInitiativeSwimlanes={showInitiativeSwimlanes}
                        setShowInitiativeSwimlanes={setShowInitiativeSwimlanes}
                        zoomLevel={zoomLevel}
                        setZoomLevel={setZoomLevel}
                        dragOverCell={dragOverCell}
                        setDragOverCell={setDragOverCell}
                        handleDrop={handleDrop}
                        handleTeamChange={handleTeamChange}
                        setSelectedTicket={setSelectedTicket}
                        hoveredInitiative={hoveredInitiative}
                        setHoveredInitiative={setHoveredInitiative}
                        allAvailableTeams={allAvailableTeams}
                        programStyles={programStyles}
                    />
                )}
                {activeTab === 'teamload' && <TeamLoadTab dashboardData={activeDashboardData} />}
                {activeTab === 'hierarchy' && (
                    <HierarchyTab
                        dashboardData={activeDashboardData}
                        expandedNodes={expandedNodes}
                        toggleNode={toggleNode}
                        setExpandedNodes={setExpandedNodes}
                        setSelectedTicket={setSelectedTicket}
                        hoveredInitiative={hoveredInitiative}
                        setHoveredInitiative={setHoveredInitiative}
                        handleTeamChange={handleTeamChange}
                        allAvailableTeams={allAvailableTeams}
                    />
                )}
                {activeTab === 'updates' && <ChangeLogTab updateHistory={updateHistory} handleRevert={handleRevert} />}
                {activeTab === 'risks' && <RisksTab dashboardData={activeDashboardData} />}
            </main>

            {/* Modals */}
            {selectedMetric && (
                <SummaryKPIModal
                    selectedMetric={selectedMetric}
                    setSelectedMetric={setSelectedMetric}
                    dashboardData={activeDashboardData}
                    metricTitles={metricTitles}
                    getTeamColor={getTeamColor}
                />
            )}
            {selectedTicket && (
                <TicketDetailsModal
                    selectedTicket={selectedTicket}
                    setSelectedTicket={setSelectedTicket}
                />
            )}
            {isKanbanSettingsOpen && (
                <KanbanSettingsModal
                    isOpen={isKanbanSettingsOpen}
                    setIsOpen={setIsKanbanSettingsOpen}
                    dashboardData={dashboardData}
                    setDashboardData={setDashboardData}
                />
            )}
        </div>
    );
};

export default RcmPlan;
