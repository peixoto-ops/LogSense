import React from 'react';
import { Insight } from '../types';
import { AlertTriangle, CheckCircle, Info, AlertOctagon } from 'lucide-react';

interface InsightsPanelProps {
  insights: Insight[];
}

const InsightsPanel: React.FC<InsightsPanelProps> = ({ insights }) => {
  const getIcon = (type: Insight['type']) => {
    switch (type) {
      case 'critical': return <AlertOctagon className="w-5 h-5 text-red-400" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case 'success': return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'info': return <Info className="w-5 h-5 text-blue-400" />;
    }
  };

  const getBgColor = (type: Insight['type']) => {
    switch (type) {
      case 'critical': return 'bg-red-500/10 border-red-500/20';
      case 'warning': return 'bg-yellow-500/10 border-yellow-500/20';
      case 'success': return 'bg-green-500/10 border-green-500/20';
      case 'info': return 'bg-blue-500/10 border-blue-500/20';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      {insights.map((insight, idx) => (
        <div 
          key={idx} 
          className={`p-4 rounded-xl border ${getBgColor(insight.type)} flex gap-4 items-start transition-transform hover:scale-[1.01]`}
        >
          <div className="mt-1 shrink-0">{getIcon(insight.type)}</div>
          <div>
            <h4 className="font-semibold text-slate-100 mb-1">{insight.title}</h4>
            <p className="text-sm text-slate-400 leading-relaxed">{insight.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default InsightsPanel;
