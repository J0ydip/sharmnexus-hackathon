'use client';

import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  BarChart, Bar,
  AreaChart, Area,
} from 'recharts';
import { getCooperativeAnalytics, type CooperativeAnalyticsData } from '@/app/actions/analytics';

// ---------------------------------------------------------------------------
// Cooperative Analytics Dashboard
// Rich data visualizations for cooperative governance & decision making
// ---------------------------------------------------------------------------

interface AnalyticsDashboardProps {
  societyId?: string;
}

export function AnalyticsDashboard({ societyId }: AnalyticsDashboardProps) {
  const [data, setData] = useState<CooperativeAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeChart, setActiveChart] = useState<'revenue' | 'categories' | 'utilization' | 'welfare'>('revenue');

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const result = await getCooperativeAnalytics(societyId);
        setData(result);
      } catch (err) {
        console.error('Error fetching analytics:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchAnalytics();
  }, [societyId]);

  if (isLoading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: 300, color: '#a0785a',
      }}>
        <div style={{
          width: 32, height: 32, border: '3px solid #d96f4d', borderTopColor: 'transparent',
          borderRadius: '50%', animation: 'spin 0.8s linear infinite',
        }} />
      </div>
    );
  }

  if (!data) {
    return <div style={{ padding: 24, color: '#a0785a' }}>Unable to load analytics data.</div>;
  }

  const { summary } = data;

  const formatCurrency = (val: number) => {
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
    return `₹${val}`;
  };

  return (
    <div style={{ padding: '0' }}>
      {/* Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: 12,
        marginBottom: 20,
      }}>
        {[
          { label: 'Total Revenue', value: formatCurrency(summary.totalRevenue), icon: '💰', color: '#059669' },
          { label: 'Total Bookings', value: summary.totalBookings.toString(), icon: '📋', color: '#2563eb' },
          { label: 'Avg Job Value', value: formatCurrency(summary.avgJobValue), icon: '📊', color: '#d97706' },
          { label: 'Active Workers', value: summary.activeWorkers.toString(), icon: '👷', color: '#7c3aed' },
          { label: 'Fairness Index', value: `${summary.fairnessIndex}%`, icon: '⚖️', color: summary.fairnessIndex >= 75 ? '#059669' : '#dc2626' },
          { label: 'Welfare Fund', value: formatCurrency(summary.welfareFundBalance), icon: '🏥', color: '#0891b2' },
        ].map((card) => (
          <div key={card.label} style={{
            background: 'rgba(255,255,255,0.85)',
            borderRadius: 12,
            padding: '14px 16px',
            border: '1px solid #e8dfd4',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}>
            <span style={{ fontSize: 12, color: '#a0785a', fontWeight: 500 }}>{card.icon} {card.label}</span>
            <span style={{ fontSize: 22, fontWeight: 700, color: card.color }}>{card.value}</span>
          </div>
        ))}
      </div>

      {/* Chart Tabs */}
      <div style={{
        display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap',
      }}>
        {[
          { key: 'revenue' as const, label: '📈 Revenue Trend' },
          { key: 'categories' as const, label: '🔧 Job Categories' },
          { key: 'utilization' as const, label: '👷 Worker Utilization' },
          { key: 'welfare' as const, label: '🏥 Welfare Fund' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveChart(tab.key)}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: activeChart === tab.key ? '2px solid #d96f4d' : '1px solid #e8dfd4',
              background: activeChart === tab.key ? 'rgba(217,111,77,0.1)' : 'rgba(255,255,255,0.7)',
              color: activeChart === tab.key ? '#d96f4d' : '#8b7355',
              fontWeight: activeChart === tab.key ? 600 : 400,
              fontSize: 13,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Charts Container */}
      <div style={{
        background: 'rgba(255,255,255,0.9)',
        borderRadius: 14,
        padding: 20,
        border: '1px solid #e8dfd4',
        minHeight: 320,
      }}>
        {activeChart === 'revenue' && (
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: '#5a4a3a', marginBottom: 16 }}>
              Monthly Revenue & Booking Trend
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={data.monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8dfd4" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#8b7355' }} />
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 12, fill: '#8b7355' }}
                  tickFormatter={(v) => formatCurrency(v)}
                />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12, fill: '#8b7355' }} />
                <Tooltip
                  contentStyle={{
                    background: '#fdf8f1', borderColor: '#e8dfd4', borderRadius: 8,
                    fontSize: 13, color: '#5a4a3a',
                  }}
                  formatter={(value: any, name: any) => [
                    name === 'revenue' ? formatCurrency(Number(value) || 0) : value,
                    name === 'revenue' ? 'Revenue' : 'Bookings',
                  ]}
                />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#d96f4d"
                  strokeWidth={2.5}
                  dot={{ fill: '#d96f4d', r: 4 }}
                  name="Revenue"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="bookings"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={{ fill: '#2563eb', r: 3 }}
                  strokeDasharray="5 5"
                  name="Bookings"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {activeChart === 'categories' && (
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: '#5a4a3a', marginBottom: 16 }}>
              Service Category Distribution
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={data.categoryBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }: { name?: string; percent?: number }) => `${name || ''} ${((percent ?? 0) * 100).toFixed(0)}%`}
                >
                  {data.categoryBreakdown.map((entry, i) => (
                    <Cell key={`cell-${i}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: '#fdf8f1', borderColor: '#e8dfd4', borderRadius: 8,
                    fontSize: 13,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {activeChart === 'utilization' && (
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: '#5a4a3a', marginBottom: 16 }}>
              Worker Utilization & Fairness Distribution
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data.workerUtilization}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8dfd4" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#8b7355' }} />
                <YAxis tick={{ fontSize: 12, fill: '#8b7355' }} />
                <Tooltip
                  contentStyle={{
                    background: '#fdf8f1', borderColor: '#e8dfd4', borderRadius: 8,
                    fontSize: 13,
                  }}
                />
                <Legend />
                <Bar dataKey="jobsCompleted" name="Jobs Completed" fill="#d96f4d" radius={[4, 4, 0, 0]} />
                <Bar dataKey="fairnessScore" name="Fairness Score" fill="#059669" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {activeChart === 'welfare' && (
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: '#5a4a3a', marginBottom: 16 }}>
              Welfare & Tool Bank Fund Trend
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={data.welfareTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8dfd4" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#8b7355' }} />
                <YAxis tick={{ fontSize: 12, fill: '#8b7355' }} tickFormatter={(v) => formatCurrency(v)} />
                <Tooltip
                  contentStyle={{
                    background: '#fdf8f1', borderColor: '#e8dfd4', borderRadius: 8,
                    fontSize: 13,
                  }}
                  formatter={(value: any) => [formatCurrency(Number(value) || 0)]}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="balance"
                  name="Fund Balance"
                  stroke="#0891b2"
                  fill="rgba(8,145,178,0.15)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="contributions"
                  name="Contributions"
                  stroke="#059669"
                  fill="rgba(5,150,105,0.1)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="utilized"
                  name="Utilized"
                  stroke="#d97706"
                  fill="rgba(217,119,6,0.1)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Fairness Score Badge */}
      <div style={{
        marginTop: 16,
        padding: '12px 16px',
        background: summary.fairnessIndex >= 75
          ? 'rgba(5,150,105,0.08)'
          : 'rgba(220,38,38,0.08)',
        borderRadius: 10,
        border: `1px solid ${summary.fairnessIndex >= 75 ? '#bbf7d0' : '#fecaca'}`,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}>
        <span style={{ fontSize: 28 }}>⚖️</span>
        <div>
          <div style={{
            fontSize: 14, fontWeight: 600,
            color: summary.fairnessIndex >= 75 ? '#059669' : '#dc2626',
          }}>
            Cooperative Fairness Index: {summary.fairnessIndex}%
          </div>
          <div style={{ fontSize: 12, color: '#8b7355', marginTop: 2 }}>
            {summary.fairnessIndex >= 85
              ? 'Excellent — Job distribution is highly equitable across all cooperative members.'
              : summary.fairnessIndex >= 75
                ? 'Good — Fair distribution with minor variance. Consider prioritizing under-utilized workers.'
                : 'Needs Attention — Significant workload imbalance detected. Review dispatch algorithm fairness weights.'}
          </div>
        </div>
      </div>
    </div>
  );
}
