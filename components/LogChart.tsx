import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { LogEntry, LogLevel } from '../types';

interface LogChartProps {
  logs: LogEntry[];
}

const LogChart: React.FC<LogChartProps> = ({ logs }) => {
  const data = useMemo(() => {
    if (logs.length === 0) return [];

    // Group by hour or minute depending on range. Given the log spans days, let's group by Hour.
    // However, specific bursts might be better seen by minute if we filter. 
    // For general view, let's bucket by "Hour".
    
    const bucketMap: Record<string, { time: string, total: number, errors: number }> = {};

    logs.forEach(log => {
        // Format: YYYY-MM-DD HH:00
        const date = log.dateObj;
        const key = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:00`;
        
        if (!bucketMap[key]) {
            bucketMap[key] = { time: key, total: 0, errors: 0 };
        }
        bucketMap[key].total += 1;
        if (log.level === LogLevel.ERROR) {
            bucketMap[key].errors += 1;
        }
    });

    return Object.values(bucketMap).sort((a, b) => a.time.localeCompare(b.time));
  }, [logs]);

  if (data.length === 0) return <div className="text-slate-500">No data for chart</div>;

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorError" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="time" 
            tick={{ fill: '#94a3b8', fontSize: 12 }} 
            stroke="#475569"
            minTickGap={30}
          />
          <YAxis 
            tick={{ fill: '#94a3b8', fontSize: 12 }} 
            stroke="#475569"
          />
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', color: '#f8fafc' }}
          />
          <Area 
            type="monotone" 
            dataKey="total" 
            stroke="#3b82f6" 
            fillOpacity={1} 
            fill="url(#colorTotal)" 
            name="Total Logs"
          />
          <Area 
            type="monotone" 
            dataKey="errors" 
            stroke="#ef4444" 
            fillOpacity={1} 
            fill="url(#colorError)" 
            name="Errors"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LogChart;
