import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users } from 'lucide-react';
import { Card } from '../ui-components';
import { getTeamColor } from '../utils';

export const TeamLoadTab = ({ dashboardData }) => {
    const allIters = dashboardData.loadCapacityData.map(d => d.iteration);
    const allTeams = Array.from(new Set(dashboardData.programFeatures.map(f => f.team))).filter(t => t !== 'Unassigned').sort();

    // Prepare data for Recharts Stacked Bar Chart
    const chartData = allIters.map(iter => {
        const dataPoint = { name: iter };
        allTeams.forEach(team => {
            dataPoint[team] = dashboardData.programFeatures
                .filter(f => f.iteration === iter && f.team === team)
                .reduce((sum, f) => sum + f.points, 0);
        });
        return dataPoint;
    });

    // Group features by team and then by member for the progress section
    const teamGroups = allTeams.map(teamName => {
        const teamFeatures = dashboardData.programFeatures.filter(f => f.team === teamName);
        const totalPoints = teamFeatures.reduce((sum, f) => sum + (f.points || 0), 0);
        const donePoints = teamFeatures
            .filter(f => ['done', 'closed', 'resolved', 'complete'].includes((f.status || '').toLowerCase()))
            .reduce((sum, f) => sum + (f.points || 0), 0);

        // Group members within the team
        const membersMap = {};
        teamFeatures.forEach(f => {
            const mName = f.member || f.assignee || f.team; // Fallback chain
            if (!membersMap[mName]) {
                membersMap[mName] = { name: mName, totalPoints: 0, donePoints: 0 };
            }
            membersMap[mName].totalPoints += (f.points || 0);
            if (['done', 'closed', 'resolved', 'complete'].includes((f.status || '').toLowerCase())) {
                membersMap[mName].donePoints += (f.points || 0);
            }
        });

        return {
            name: teamName,
            totalPoints,
            donePoints,
            members: Object.values(membersMap)
        };
    });

    return (
        <div className="space-y-6">
            <Card className="p-6">
                <h2 className="text-lg font-bold flex items-center gap-2 mb-6 text-slate-800">
                    <Users className="w-5 h-5 text-indigo-500" /> Team & Member Delivery Progress
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {teamGroups.map(team => {
                        const teamProgress = team.totalPoints > 0 ? Math.round((team.donePoints / team.totalPoints) * 100) : 0;
                        return (
                            <div key={team.name} className="flex flex-col p-4 bg-slate-50 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                {/* TEAM LEVEL HEADER */}
                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-sm font-black text-slate-800 flex items-center gap-2 truncate pr-2">
                                        <div className="w-2 h-4 rounded-sm bg-indigo-500"></div>
                                        {team.name}
                                    </span>
                                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 shadow-sm">{teamProgress}% Done</span>
                                </div>
                                <div className="w-full bg-slate-200 rounded-full h-2.5 mb-4 overflow-hidden flex border border-slate-300 shadow-inner">
                                    <div className="bg-gradient-to-r from-emerald-400 to-emerald-500 h-2.5 transition-all duration-700 shadow-[0_0_10px_rgba(16,185,129,0.3)]" style={{ width: `${teamProgress}%` }}></div>
                                </div>

                                {/* MEMBER LEVEL LIST */}
                                <div className="flex flex-col gap-3.5 ml-1 pl-3.5 border-l-2 border-slate-200 mt-2">
                                    {team.members.map(member => {
                                        const totalCapData = dashboardData.teamAllocation.find(t => t.name === member.name) ||
                                            (dashboardData.teamAllocation.find(t => member.name.includes(t.name)));
                                        const globalLoad = totalCapData?.points || member.totalPoints;
                                        const numTeams = dashboardData.teamAllocation.length || 1;
                                        const globalCap = Math.max(40, Math.round((dashboardData.summaryMetrics.totalCapacity || 120) / numTeams));
                                        const isOver = globalLoad > globalCap;
                                        const loadPercentage = Math.min(100, Math.round((globalLoad / globalCap) * 100));

                                        return (
                                            <div key={member.name} className="flex flex-col gap-1.5 group">
                                                <div className="flex justify-between items-center text-[11px]">
                                                    <span className="font-bold flex items-center gap-2 text-slate-600 group-hover:text-slate-900 transition-colors">
                                                        <div className="w-2 h-2 rounded-full shadow-sm" style={{ backgroundColor: getTeamColor(member.name, dashboardData.teamAllocation) }}></div>
                                                        <span className="truncate max-w-[120px]" title={member.name}>{member.name}</span>
                                                    </span>
                                                    <div className="flex items-center gap-1.5">
                                                        <span className={`font-black whitespace-nowrap ${isOver ? 'text-rose-600' : 'text-slate-500'}`}>
                                                            {globalLoad} pts
                                                        </span>
                                                        <span className="text-[9px] text-slate-400">/ {globalCap} cap</span>
                                                    </div>
                                                </div>
                                                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden flex shadow-inner">
                                                    <div
                                                        className={`h-1.5 transition-all duration-700`}
                                                        style={{ width: `${loadPercentage}%`, backgroundColor: isOver ? '#f43f5e' : getTeamColor(member.name, dashboardData.teamAllocation) }}
                                                    ></div>
                                                </div>
                                                {member.totalPoints > 0 && (
                                                    <div className="text-[9px] text-slate-400 text-right leading-none mt-0.5 font-bold italic tracking-tight">
                                                        {member.totalPoints} pts assigned in this program
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Card>

            <Card className="p-6">
                <h2 className="text-lg font-bold flex items-center gap-2 mb-6 text-slate-800">
                    <Users className="w-5 h-5 text-slate-500" /> Team Load by Iteration
                </h2>

                {/* Stacked Bar Chart */}
                <div className="h-80 w-full mb-8 bg-slate-50/50 rounded-xl p-4 border border-slate-100">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                            <RechartsTooltip
                                cursor={{ fill: '#f1f5f9' }}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Legend wrapperStyle={{ paddingTop: '20px' }} />
                            {allTeams.map(team => (
                                <Bar key={team} dataKey={team} stackId="a" fill={getTeamColor(team, dashboardData.teamAllocation)} />
                            ))}
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Data Table */}
                <div className="overflow-auto custom-scrollbar max-h-[60vh] border border-slate-200 rounded-lg">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase sticky top-0 z-20 shadow-[0_1px_0_0_#e2e8f0]">
                            <tr>
                                <th className="px-4 py-4 font-bold tracking-wider bg-slate-50">Delivery Team</th>
                                {allIters.map(iter => (
                                    <th key={iter} className="px-4 py-4 text-center font-bold tracking-wider border-l border-slate-200 bg-slate-50">{iter}</th>
                                ))}
                                <th className="px-4 py-4 text-center font-extrabold text-slate-700 bg-slate-100 border-l border-slate-300">Total Points</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allTeams.map(team => {
                                const totalTeamPoints = dashboardData.programFeatures.filter(f => f.team === team).reduce((sum, f) => sum + f.points, 0);
                                return (
                                    <tr key={team} className="bg-white border-b border-slate-100 hover:bg-slate-50/80 transition-colors last:border-b-0">
                                        <td className="px-4 py-3 font-semibold text-slate-800 flex items-center gap-2.5">
                                            <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: getTeamColor(team, dashboardData.teamAllocation) }}></div>
                                            {team}
                                        </td>
                                        {allIters.map(iter => {
                                            const pts = dashboardData.programFeatures
                                                .filter(f => f.iteration === iter && f.team === team)
                                                .reduce((sum, f) => sum + f.points, 0);
                                            return (
                                                <td key={iter} className="px-4 py-3 text-center border-l border-slate-100 text-slate-600 font-medium">
                                                    {pts > 0 ? (
                                                        <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-bold border border-blue-100">{pts}</span>
                                                    ) : (
                                                        <span className="text-slate-300 font-normal">-</span>
                                                    )}
                                                </td>
                                            );
                                        })}
                                        <td className="px-4 py-3 text-center font-extrabold text-indigo-700 bg-indigo-50/30 border-l border-slate-200">
                                            {totalTeamPoints}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};
