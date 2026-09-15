import React from 'react';
import { Activity, ArrowUpRight } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const threeDayData = [
  { time: 'Fri 08:00', count: 114, baseline: 82 },
  { time: 'Fri 16:00', count: 118, baseline: 83 },
  { time: 'Sat 00:00', count: 122, baseline: 84 },
  { time: 'Sat 08:00', count: 125, baseline: 85 },
  { time: 'Sat 16:00', count: 128, baseline: 85 },
  { time: 'Sun 00:00', count: 126, baseline: 86 },
  { time: 'Sun 08:00', count: 128, baseline: 86 }
];

export const ThreeDayIncidentTrend = () => {
  return (
    <div className="bg-white border border-slate-200 shadow-sm p-4 rounded flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-2 mb-3 bg-slate-50 p-2 rounded border border-slate-200">
          <div className="flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-red-600" />
            <h3 className="font-semibold text-[14px] text-slate-900">3-Day Incident Trend</h3>
          </div>
          <span className="tabular-nums text-[11px] text-slate-500 font-medium">
            72-Hour Rapid Pulse
          </span>
        </div>

        {/* Headline Stat */}
        <div className="flex items-baseline justify-between mb-2">
          <div>
            <span className="tabular-nums text-xl font-bold text-slate-900">
              128 Incidents
            </span>
            <span className="text-[11px] text-slate-500 ml-2 font-medium">
              Sustained Peak (+6.7% / 24h)
            </span>
          </div>
          <span className="text-[11px] text-red-600 font-semibold uppercase tracking-wider flex items-center gap-0.5">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Critical</span>
          </span>
        </div>

        {/* Recharts Area Chart */}
        <div className="w-full h-32 relative mt-1">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={threeDayData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="threeDayGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#DC2626" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#DC2626" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 9.5, fill: '#64748B' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 9.5, fill: '#64748B' }}
                axisLine={false}
                tickLine={false}
                domain={[100, 135]}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white p-2 rounded text-[11px] shadow-lg border border-slate-700">
                        <p className="font-semibold">{data.time}</p>
                        <p className="tabular-nums text-red-400 font-bold">
                          {data.count} Active Hotspots
                        </p>
                        <p className="tabular-nums text-slate-400 text-[10px]">
                          Baseline: {data.baseline}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#DC2626"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#threeDayGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Days breakdown */}
        <div className="flex justify-between text-[10px] tabular-nums text-slate-500 uppercase px-1 mt-2 border-t border-slate-100 pt-1.5">
          <span>Fri (118)</span>
          <span>Sat (128)</span>
          <span className="font-bold text-slate-900">Sun (128 Active)</span>
        </div>
      </div>

      {/* Trend Subtext */}
      <div className="mt-3 pt-2 bg-slate-50 p-2 rounded border border-slate-200 flex items-center justify-between text-[11px]">
        <span className="text-slate-600">
          Past 3d Mean: <strong className="tabular-nums text-slate-900">125.3 fires/day</strong>
        </span>
        <span className="text-slate-600 tabular-nums">
          Baseline Diff: <span className="text-red-600 font-semibold">+41.2%</span>
        </span>
      </div>
    </div>
  );
};
