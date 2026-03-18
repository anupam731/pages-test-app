import React from 'react';
import { Info } from 'lucide-react';
import { Card } from '../ui-components';

export const RisksTab = ({ dashboardData }) => {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {dashboardData.risks.map(risk => (
                    <Card key={risk.id} className="p-5 flex flex-col h-full border-t-4 border-t-rose-500">
                        <div className="flex justify-between items-start mb-3">
                            <span className="text-xs font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-1 rounded">{risk.level} Risk</span>
                            <span className="text-xs font-medium text-slate-500">{risk.type}</span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">{risk.title}</h3>
                        <p className="text-sm text-slate-600 flex-grow">{risk.description}</p>
                        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 text-sm text-slate-500">
                            <Info className="w-4 h-4" /> Needs active monitoring
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};
