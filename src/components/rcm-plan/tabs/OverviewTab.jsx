import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend, ComposedChart, CartesianGrid, XAxis, YAxis, Bar, Line } from 'recharts';
import { Users, Activity } from 'lucide-react';
import { Card, AIInsightBadge } from '../ui-components';

export const OverviewTab = ({ dashboardData, aiInsights }) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <Users className="w-5 h-5 text-slate-400" /> Work Allocation by Team
                    </h2>
                </div>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={dashboardData.teamAllocation} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value"
                            >
                                {dashboardData.teamAllocation.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <RechartsTooltip formatter={(value, name, props) => [`${value}% (${props.payload.points} pts)`, name]} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                            <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <AIInsightBadge text={aiInsights[1].text} />
            </Card>

            <Card className="p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <Activity className="w-5 h-5 text-slate-400" /> Load vs Capacity (Iterations)
                    </h2>
                </div>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={dashboardData.loadCapacityData} margin={{ top: 20, right: 20, bottom: 20, left: -20 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="iteration" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                            <RechartsTooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                            <Legend />
                            <Bar dataKey="load" name="Planned Load (Pts)" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={30} />
                            <Line type="monotone" dataKey="capacity" name="Team Capacity" stroke="#f43f5e" strokeWidth={2} dot={{ r: 4, fill: '#f43f5e' }} />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
                <AIInsightBadge text={aiInsights[0].text} />
            </Card>
        </div>
    );
};
