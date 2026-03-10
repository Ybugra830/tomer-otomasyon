import React from 'react';

export default function FormGroup({ label, children }) {
    return (
        <div className="flex flex-col space-y-1.5 w-full">
            <label className="text-sm font-semibold text-slate-700 tracking-wide">{label}</label>
            <div className="relative">
                {children}
            </div>
        </div>
    );
}
