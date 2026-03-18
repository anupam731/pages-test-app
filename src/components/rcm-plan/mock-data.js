const createMockAttributes = (id, title, status) => ({
    'Issue key': id,
    'Summary': title,
    'Status': status,
    'Description': 'Mock description detailing the technical work required for this feature. When you upload a real CSV, this modal will show all actual columns including Acceptance Criteria, Assignee, Fix Versions, etc.',
    'Priority': 'High',
    'Custom field (Feature Points)': '15'
});

export const initialData = {
    summaryMetrics: { totalPoints: 100, epics: 3, teams: 3, riskLevel: 'Medium', totalCapacity: 120 },
    teamAllocation: [
        { name: 'Nicole Pla', value: 40, color: '#3b82f6', points: 40 },
        { name: 'Casey Schru...', value: 35, color: '#f59e0b', points: 35 },
        { name: 'KLO', value: 25, color: '#10b981', points: 25 },
    ],
    loadCapacityData: [
        { iteration: 'Unassigned', load: 0, capacity: 0, description: 'Backlog' },
        { iteration: 'Iter 1', load: 15, capacity: 20, description: 'Foundations' },
        { iteration: 'Iter 2', load: 18, capacity: 20, description: 'Foundations' },
        { iteration: 'Iter 3', load: 20, capacity: 20, description: 'Foundations' },
        { iteration: 'Iter 4', load: 22, capacity: 20, description: 'Feature Peak' },
        { iteration: 'Iter 5', load: 15, capacity: 20, description: 'Optimization' },
        { iteration: 'Iter 6', load: 10, capacity: 20, description: 'Stability & Polish' },
    ],
    kanbanColumns: [
        { id: 'Funnel', title: 'Funnel', capacity: 0 },
        { id: 'Business Review', title: 'Business Review', capacity: 0 },
        { id: 'Arch Review', title: 'Arch Review', capacity: 0 },
        { id: 'Tech Review', title: 'Tech Review', capacity: 0 },
        { id: 'Prioritization', title: 'Prioritization', capacity: 0 },
        { id: 'TEAM PI-PLANNING', title: 'Team PI-Planning', capacity: 0 },
        { id: 'Ready for Implementation', title: 'Ready for Implementation', capacity: 0 },
        { id: 'In Progress', title: 'In Progress', capacity: 30 },
        { id: 'Pending Acceptance', title: 'Pending Acceptance', capacity: 0 },
        { id: 'Done', title: 'Done', capacity: 0 },
        { id: 'Closed', title: 'Closed', capacity: 0 }
    ],
    epicSequencing: [
        { id: 'AIMM-5340', title: 'Next-Gen Denial Assessment Optimization', team: 'Vajra', startIter: 1, endIter: 5, points: 25, color: '#3b82f6', status: 'In Progress' },
        { id: 'AIMM-5339', title: 'Global Payer & Plan ID Integration', team: 'Vajra', startIter: 2, endIter: 4, points: 15, color: '#3b82f6', status: 'Planned' },
        { id: 'AIMM-5374', title: 'Claims Appeal Hardening & KLO', team: 'Phoenix', startIter: 3, endIter: 6, points: 40, color: '#f59e0b', status: 'Planned' },
        { id: 'AIMM-53XX', title: 'Logging & DLT Standard Consumers', team: 'KLO', startIter: 1, endIter: 6, points: 20, color: '#10b981', status: 'Continuous' }
    ],
    programFeatures: [
        { id: 'AIMM-53XY', title: 'Dead Letter Topics & Alerts', team: 'Platform Team', member: 'KLO', program: 'KLO', iteration: 'Iter 1', points: 10, status: 'Done', parentKey: 'AIMM-5380', parentSummary: 'Logging & DLT Standard Consumers', parentDescription: 'Automated monitoring and alerting for dead letter topics.', rawAttributes: createMockAttributes('AIMM-53XY', 'Dead Letter Topics & Alerts', 'Done') },
        { id: 'AIMM-5341', title: 'Denial Assessment Hub Schema', team: 'Vajra', member: 'Nicole Pla', program: 'AI Denial Assessment', iteration: 'Iter 2', points: 10, status: 'Done', parentKey: 'AIMM-5340', parentSummary: 'Next-Gen Denial Assessment Optimization', parentDescription: 'Redesigning the hub schema for improved performance.', rawAttributes: createMockAttributes('AIMM-5341', 'Denial Assessment Hub Schema', 'Done') },
        { id: 'AIMM-5375', title: 'Timely Filing Templates Workflow', team: 'Phoenix', member: 'Casey Schru...', program: 'Claims_Appeal', iteration: 'Iter 3', points: 15, status: 'Planned', parentKey: 'AIMM-5374', parentSummary: 'Claims Appeal Hardening & KLO', parentDescription: 'Improving resilience of the claims appeal pipeline.', rawAttributes: createMockAttributes('AIMM-5375', 'Timely Filing Templates Workflow', 'Planned') },
        { id: 'AIMM-53XX', title: 'Logging Standard Consumers', team: 'Platform Team', member: 'KLO', program: 'KLO', iteration: 'Iter 3', points: 10, status: 'To Do', parentKey: 'AIMM-5380', parentSummary: 'Logging & DLT Standard Consumers', parentDescription: 'Automated monitoring and alerting for dead letter topics.', rawAttributes: createMockAttributes('AIMM-53XX', 'Logging Standard Consumers', 'To Do') },
        { id: 'AIMM-5339', title: 'Global Payer & Plan ID Integration', team: 'Vajra', member: 'Nicole Pla', program: 'AI Denial Assessment', iteration: 'Iter 4', points: 15, status: 'Planned', parentKey: 'AIMM-5340', parentSummary: 'Next-Gen Denial Assessment Optimization', parentDescription: 'Redesigning the hub schema for improved performance.', rawAttributes: createMockAttributes('AIMM-5339', 'Global Payer & Plan ID Integration', 'Planned') },
        { id: 'AIMM-5377', title: 'Billing platform supports onboarding', team: 'Phoenix', member: 'Casey Schru...', program: 'Claims_Appeal', iteration: 'Iter 6', points: 5, status: 'To Do', parentKey: 'AIMM-5374', parentSummary: 'Claims Appeal Hardening & KLO', parentDescription: 'Improving resilience of the claims appeal pipeline.', rawAttributes: createMockAttributes('AIMM-5377', 'Billing platform supports onboarding', 'To Do') },
    ],
    hierarchyData: [
        {
            id: 'prog-1', name: 'AI Denial Assessment', type: 'Program', color: 'text-blue-600', bg: 'bg-blue-50',
            description: 'Focuses on using machine learning to automate the denial assessment process and improve efficiency.',
            initiatives: [
                {
                    id: 'AIMM-5340', name: 'Next-Gen Denial Assessment Optimization',
                    description: 'Optimizing denial assessment workflows using advanced AI models to reduce manual review by 30%.',
                    features: [
                        { id: 'AIMM-5339', summary: 'Global Payer & Plan ID Integration for Denial Assessment', team: 'Vajra', member: 'Nicole Pla', iteration: 'Iter 4', points: 15, program: 'AI Denial Assessment', status: 'Planned', parentKey: 'AIMM-5340', rawAttributes: createMockAttributes('AIMM-5339', 'Global Payer & Plan ID Integration for Denial Assessment', 'Planned') },
                        { id: 'AIMM-5341', summary: 'Denial Assessment Hub Schema', team: 'Vajra', member: 'Nicole Pla', iteration: 'Iter 2', points: 10, program: 'AI Denial Assessment', status: 'Done', parentKey: 'AIMM-5340', rawAttributes: createMockAttributes('AIMM-5341', 'Denial Assessment Hub Schema', 'Done') }
                    ]
                }
            ]
        },
        {
            id: 'prog-2', name: 'Claims_Appeal', type: 'Program', color: 'text-amber-600', bg: 'bg-amber-50',
            description: 'Aims to streamline the claims appeal workflow and ensure timely filing with automated templates.',
            initiatives: [
                {
                    id: 'AIMM-5374', name: 'Claims Appeal Hardening & KLO',
                    description: 'Strengthening the claims appeal process with improved templates and automated validation.',
                    features: [
                        { id: 'AIMM-5375', summary: 'Timely Filing Templates Workflow', team: 'Phoenix', member: 'Casey Schru...', iteration: 'Iter 3', points: 15, program: 'Claims_Appeal', status: 'Planned', parentKey: 'AIMM-5374', rawAttributes: createMockAttributes('AIMM-5375', 'Timely Filing Templates Workflow', 'Planned') },
                        { id: 'AIMM-5377', summary: 'Billing platform supports onboarding and registration', team: 'Phoenix', member: 'Casey Schru...', iteration: 'Iter 6', points: 5, program: 'Claims_Appeal', status: 'To Do', parentKey: 'AIMM-5374', rawAttributes: createMockAttributes('AIMM-5377', 'Billing platform supports onboarding and registration', 'To Do') }
                    ]
                }
            ]
        },
        {
            id: 'prog-3', name: 'KLO', type: 'Program', color: 'text-emerald-600', bg: 'bg-emerald-50',
            description: 'Covers essential maintenance, platform stability, and standard observability consumers.',
            initiatives: [
                {
                    id: 'AIMM-5380', name: 'Platform Stability & Observability',
                    description: 'Standardizing logging and dead-letter topic handling across all AI platform services.',
                    features: [
                        { id: 'AIMM-53XY', summary: 'Dead Letter Topics & Alerts', team: 'Platform Team', member: 'KLO', iteration: 'Iter 1', points: 10, program: 'KLO', status: 'Done', parentKey: 'AIMM-5380', rawAttributes: createMockAttributes('AIMM-53XY', 'Dead Letter Topics & Alerts', 'Done') },
                        { id: 'AIMM-53XX', summary: 'Logging Standard Consumers', team: 'Platform Team', member: 'KLO', iteration: 'Iter 3', points: 10, program: 'KLO', status: 'To Do', parentKey: 'AIMM-5380', rawAttributes: createMockAttributes('AIMM-53XX', 'Logging Standard Consumers', 'To Do') }
                    ]
                }
            ]
        }
    ],
    risks: [
        { id: 1, type: 'Dependency', title: 'Global Payer/Plan ID Schemas', description: 'Success relies on stability of schema updates from external value streams.', level: 'High' },
        { id: 2, type: 'Scope', title: 'Adoption Feedback Pivot', description: 'EMA/Billing Service changes may require pivoting if high-severity bugs emerge.', level: 'Medium' },
        { id: 3, type: 'Tech Debt', title: 'Standardization Effort', description: 'Kafka/Logging standardization are high-effort and must not block features.', level: 'Medium' }
    ]
};

