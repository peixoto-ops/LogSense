import React, { useState, useEffect } from 'react';
import { parseLogs, calculateStats, clusterGroups, generateInsights } from './services/logParser';
import { LogEntry, LogStats, LogGroup, Insight } from './types';
import LogChart from './components/LogChart';
import LogViewer from './components/LogViewer';
import InsightsPanel from './components/InsightsPanel';
import ClusterView from './components/ClusterView';
import { Upload, BarChart2, Activity, AlertTriangle, FileText } from 'lucide-react';

// Placeholder data from prompt for initial state
const INITIAL_LOG_DATA = `[2025-11-13 04:51:08] [ERROR] Erro na linha 34 (código: 1): 
[2025-11-13 04:51:08] [INFO] Limpando arquivos temporários...
[2025-11-13 04:51:08] [INFO] Limpeza concluída
[2025-11-13 04:51:08] [INFO] Iniciando processamento do grupo: identidade_comprovante_residência_josé_campos
[2025-11-13 04:51:08] [INFO] Processando arquivo no grupo: ./processamento/CCF21082025_00001.pdf
[2025-11-13 04:51:08] [DEBUG] Tamanho do arquivo: 680K
[2025-11-13 04:51:11] [SUCCESS] Imagem convertida para PDF com sucesso
[2025-11-13 04:51:22] [SUCCESS] Grupo processado e movido para saída
`;

const App: React.FC = () => {
  const [rawLog, setRawLog] = useState<string>('');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [stats, setStats] = useState<LogStats | null>(null);
  const [groups, setGroups] = useState<LogGroup[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // Initial load
  useEffect(() => {
    // Note: In a real scenario, we might not load initial data, 
    // but for the demo, we won't auto-load the giant string to keep the file clean.
    // The user can paste it.
  }, []);

  const processLogContent = (content: string) => {
    const parsed = parseLogs(content);
    const calculatedStats = calculateStats(parsed);
    const clustered = clusterGroups(parsed);
    const generatedInsights = generateInsights(calculatedStats, clustered, parsed);

    setLogs(parsed);
    setStats(calculatedStats);
    setGroups(clustered);
    setInsights(generatedInsights);
    setRawLog(content);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      processLogContent(content);
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        processLogContent(content);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 p-4 sm:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-700 pb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-100 tracking-tight">
              Protocolo <span className="text-blue-500">Dashboard</span>
            </h1>
            <p className="text-slate-400 mt-1">Análise estatística e forense de logs de execução.</p>
          </div>
          
          <div className="flex gap-4 w-full md:w-auto">
             <label 
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-dashed cursor-pointer transition-all
                ${isDragging ? 'border-blue-500 bg-blue-500/10' : 'border-slate-600 hover:border-slate-400 hover:bg-slate-800'}
              `}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Upload className="w-4 h-4" />
              <span className="text-sm font-medium">Carregar Log (.txt/.log)</span>
              <input type="file" accept=".txt,.log,.md" className="hidden" onChange={handleFileUpload} />
            </label>
          </div>
        </header>

        {!stats ? (
          <div className="flex flex-col items-center justify-center h-96 border-2 border-dashed border-slate-700 rounded-2xl bg-slate-800/30 text-slate-500">
            <FileText className="w-12 h-12 mb-4 opacity-50" />
            <p className="text-lg font-medium">Nenhum log carregado</p>
            <p className="text-sm">Cole o conteúdo ou arraste um arquivo para começar a análise.</p>
            <textarea 
              className="mt-6 w-3/4 h-32 bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs font-mono focus:outline-none focus:border-blue-500"
              placeholder="Ou cole o texto do log aqui..."
              onChange={(e) => processLogContent(e.target.value)}
            ></textarea>
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-sm">
                <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
                  <FileText className="w-4 h-4" /> Total de Linhas
                </div>
                <div className="text-2xl font-bold text-slate-100">{stats.totalLogs.toLocaleString()}</div>
              </div>
              <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-sm">
                <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
                  <AlertTriangle className="w-4 h-4 text-red-400" /> Erros
                </div>
                <div className="text-2xl font-bold text-red-400">{stats.levelCounts.ERROR}</div>
              </div>
              <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-sm">
                <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
                  <Activity className="w-4 h-4 text-green-400" /> Taxa de Sucesso
                </div>
                <div className="text-2xl font-bold text-green-400">
                  {((1 - stats.errorRate) * 100).toFixed(1)}%
                </div>
              </div>
              <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-sm">
                <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
                  <BarChart2 className="w-4 h-4 text-blue-400" /> Grupos
                </div>
                <div className="text-2xl font-bold text-blue-400">{groups.length}</div>
              </div>
            </div>

            {/* Insights */}
            <InsightsPanel insights={insights} />

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: Charts & Clusters */}
              <div className="lg:col-span-2 space-y-6">
                
                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
                  <h3 className="text-lg font-semibold text-slate-100 mb-6">Atividade Temporal</h3>
                  <LogChart logs={logs} />
                </div>

                <LogViewer logs={logs} />
              </div>

              {/* Right Column: Detailed Clusters */}
              <div className="lg:col-span-1">
                <div className="sticky top-6">
                  <ClusterView groups={groups} />
                </div>
              </div>

            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default App;
