import { useState } from 'react';

export function DayChart({ hours, now, height = 220, stormWindow = null }) {
  const [hoveredIdx, setHoveredIdx] = useState(14); // Default to 2:00 PM storm window
  const W = 740;
  const H = height;
  const pad = { l: 68, r: 48, t: 34, b: 30 };
  const max = Math.max(...hours.map((x) => Math.max(x.load, x.solar)), 10) * 1.1;
  const bw = (W - pad.l - pad.r) / 24;
  const y = (v) => H - pad.b - (v / max) * (H - pad.t - pad.b);
  const ySoc = (s) => H - pad.b - s * (H - pad.t - pad.b);
  const socPath = hours.map((x, i) => `${i ? 'L' : 'M'}${pad.l + bw * i + bw / 2},${ySoc(x.soc)}`).join(' ');

  const formatHour = (h) => (h === 0 ? '12 AM' : h === 12 ? '12 PM' : h < 12 ? `${h} AM` : `${h - 12} PM`);

  const active = hours[hoveredIdx] || hours[14];
  const activeSolar = Math.min(active.solar, active.load);
  const activeBatt = active.discharge;
  const activeGen = active.genset;
  const activeTotal = active.load;
  const activeSoc = Math.round(active.soc * 100);
  const activeTime = formatHour(active.h);
  const isStorm = stormWindow && active.h >= stormWindow.from && active.h <= stormWindow.to;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Interactive Detail Inspection Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 10,
          padding: '10px 14px',
          background: '#F8FAFC',
          borderRadius: 8,
          border: '1px solid #CBD5E1',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', background: '#E2E8F0', padding: '3px 8px', borderRadius: 5 }}>
            🕒 {activeTime} ({String(active.h).padStart(2, '0')}:00)
          </span>
          {isStorm && (
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#0369A1', background: '#E0F2FE', padding: '3px 8px', borderRadius: 4 }}>
              🌧️ Rain Storm Window
            </span>
          )}
          <span style={{ fontSize: '13px', color: '#334155' }}>
            Site Power Demand: <strong>{activeTotal} kW</strong>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '12px', flexWrap: 'wrap' }}>
          <span style={{ color: '#D97706', fontWeight: 600 }}>☀️ Solar: <strong>{activeSolar} kW</strong></span>
          <span style={{ color: '#0F766E', fontWeight: 600 }}>🔋 Battery: <strong>{activeBatt} kW</strong></span>
          <span style={{ color: '#475569', fontWeight: 600 }}>⛽ Genset: <strong>{activeGen} kW</strong></span>
          <span style={{ color: '#047857', fontWeight: 700, background: '#ECFDF5', border: '1px solid #A7F3D0', padding: '3px 8px', borderRadius: 4 }}>
            Battery Level: {activeSoc}% Full
          </span>
        </div>
      </div>

      <svg className="chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Hourly solar, battery, backup generator and battery charge" style={{ cursor: 'pointer' }}>
        {/* Left Y-Axis Header */}
        <text x={pad.l} y={pad.t - 14} fontSize="11" fontWeight="700" textAnchor="start" fill="#334155">
          Power Flow (kW)
        </text>

        {/* Right Y-Axis Header */}
        <text x={W - pad.r} y={pad.t - 14} fontSize="11" fontWeight="700" textAnchor="end" fill="#0F766E">
          Battery Level (%)
        </text>

        {/* Storm Window Highlight */}
        {stormWindow && (
          <g>
            <rect
              x={pad.l + bw * stormWindow.from}
              y={pad.t}
              width={bw * (stormWindow.to - stormWindow.from + 1)}
              height={H - pad.b - pad.t}
              fill="#0284C7"
              fillOpacity="0.08"
              stroke="#0284C7"
              strokeDasharray="3 3"
              strokeOpacity="0.3"
              rx="4"
            />
            <rect
              x={pad.l + bw * stormWindow.from + (bw * (stormWindow.to - stormWindow.from + 1) - 110) / 2}
              y={pad.t + 2}
              width="110"
              height="16"
              fill="#E0F2FE"
              rx="3"
            />
            <text
              x={pad.l + bw * stormWindow.from + (bw * (stormWindow.to - stormWindow.from + 1)) / 2}
              y={pad.t + 13}
              fontSize="9"
              fontWeight="700"
              textAnchor="middle"
              fill="#0369A1"
            >
              🌧️ Rain (Storm Window)
            </text>
          </g>
        )}

        {/* Left Y-Axis Grid Lines & Labels */}
        {[0, 0.5, 1].map((t) => (
          <g key={t}>
            <line x1={pad.l} x2={W - pad.r} y1={y(max * t / 1.1)} y2={y(max * t / 1.1)} stroke="#E2E8F0" />
            <text x={pad.l - 8} y={y(max * t / 1.1) + 4} fontSize="10" fontWeight="600" textAnchor="end" fill="#64748B">
              {Math.round(max * t / 1.1)} kW
            </text>
          </g>
        ))}

        {/* Right Y-Axis Grid Labels */}
        <text x={W - pad.r + 8} y={ySoc(1) + 4} fontSize="10" fontWeight="600" fill="#0F766E">100%</text>
        <text x={W - pad.r + 8} y={ySoc(0.5) + 4} fontSize="10" fontWeight="600" fill="#0F766E">50%</text>
        <text x={W - pad.r + 8} y={ySoc(0) + 4} fontSize="10" fontWeight="600" fill="#0F766E">0%</text>

        {/* Hover Highlight Column */}
        {hoveredIdx !== null && (
          <rect
            x={pad.l + bw * hoveredIdx}
            y={pad.t}
            width={bw}
            height={H - pad.b - pad.t}
            fill="#0F766E"
            fillOpacity="0.12"
            stroke="#0F766E"
            strokeWidth="1"
            rx="2"
          />
        )}

        {/* Hourly Stacked Power Bars */}
        {hours.map((x, i) => {
          const fromSolar = Math.min(x.solar, x.load);
          const x0 = pad.l + bw * i + 2;
          const w = bw - 4;
          const isSelected = hoveredIdx === i;
          return (
            <g key={i} opacity={hoveredIdx !== null && !isSelected ? 0.8 : 1}>
              <rect x={x0} y={y(fromSolar)} width={w} height={Math.max(0, y(0) - y(fromSolar))} fill="var(--solar)" rx="1" />
              <rect x={x0} y={y(fromSolar + x.discharge)} width={w} height={Math.max(0, y(0) - y(x.discharge))} fill="var(--batt)" rx="1" />
              <rect x={x0} y={y(fromSolar + x.discharge + x.genset)} width={w} height={Math.max(0, y(0) - y(x.genset))} fill="var(--gen)" rx="1" />
              {i % 3 === 0 && (
                <text x={x0 + w / 2} y={H - 10} fontSize="10" fontWeight={isSelected ? '800' : '600'} textAnchor="middle" fill={isSelected ? '#0F766E' : '#64748B'}>
                  {formatHour(i)}
                </text>
              )}
            </g>
          );
        })}

        {/* Battery State of Charge Line */}
        <path d={socPath} fill="none" stroke="#0F766E" strokeWidth="2.5" strokeDasharray="4 3" />

        {/* Active Dot on Battery Line */}
        {hoveredIdx !== null && (
          <circle
            cx={pad.l + bw * hoveredIdx + bw / 2}
            cy={ySoc(hours[hoveredIdx].soc)}
            r="4.5"
            fill="#0F766E"
            stroke="#FFFFFF"
            strokeWidth="2"
          />
        )}

        {/* Transparent Click & Hover overlay columns */}
        {hours.map((x, i) => (
          <rect
            key={`hit-${i}`}
            x={pad.l + bw * i}
            y={pad.t}
            width={bw}
            height={H - pad.b}
            fill="transparent"
            onMouseEnter={() => setHoveredIdx(i)}
            onClick={() => setHoveredIdx(i)}
            style={{ cursor: 'pointer' }}
          />
        ))}
      </svg>

      {/* Legend with crystal clear explanation */}
      <div className="legend" style={{ display: 'flex', justifyContent: 'center', gap: 20, flexWrap: 'wrap', marginTop: 4 }}>
        <span><i style={{ background: 'var(--solar)' }} />Solar Power (kW)</span>
        <span><i style={{ background: 'var(--batt)' }} />Battery Power (kW)</span>
        <span><i style={{ background: 'var(--gen)' }} />Backup Generator (kW)</span>
        <span><i style={{ background: 'transparent', borderTop: '2.5px dashed #0F766E', height: 0 }} />Battery Level (%)</span>
      </div>
    </div>
  );
}

