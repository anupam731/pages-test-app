// Robust CSV Parser handling embedded quotes and newlines accurately
export const parseCSV = (str) => {
    const rows = [];
    let row = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < str.length; i++) {
        let char = str[i];
        let nextChar = str[i + 1];

        if (inQuotes) {
            if (char === '"' && nextChar === '"') {
                current += '"';
                i++; // Skip escaped quote
            } else if (char === '"') {
                inQuotes = false;
            } else {
                current += char;
            }
        } else {
            if (char === '"') {
                inQuotes = true;
            } else if (char === ',') {
                row.push(current);
                current = '';
            } else if (char === '\n' || (char === '\r' && nextChar === '\n')) {
                if (char === '\r') i++;
                row.push(current);
                rows.push(row);
                row = [];
                current = '';
            } else if (char === '\r') {
                row.push(current);
                rows.push(row);
                row = [];
                current = '';
            } else {
                current += char;
            }
        }
    }

    row.push(current);
    rows.push(row);

    // Filter out empty rows
    return rows.filter(r => r.some(cell => cell && cell.trim() !== ''));
};

// Extractor helper with advanced cleanup
export const getColIdx = (headerRow, possibleNames) => {
    if (!headerRow) return -1;
    const cleanHeaders = headerRow.map(h => (h || '').replace(/^\uFEFF/, '').replace(/^["']|["']$/g, '').trim().toLowerCase());

    for (let name of possibleNames) {
        const target = name.toLowerCase();
        const idx = cleanHeaders.findIndex(h => h === target);
        if (idx !== -1) return idx;
    }
    for (let name of possibleNames) {
        const target = name.toLowerCase();
        const idx = cleanHeaders.findIndex(h => h.includes(target));
        if (idx !== -1) return idx;
    }
    return -1;
};

// Helper to map team names to their assigned colors
export const getTeamColor = (teamName, teamAllocations) => {
    const team = (teamAllocations || []).find(t => t.name === teamName);
    if (team) return team.color;
    const partial = teamName ? (teamAllocations || []).find(t => teamName.includes(t.name)) : null;
    return partial ? partial.color : '#94a3b8'; // default slate-400
};

// Status color helper for compact view dot
export const getStatusColor = (status) => {
    const s = (status || '').toLowerCase();
    if (['done', 'closed', 'resolved', 'complete'].includes(s)) return 'bg-emerald-500';
    if (['in progress', 'active', 'doing'].includes(s)) return 'bg-blue-500';
    return 'bg-slate-300';
};

// Initiative progress calculation helper
export const getInitProgress = (initiative) => {
    if (!initiative || !initiative.features || initiative.features.length === 0) return 0;
    const donePoints = initiative.features
        .filter(f => ['done', 'closed', 'resolved', 'complete'].includes((f.status || '').toLowerCase()))
        .reduce((sum, f) => sum + (f.points || 0), 0);
    const totalPoints = initiative.features.reduce((sum, f) => sum + (f.points || 0), 0);
    return totalPoints > 0 ? Math.round((donePoints / totalPoints) * 100) : 0;
};

// Main data aggregation function that derives dashboard stats from raw features
export const aggregateBoardData = (features, kanbanColumns = []) => {
    if (!features || !Array.isArray(features)) return {};

    const summaryMetrics = {
        totalFeatures: features.length,
        totalPoints: features.reduce((sum, f) => sum + (f.points || 0), 0),
        totalDonePoints: features
            .filter(f => ['done', 'closed', 'resolved', 'complete'].includes((f.status || '').toLowerCase()))
            .reduce((sum, f) => sum + (f.points || 0), 0),
        teams: new Set(features.map(f => f.team)).size,
        epics: new Set(features.map(f => f.parentKey).filter(k => k && k !== 'None')).size,
        riskLevel: 'Medium', // Default or derived
        totalCapacity: 500 // Shared capacity or derived
    };

    summaryMetrics.completionRate = summaryMetrics.totalPoints > 0
        ? Math.round((summaryMetrics.totalDonePoints / summaryMetrics.totalPoints) * 100)
        : 0;

    // Team Allocation
    const TEAM_COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899', '#06b6d4'];
    const teamMap = {};
    features.forEach(f => {
        if (!teamMap[f.team]) teamMap[f.team] = { name: f.team, points: 0 };
        teamMap[f.team].points += (f.points || 0);
    });
    const teamAllocation = Object.values(teamMap).map((t, i) => ({
        ...t,
        color: TEAM_COLORS[i % TEAM_COLORS.length],
        value: summaryMetrics.totalPoints > 0 ? Math.round((t.points / summaryMetrics.totalPoints) * 100) : 0
    }));

    // Load vs Capacity by Iteration
    const iterMap = {};
    features.forEach(f => {
        const iter = f.iteration || 'Unassigned';
        if (!iterMap[iter]) iterMap[iter] = { iteration: iter, load: 0, capacity: 60, description: 'Iteration Focus' };
        iterMap[iter].load += (f.points || 0);
    });
    const loadCapacityData = Object.values(iterMap).sort((a, b) => a.iteration.localeCompare(b.iteration));

    // Epic Sequencing (Timeline)
    const epicMap = {};
    features.forEach(f => {
        if (!f.parentKey || f.parentKey === 'None') return;
        if (!epicMap[f.parentKey]) {
            epicMap[f.parentKey] = {
                id: f.parentKey,
                title: f.parentKey,
                team: f.team,
                points: 0,
                startIter: 10,
                endIter: 0,
                status: 'Planned'
            };
        }
        const epic = epicMap[f.parentKey];
        epic.points += (f.points || 0);
        const iterNum = parseInt(f.iteration?.match(/\d+/)?.[0] || '1');
        epic.startIter = Math.min(epic.startIter, iterNum);
        epic.endIter = Math.max(epic.endIter, iterNum);
    });
    const epicSequencing = Object.values(epicMap);

    // Multi-PI Data
    const allPIs = new Set();
    features.forEach(f => { if (f.pi) allPIs.add(f.pi); });
    const sortedPIs = Array.from(allPIs).sort();

    // Hierarchy Data (Tree View)
    const summaryMap = {};
    const statusMap = {};
    features.forEach(f => { 
        if (f.id) {
            summaryMap[f.id] = f.summary; 
            statusMap[f.id] = f.status;
        }
    });

    const progMap = {};
    features.forEach(f => {
        const pName = f.program || 'Other';
        if (!progMap[pName]) {
            progMap[pName] = {
                id: `prog-${pName}`,
                name: pName,
                initiatives: {},
                startIter: 10,
                endIter: 0,
                piStart: '',
                piEnd: '',
                allPIs: new Set(),
                totalPoints: 0,
                teams: new Set()
            };
        }
        const pObj = progMap[pName];
        const iKey = f.parentKey && f.parentKey !== 'None' ? f.parentKey : 'Independent Features';

        if (!pObj.initiatives[iKey]) {
            pObj.initiatives[iKey] = {
                id: iKey,
                name: summaryMap[iKey] || f.parentSummary || iKey,
                status: statusMap[iKey] || '',
                description: f.parentDescription || (f.parentSummary ? '' : ''),
                features: [],
                startIter: 10,
                endIter: 0,
                piStart: '',
                piEnd: '',
                allPIs: new Set(),
                totalPoints: 0,
                teams: new Set()
            };
        } else {
            const resolvedName = summaryMap[iKey] || f.parentSummary;
            if (resolvedName && pObj.initiatives[iKey].name === iKey) {
                pObj.initiatives[iKey].name = resolvedName;
            }
            const resolvedStatus = statusMap[iKey];
            if (resolvedStatus && !pObj.initiatives[iKey].status) {
                pObj.initiatives[iKey].status = resolvedStatus;
            }
            if (f.parentDescription && !pObj.initiatives[iKey].description) {
                pObj.initiatives[iKey].description = f.parentDescription;
            }
        }

        const iterNum = parseInt(f.iteration?.match(/\d+/)?.[0] || '1');
        const feat = { ...f, iterNum };

        // Update Initiative metadata
        const init = pObj.initiatives[iKey];
        init.features.push(feat);
        init.startIter = Math.min(init.startIter, iterNum);
        init.endIter = Math.max(init.endIter, iterNum);
        if (f.pi) {
            init.allPIs.add(f.pi);
            if (!init.piStart || f.pi < init.piStart) init.piStart = f.pi;
            if (!init.piEnd || f.pi > init.piEnd) init.piEnd = f.pi;
        }
        init.totalPoints += (f.points || 0);
        if (f.team) init.teams.add(f.team);

        // Update Program metadata
        pObj.startIter = Math.min(pObj.startIter, iterNum);
        pObj.endIter = Math.max(pObj.endIter, iterNum);
        if (f.pi) {
            pObj.allPIs.add(f.pi);
            if (!pObj.piStart || f.pi < pObj.piStart) pObj.piStart = f.pi;
            if (!pObj.piEnd || f.pi > pObj.piEnd) pObj.piEnd = f.pi;
        }
        pObj.totalPoints += (f.points || 0);
        if (f.team) pObj.teams.add(f.team);
    });

    const hierarchyData = Object.values(progMap).map(p => ({
        ...p,
        teams: Array.from(p.teams),
        allPIs: Array.from(p.allPIs),
        initiatives: Object.values(p.initiatives).map(i => ({
            ...i,
            teams: Array.from(i.teams),
            allPIs: Array.from(i.allPIs)
        }))
    }));

    return {
        summaryMetrics,
        teamAllocation,
        loadCapacityData,
        epicSequencing,
        hierarchyData,
        allPIs: sortedPIs
    };
};