export const aiInsights = [
    { category: 'Load', text: "Iteration 4 is currently over capacity. Consider shifting testing tasks to Iteration 5 to level the load." },
    { category: 'Strategy', text: "A high percentage of capacity is dedicated to tech debt and hardening, aligning with 'Operational Scale' objectives." },
    { category: 'Delivery', text: "Some teams are heavily front-loaded. Ensure dependencies are resolved early to prevent blockers." },
    { category: 'Buffer', text: "Later iterations show a drop in planned points, providing a healthy buffer for bugs and feedback." }
];

export const programStyles = {
    'AI Denial Assessment': 'border-l-4 border-l-blue-500',
    'Claims_Appeal': 'border-l-4 border-l-amber-500',
    'KLO': 'border-l-4 border-l-emerald-500',
    'Default': 'border-l-4 border-l-slate-400'
};

export const TEAM_COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899', '#06b6d4'];
export const iterationsList = ['Iter 1', 'Iter 2', 'Iter 3', 'Iter 4', 'Iter 5', 'Iter 6'];

export const metricTitles = {
    epics: 'Total Epics / Initiatives',
    points: 'Total Point Load',
    teams: 'Participating Teams',
    capacity: 'Capacity Utilization',
    risk: 'Strategic Risk Profile'
};
