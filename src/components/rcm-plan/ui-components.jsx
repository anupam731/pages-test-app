import React from 'react';
import { BrainCircuit } from 'lucide-react';

export const Card = ({ children, className = '', onClick, style, onMouseEnter, onMouseLeave, draggable, onDragStart, onDragEnd }) => (
    <div
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        draggable={draggable}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        className={`bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden ${className}`}
        style={style}
    >
        {children}
    </div>
);

export const AIInsightBadge = ({ text }) => (
    <div className="flex items-start space-x-2 bg-indigo-50 text-indigo-800 p-3 rounded-lg border border-indigo-100 text-sm mt-4">
        <BrainCircuit className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
        <p><strong className="font-semibold text-indigo-900">AI Insight:</strong> {text}</p>
    </div>
);
