import { LogEntry, LogLevel, LogGroup, LogStats, Insight } from '../types';

const LOG_REGEX = /^\[(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\] \[(\w+)\] (.*)$/;

export const parseLogs = (rawText: string): LogEntry[] => {
  const lines = rawText.split('\n');
  return lines
    .map((line, index) => {
      const match = line.match(LOG_REGEX);
      if (!match) return null;

      const [, timestamp, levelStr, message] = match;
      let level = LogLevel.UNKNOWN;

      switch (levelStr.toUpperCase()) {
        case 'INFO': level = LogLevel.INFO; break;
        case 'ERROR': level = LogLevel.ERROR; break;
        case 'DEBUG': level = LogLevel.DEBUG; break;
        case 'WARNING': level = LogLevel.WARNING; break;
        case 'SUCCESS': level = LogLevel.SUCCESS; break;
      }

      return {
        id: `log-${index}`,
        timestamp,
        dateObj: new Date(timestamp),
        level,
        message: message.trim(),
        raw: line
      };
    })
    .filter((entry): entry is LogEntry => entry !== null);
};

export const calculateStats = (logs: LogEntry[]): LogStats => {
  if (logs.length === 0) {
    return {
      totalLogs: 0,
      levelCounts: { [LogLevel.INFO]: 0, [LogLevel.ERROR]: 0, [LogLevel.DEBUG]: 0, [LogLevel.WARNING]: 0, [LogLevel.SUCCESS]: 0, [LogLevel.UNKNOWN]: 0 },
      startTime: null,
      endTime: null,
      totalDurationMs: 0,
      errorRate: 0
    };
  }

  const levelCounts = logs.reduce((acc, log) => {
    acc[log.level] = (acc[log.level] || 0) + 1;
    return acc;
  }, {} as Record<LogLevel, number>);

  const startTime = logs[0].dateObj;
  const endTime = logs[logs.length - 1].dateObj;
  const totalDurationMs = endTime.getTime() - startTime.getTime();
  const errorRate = (levelCounts[LogLevel.ERROR] || 0) / logs.length;

  return {
    totalLogs: logs.length,
    levelCounts: {
      INFO: levelCounts[LogLevel.INFO] || 0,
      ERROR: levelCounts[LogLevel.ERROR] || 0,
      DEBUG: levelCounts[LogLevel.DEBUG] || 0,
      WARNING: levelCounts[LogLevel.WARNING] || 0,
      SUCCESS: levelCounts[LogLevel.SUCCESS] || 0,
      UNKNOWN: levelCounts[LogLevel.UNKNOWN] || 0,
    },
    startTime,
    endTime,
    totalDurationMs,
    errorRate
  };
};

export const clusterGroups = (logs: LogEntry[]): LogGroup[] => {
  const groups: LogGroup[] = [];
  let currentGroup: Partial<LogGroup> | null = null;

  // Regex to capture group name from specific log message patterns found in the sample
  const GROUP_START_REGEX = /Iniciando processamento do grupo: (.*)$/;
  const FILE_PROCESSED_REGEX = /Processamento concluído para:/;

  logs.forEach((log) => {
    const startMatch = log.message.match(GROUP_START_REGEX);

    if (startMatch) {
      // If a group was already open, close it (assuming linear processing)
      if (currentGroup) {
        currentGroup.endTime = log.dateObj; // Use start of next as end of prev roughly
        currentGroup.durationMs = (currentGroup.endTime?.getTime() || 0) - (currentGroup.startTime?.getTime() || 0);
        groups.push(currentGroup as LogGroup);
      }

      currentGroup = {
        name: startMatch[1],
        startTime: log.dateObj,
        entries: [log],
        status: 'complete', // Default to complete, set to error if found
        fileCount: 0
      };
    } else if (currentGroup) {
      currentGroup.entries?.push(log);
      
      if (log.level === LogLevel.ERROR) {
        currentGroup.status = 'error';
      }
      if (FILE_PROCESSED_REGEX.test(log.message)) {
        currentGroup.fileCount = (currentGroup.fileCount || 0) + 1;
      }
    }
  });

  // Push the last group
  if (currentGroup) {
    currentGroup.endTime = currentGroup.entries![currentGroup.entries!.length - 1].dateObj;
    currentGroup.durationMs = (currentGroup.endTime.getTime()) - (currentGroup.startTime!.getTime());
    groups.push(currentGroup as LogGroup);
  }

  return groups;
};

export const generateInsights = (stats: LogStats, groups: LogGroup[], logs: LogEntry[]): Insight[] => {
  const insights: Insight[] = [];

  // Error Analysis
  if (stats.levelCounts[LogLevel.ERROR] > 0) {
    insights.push({
      type: 'critical',
      title: 'Erros Críticos Detectados',
      description: `Foram identificados ${stats.levelCounts[LogLevel.ERROR]} erros críticos durante a execução. A taxa de erro é de ${(stats.errorRate * 100).toFixed(2)}%. Verifique os clusters marcados em vermelho.`
    });
  } else {
    insights.push({
      type: 'success',
      title: 'Execução Limpa',
      description: 'Nenhum erro bloqueante foi identificado nos logs fornecidos.'
    });
  }

  // Performance Analysis
  const longRunningGroups = groups.filter(g => g.durationMs > 60000); // > 1 min
  if (longRunningGroups.length > 0) {
    insights.push({
      type: 'warning',
      title: 'Gargalos de Performance',
      description: `${longRunningGroups.length} grupos de processamento levaram mais de 1 minuto para concluir. O grupo "${longRunningGroups[0].name}" demorou ${(longRunningGroups[0].durationMs / 1000).toFixed(1)}s.`
    });
  }

  // Hash/Integrity Analysis
  const hashChecks = logs.filter(l => l.message.includes('Hash SHA-256'));
  if (hashChecks.length > 0) {
    insights.push({
      type: 'info',
      title: 'Integridade de Dados',
      description: `O protocolo realizou ${hashChecks.length} verificações de integridade (SHA-256), garantindo a segurança dos arquivos processados.`
    });
  }

  // RSYNC Analysis
  const rsyncOps = logs.filter(l => l.message.includes('rsync'));
  if (rsyncOps.length > 0) {
     insights.push({
      type: 'info',
      title: 'Sincronização Remota',
      description: `Detectadas operações de sincronização com vault remoto (rsync). Verifique se houve falhas de conexão em logs adjacentes.`
    });
  }

  return insights;
};