export function LineLimit({ points, limitAt, height = 180, label }) {
  const W = 720;
  const H = height;
  const pad = { l: 36, r: 10, t: 10, b: 24 };
  const lo = 35;
  const hi = 80;
  const x = (i) => pad.l + (i / (points.length - 1)) * (W - pad.l - pad.r);
  const y = (v) => H - pad.b - ((v - lo) / (hi - lo)) * (H - pad.t - pad.b);
  const path = (key) => points.map((p, i) => `${i ? 'L' : 'M'}${x(i)},${y(p[key])}`).join(' ');
  const limitPath = points.map((p, i) => `${i ? 'L' : 'M'}${x(i)},${y(limitAt(p, i))}`).join(' ');
  return (
    <svg className="chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label}>
      {[40, 50, 60, 70].map((v) => (
        <g key={v}>
          <line x1={pad.l} x2={W - pad.r} y1={y(v)} y2={y(v)} stroke="#eef2f6" />
          <text x={pad.l - 6} y={y(v) + 4} fontSize="10" textAnchor="end" fill="#64748b">{v}</text>
        </g>
      ))}
      <path d={limitPath} fill="none" stroke="var(--danger)" strokeWidth="1.5" strokeDasharray="5 4" />
      {points[0].before != null && <path d={path('before')} fill="none" stroke="#94a3b8" strokeWidth="2" />}
      <path d={path('db')} fill="none" stroke="var(--green)" strokeWidth="2.5" />
      {points.map((p, i) => (i % Math.ceil(points.length / 8) === 0 ? <text key={i} x={x(i)} y={H - 8} fontSize="10" textAnchor="middle" fill="#64748b">{p.tick}</text> : null))}
    </svg>
  );
}

