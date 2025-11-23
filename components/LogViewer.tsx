import React, { useState, useMemo } from 'react';
import { LogEntry, LogLevel } from '../types';
import { Search, Filter } from 'lucide-react';

interface LogViewerProps {
  logs: LogEntry[];
}

const LogViewer: React.FC<LogViewerProps> = ({ logs }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState<LogLevel | 'ALL'>('ALL');

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesSearch = log.message.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLevel = levelFilter === 'ALL' || log.level === levelFilter;
      return matchesSearch && matchesLevel;
    });
  }, [logs, searchTerm, levelFilter]);

  const getLevelColor = (level: LogLevel) => {
    switch (level) {
      case LogLevel.ERROR: return 'text-red-400';
      case LogLevel.WARNING: return 'text-yellow-400';
      case LogLevel.SUCCESS: return 'text-green-400';
      case LogLevel.DEBUG: return 'text-gray-400';
      default: return 'text-blue-400';
    }
  };

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-lg flex flex-col h-[600px]">
      <div className="p-4 border-b border-slate-700 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <h2 className="text-lg font-semibold text-slate-100">Log Detalhado</h2>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar nos logs..."
              className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <select
              className="pl-9 pr-8 py-2 bg-slate-900 border border-slate-600 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-blue-500 appearance-none"
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value as LogLevel | 'ALL')}
            >
              <option value="ALL">Todos Níveis</option>
              <option value={LogLevel.INFO}>INFO</option>
              <option value={LogLevel.ERROR}>ERROR</option>
              <option value={LogLevel.WARNING}>WARNING</option>
              <option value={LogLevel.SUCCESS}>SUCCESS</option>
              <option value={LogLevel.DEBUG}>DEBUG</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-0 font-mono text-xs sm:text-sm">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-900 sticky top-0 z-10">
            <tr>
              <th className="p-3 border-b border-slate-700 text-slate-400 font-medium w-40">Timestamp</th>
              <th className="p-3 border-b border-slate-700 text-slate-400 font-medium w-24">Level</th>
              <th className="p-3 border-b border-slate-700 text-slate-400 font-medium">Message</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-700/50 border-b border-slate-800/50 transition-colors">
                <td className="p-2 px-3 text-slate-500 whitespace-nowrap">{log.timestamp}</td>
                <td className={`p-2 px-3 font-bold ${getLevelColor(log.level)}`}>{log.level}</td>
                <td className="p-2 px-3 text-slate-300 break-all">{log.message}</td>
              </tr>
            ))}
            {filteredLogs.length === 0 && (
              <tr>
                <td colSpan={3} className="p-8 text-center text-slate-500">
                  Nenhum log encontrado com os filtros atuais.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <div className="p-2 border-t border-slate-700 text-xs text-slate-500 text-right">
        Mostrando {filteredLogs.length} de {logs.length} linhas
      </div>
    </div>
  );
};

export default LogViewer;
