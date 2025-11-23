export enum LogLevel {
  INFO = 'INFO',
  ERROR = 'ERROR',
  DEBUG = 'DEBUG',
  WARNING = 'WARNING',
  SUCCESS = 'SUCCESS',
  UNKNOWN = 'UNKNOWN'
}

export interface LogEntry {
  id: string;
  timestamp: string;
  dateObj: Date;
  level: LogLevel;
  message: string;
  raw: string;
}

export interface LogGroup {
  name: string;
  startTime: Date;
  endTime: Date;
  durationMs: number;
  entries: LogEntry[];
  status: 'complete' | 'error' | 'partial';
  fileCount: number;
}

export interface LogStats {
  totalLogs: number;
  levelCounts: Record<LogLevel, number>;
  startTime: Date | null;
  endTime: Date | null;
  totalDurationMs: number;
  errorRate: number;
}

export interface Insight {
  type: 'critical' | 'warning' | 'success' | 'info';
  title: string;
  description: string;
}
