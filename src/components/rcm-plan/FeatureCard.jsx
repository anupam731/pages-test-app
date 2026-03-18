import React from 'react';
import { Folder, FileText } from 'lucide-react';
import { Card } from './ui-components';
import { getTeamColor, getStatusColor } from './utils';

export const FeatureCard = ({
    feature,
    zoomLevel,
    onClick,
    onMouseEnter,
    onMouseLeave,
    handleTeamChange,
    allAvailableTeams,
    teamAllocation,
    hoveredInitiative,
    setDragOverCell
}) => {
    const isHoveredGroup = hoveredInitiative && hoveredInitiative === feature.parentKey && feature.parentKey !== 'None';
    const isDimmed = hoveredInitiative && (!feature.parentKey || hoveredInitiative !== feature.parentKey);

    return (
        <Card
            key={feature.id}
            onClick={onClick}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            draggable={true}
            onDragStart={(e) => {
                e.dataTransfer.setData('text/plain', feature.id);
            }}
            onDragEnd={() => setDragOverCell(null)}
            className={`${zoomLevel === 1 ? 'p-1.5' : zoomLevel === 3 ? 'p-4' : 'p-3'} shadow-sm border border-slate-200 border-l-4 bg-white transition-all duration-200 cursor-grab active:cursor-grabbing ${isHoveredGroup
                ? 'ring-2 ring-indigo-500 shadow-lg scale-[1.02] z-10'
                : isDimmed
                    ? 'opacity-40 grayscale-[50%]'
                    : 'hover:shadow-md hover:ring-2 hover:ring-blue-300'
                }`}
            style={{ borderLeftColor: getTeamColor(feature.team, teamAllocation) }}
        >
            {zoomLevel === 1 && (
                <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-center gap-2">
                        <div className="flex items-center gap-1.5 truncate">
                            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${getStatusColor(feature.status)}`} title={feature.status} />
                            <span className="text-[10px] font-bold text-slate-700 truncate hover:text-blue-600">{feature.id}</span>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                            {feature.pi && <span className="text-[8.5px] font-bold text-slate-400 border border-slate-200 px-1 rounded-sm">{feature.pi}</span>}
                            <span className="text-[10px] font-bold text-slate-500">{feature.points}</span>
                        </div>
                    </div>
                    {feature.parentKey && feature.parentKey !== 'None' && (
                        <div className={`flex items-center gap-1 text-[8.5px] font-semibold truncate ${isHoveredGroup ? 'text-indigo-600 animate-pulse' : 'text-slate-400'}`} title={`Initiative: ${feature.parentKey}`}>
                            <Folder className="w-2.5 h-2.5" /> {feature.parentKey}
                        </div>
                    )}
                </div>
            )}

            {zoomLevel === 2 && (
                <>
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-slate-500 hover:text-blue-600">{feature.id}</span>
                                {feature.pi && <span className="text-[9px] font-bold text-slate-400 border border-slate-200 px-1 rounded-sm">{feature.pi}</span>}
                            </div>
                            <span className="text-[10px] font-semibold text-slate-400 truncate max-w-[100px]" title={feature.status}>{feature.status}</span>
                        </div>
                        <span className="text-xs bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded border border-blue-100 whitespace-nowrap">
                            {feature.points} pts
                        </span>
                    </div>
                    <p className="font-semibold text-slate-800 text-sm leading-snug mb-3">
                        {feature.title || feature.summary}
                    </p>
                    <div className="flex justify-between items-center mt-auto pt-2 border-t border-slate-100">
                        <select
                            value={feature.team}
                            onClick={(e) => e.stopPropagation()}
                            onMouseDown={(e) => e.stopPropagation()}
                            onChange={(e) => handleTeamChange(feature.id, e.target.value)}
                            className="text-[10px] font-bold uppercase tracking-wider text-white px-1.5 py-1 rounded flex-shrink-0 shadow-sm cursor-pointer outline-none border-r-4 border-transparent hover:ring-2 hover:ring-white/50 transition-all appearance-none text-center"
                            style={{ backgroundColor: getTeamColor(feature.team, teamAllocation) }}
                        >
                            {allAvailableTeams.map(t => <option key={t} value={t} className="text-slate-900 bg-white uppercase font-bold">{t}</option>)}
                        </select>
                        {feature.parentKey && feature.parentKey !== 'None' && (
                            <span className={`text-[9px] font-bold ml-2 truncate flex items-center gap-1 ${isHoveredGroup ? 'text-indigo-600 animate-pulse' : 'text-slate-400'}`} title={`Initiative: ${feature.parentKey}`}>
                                <Folder className="w-3 h-3" /> {feature.parentKey}
                            </span>
                        )}
                    </div>
                </>
            )}

            {zoomLevel === 3 && (
                <>
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-extrabold text-slate-700 hover:text-blue-600">{feature.id}</span>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200" title={feature.status}>{feature.status}</span>
                                {feature.pi && <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 border border-slate-200 px-1.5 py-0.5 rounded">{feature.pi}</span>}
                            </div>
                        </div>
                        <span className="text-sm bg-blue-50 text-blue-700 font-bold px-2.5 py-1 rounded-md border border-blue-200 whitespace-nowrap shadow-sm">
                            {feature.points} pts
                        </span>
                    </div>
                    <p className="font-bold text-slate-900 text-base leading-snug mb-2 mt-2">
                        {feature.title || feature.summary}
                    </p>
                    {feature.rawAttributes && feature.rawAttributes['Description'] && (
                        <p className="text-xs text-slate-500 line-clamp-3 mb-3 leading-relaxed">
                            {feature.rawAttributes['Description']}
                        </p>
                    )}
                    <div className="flex justify-between items-center mt-auto pt-3 border-t border-slate-100">
                        <select
                            value={feature.team}
                            onClick={(e) => e.stopPropagation()}
                            onMouseDown={(e) => e.stopPropagation()}
                            onChange={(e) => handleTeamChange(feature.id, e.target.value)}
                            className="text-[11px] font-bold uppercase tracking-wider text-white px-2 py-1 rounded flex-shrink-0 shadow-sm cursor-pointer outline-none border-r-4 border-transparent hover:ring-2 hover:ring-white/50 transition-all appearance-none text-center"
                            style={{ backgroundColor: getTeamColor(feature.team, teamAllocation) }}
                        >
                            {allAvailableTeams.map(t => <option key={t} value={t} className="text-slate-900 bg-white uppercase font-bold">{t}</option>)}
                        </select>
                        <div className="flex items-center gap-3 text-right">
                            <span className="text-[10px] text-slate-400 font-medium">Sprint: {feature.iteration}</span>
                            {feature.parentKey && feature.parentKey !== 'None' && (
                                <span className={`text-[10px] font-bold truncate flex items-center gap-1 ${isHoveredGroup ? 'text-indigo-600 animate-pulse' : 'text-slate-400'}`} title={`Initiative: ${feature.parentKey}`}>
                                    <Folder className="w-3.5 h-3.5" /> {feature.parentKey}
                                </span>
                            )}
                        </div>
                    </div>
                </>
            )}
        </Card>
    );
};
