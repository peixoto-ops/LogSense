import React from 'react';
import { LogGroup } from '../types';
import { Folder, Clock, FileText, AlertCircle, Check } from 'lucide-react';

interface ClusterViewProps {
  groups: LogGroup[];
}

const ClusterView: React.FC<ClusterViewProps> = ({ groups }) => {
  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-lg p-6">
      <h2 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
        <Folder className="w-5 h-5 text-blue-400" />
        Grupos de Processamento (Clusterização)
      </h2>
      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
        {groups.map((group, idx) => (
          <div 
            key={idx}
            className="p-4 rounded-lg bg-slate-900/50 border border-slate-700 hover:border-slate-600 transition-colors"
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-medium text-slate-200 truncate max-w-[70%] text-sm" title={group.name}>
                {group.name}
              </h3>
              <span className={`text-xs px-2 py-1 rounded-full border flex items-center gap-1 ${
                group.status === 'error' 
                  ? 'bg-red-500/10 text-red-400 border-red-500/20' 
                  : 'bg-green-500/10 text-green-400 border-green-500/20'
              }`}>
                {group.status === 'error' ? <AlertCircle className="w-3 h-3" /> : <Check className="w-3 h-3" />}
                {group.status.toUpperCase()}
              </span>
            </div>
            
            <div className="flex gap-4 text-xs text-slate-400">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {(group.durationMs / 1000).toFixed(1)}s
              </div>
              <div className="flex items-center gap-1">
                <FileText className="w-3 h-3" />
                {group.fileCount} arquivos
              </div>
              <div className="flex items-center gap-1">
                Logs: {group.entries.length}
              </div>
            </div>
          </div>
        ))}
        {groups.length === 0 && (
          <div className="text-slate-500 text-center py-8">
            Nenhum grupo de processamento identificado.
          </div>
        )}
      </div>
    </div>
  );
};

export default ClusterView;
