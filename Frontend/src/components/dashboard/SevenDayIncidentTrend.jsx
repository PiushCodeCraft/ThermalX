import React from 'react';
import { TrendingUp } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { trendData, trendSummary } from '../../data/trendData';

export const SevenDayIncidentTrend = () => {
  return (
    <div className="bg-white border border-slate-200 shadow-sm p-4 rounded flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-2 mb-3 bg-slate-50 p-2 rounded border border-slate-200">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-blue-700" />
            <h3 className="font-semibold text-[14px] text-slate-900">7-Day Incident Trend</h3>
          </div>
          <span className="tabular-nums text-[11px] text-slate-500 font-medium">
            Daily Incident Volume
          </span>
        </div>

        {/* Headline Stat */}
        <div className="flex items-baseline justify-between mb-2">
          <div>
            <span className="tabular-nums text-xl font-bold text-slate-900">
              {trendSummary.totalIncidents} Incidents
            </span>
            <span className="text-[11px] text-slate-500 ml-2 font-medium">
              {trendSummary.peakStatus}
            </span>
          </div>
          <span className="text-[11px] text-red-600 font-semibold uppercase tracking-wider">
            ↑ {trendSummary.statusText}
          </span>
        </div>

        {/* Recharts Area Chart */}
        <div className="w-full h-36 relative mt-1">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1E3A8A" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#1E3A8A" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 10, fill: '#64748B' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#64748B' }}
                axisLine={false}
                tickLine={false}
                domain={[60, 140]}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white p-2 rounded text-[11px] shadow-lg border border-slate-700">
                        <p className="font-semibold">{data.fullDay}</p>
                        <p className="tabular-nums text-blue-300 font-bold">
                          {data.count} Incidents
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
                stroke="#00236F"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#trendGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Days breakdown axis bar */}
        <div className="flex justify-between text-[10px] tabular-nums text-slate-500 uppercase px-1 mt-2 border-t border-slate-100 pt-1.5">
          {trendData.map((item) => (
            <span key={item.day} className={item.day === 'Sun' ? 'font-bold text-slate-900' : ''}>
              {item.day} ({item.count})
            </span>
          ))}
        </div>
      </div>

      {/* Trend Subtext */}
      <div className="mt-3 pt-2 bg-slate-50 p-2 rounded border border-slate-200 flex items-center justify-between text-[11px]">
        <span className="text-slate-600">
          Past 7d Mean: <strong className="tabular-nums text-slate-900">{trendSummary.meanDaily} fires/day</strong>
        </span>
        <span className="text-slate-600 tabular-nums">
          Baseline Diff: <span className="text-red-600 font-semibold">+{trendSummary.baselineDiffPercent}%</span>
        </span>
      </div>
    </div>
  );
};
