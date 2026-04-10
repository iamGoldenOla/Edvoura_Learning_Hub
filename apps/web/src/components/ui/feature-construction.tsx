import React from 'react';

interface Props {
  title: string;
  description?: string;
  icon?: string;
}

export function FeatureConstruction({ title, description, icon = '🚧' }: Props) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center animate-in zoom-in-95 duration-500">
      <div className="relative mb-8 group">
        <div className="absolute inset-0 bg-edvoura-gold/20 blur-2xl rounded-full scale-150 group-hover:scale-175 transition-transform duration-1000"></div>
        <div className="w-32 h-32 bg-white rounded-3xl border-2 border-slate-200 shadow-xl flex items-center justify-center text-6xl relative z-10 rotate-3 group-hover:rotate-6 transition-transform">
          {icon}
        </div>
        <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-edvoura-navy rounded-full border-4 border-white flex items-center justify-center text-white shadow-md z-20 animate-spin" style={{ animationDuration: '4s' }}>
          ⚙️
        </div>
      </div>
      
      <span className="bg-slate-100 text-slate-500 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-4">
        Under Development
      </span>
      
      <h1 className="text-4xl font-black text-edvoura-navy mb-4 tracking-tight">
        {title}
      </h1>
      
      <p className="text-slate-500 text-lg max-w-lg mb-8">
        {description || `The ${title} module is currently being built by our engineering team. It will be available in the upcoming platform release phase.`}
      </p>

      <button className="bg-edvoura-navy text-white font-bold py-3 px-8 rounded-xl hover:bg-slate-800 transition-colors shadow-md hover:shadow-lg">
        Notify Me When Live
      </button>

      <div className="mt-12 w-full max-w-md bg-slate-100 h-2 rounded-full overflow-hidden">
        <div className="h-full bg-edvoura-gold w-1/3 animate-pulse"></div>
      </div>
      <p className="text-xs text-slate-400 mt-2 font-medium">Scaffolding architecture...</p>
    </div>
  );
}