export function Bars({ rows, height = 200 }) {
  const W = 720;
  const H = height;
  const pad = { l: 56, r: 10, t: 10, b: 28 };
  const max = Math.max(...rows.map((r) => r.a)) * 1.1;
  const gw = (W - pad.l - pad.r) / rows.length;
  const y = (v) => H - pad.b - (v / max) * (H - pad.t - pad.b);
  return (
    <svg className="chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Monthly diesel cost before and after">
      {[0, 0.5, 1].map((t) => (
        <g key={t}>
          <line x1={pad.l} x2={W - pad.r} y1={y(max * t / 1.1)} y2={y(max * t / 1.1)} stroke="#eef2f6" />
          <text x={pad.l - 6} y={y(max * t / 1.1) + 4} fontSize="10" textAnchor="end" fill="#64748b">{Math.round(max * t / 1.1 / 1000)}k</text>
        </g>
      ))}
      {rows.map((r, i) => {
        const x0 = pad.l + gw * i + gw * 0.18;
        const bw = gw * 0.3;
        return (
          <g key={r.label}>
            <rect x={x0} y={y(r.a)} width={bw} height={y(0) - y(r.a)} fill="#94a3b8" rx="2" />
            <rect x={x0 + bw + 4} y={y(r.b)} width={bw} height={y(0) - y(r.b)} fill="var(--green)" rx="2" />
            <text x={x0 + bw} y={H - 9} fontSize="11" textAnchor="middle" fill="#334155">{r.label}</text>
          </g>
        );
      })}
    </svg>
  );
}
