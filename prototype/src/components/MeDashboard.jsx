import { useState, useEffect, useMemo } from 'react';
import { fmt } from '../data/model';
import cityOfElminaImg from '../assets/cityofelmina.jpg';
import sereniaImg from '../assets/serenia.jpg';
import bandarBukitRajaImg from '../assets/bandarbukitraja.jpg';

const SITE_HERO_IMAGES = {
  elmina: cityOfElminaImg,
  serenia: sereniaImg,
  bukitraja: bandarBukitRajaImg,
};

export function getSiteHeroImage(site) {
  if (!site) return cityOfElminaImg;
  const id = (site.id || '').toLowerCase();
  const name = (site.name || '').toLowerCase();
  if (id === 'bukitraja' || id.includes('raja') || id.includes('bukit') || name.includes('raja') || name.includes('bukit')) {
    return bandarBukitRajaImg;
  }
  if (id === 'serenia' || id.includes('serenia') || name.includes('serenia')) {
    return sereniaImg;
  }
  if (id === 'elmina' || id.includes('elmina') || name.includes('elmina')) {
    return cityOfElminaImg;
  }
  return SITE_HERO_IMAGES[site.id] || cityOfElminaImg;
}

// --- SUB-COMPONENT 1: HERO BANNER ---
export function HeroBanner({ site, liveWeather }) {
  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Format: 12:17 AM
      const timeOptions = { hour: 'numeric', minute: '2-digit', hour12: true };
      setTimeStr(now.toLocaleTimeString('en-US', timeOptions));
      // Format: Tue, 21 Oct 2026
      const dateOptions = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' };
      setDateStr(now.toLocaleDateString('en-US', dateOptions));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const temp = liveWeather?.currentTemp ?? liveWeather?.temp ?? 26;
  const condition = liveWeather?.conditionText ?? liveWeather?.condition ?? 'Partly cloudy';
  const location = liveWeather?.locationName ?? liveWeather?.location ?? (site?.locationName || site?.name || 'Kuala Lumpur');
  const emoji = liveWeather?.emoji || '⛅';

  const siteImg = useMemo(() => getSiteHeroImage(site), [site]);

  return (
    <div
      style={{
        background: `linear-gradient(135deg, rgba(6, 40, 28, 0.84) 0%, rgba(15, 23, 42, 0.88) 100%), url(${siteImg}) center/cover no-repeat`,
        borderRadius: '12px',
        padding: '22px 26px',
        color: '#FFFFFF',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
        border: '1px solid #1E293B',
        transition: 'background 0.3s ease',
      }}
    >
      {/* Left: Township Specs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div
          style={{
            width: '4px',
            height: '46px',
            backgroundColor: '#22C55E',
            borderRadius: '4px',
            boxShadow: '0 0 10px rgba(34, 197, 94, 0.5)',
          }}
        />
        <div>
          {site.kind && (
            <div
              style={{
                fontSize: '11px',
                fontWeight: 800,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#86EFAC',
                marginBottom: '3px',
              }}
            >
              {site.kind}
            </div>
          )}
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#FFFFFF', margin: 0, letterSpacing: '-0.02em' }}>
            {site.name}
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#CBD5E1', fontWeight: 500 }}>
            BESS {site.bessKWh} kWh ({site.bessKW} kW Inverter) &nbsp;|&nbsp; Solar {site.solarKWp} kWp
          </p>
        </div>
      </div>

      {/* Right: Weather & Live Clock */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
        {/* Weather Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '26px' }}>{emoji}</span>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#FFFFFF', lineHeight: 1.1 }}>
              {temp}°C
            </div>
            <div style={{ fontSize: '11px', color: '#CBD5E1' }}>
              {condition}
            </div>
            <div style={{ fontSize: '10px', color: '#94A3B8' }}>
              {location}
            </div>
          </div>
        </div>


        {/* Live Clock & Date */}
        <div>
          <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600 }}>
            {dateStr || 'Tue, 21 Oct 2026'}
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            {timeStr || '12:17 AM'}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- SUB-COMPONENT 2: TOP 4 KPI METRIC CARDS ---
export function TopKpiCards({ site, now, day, currentHour, gensetNow }) {
  const peakSolar = useMemo(() => Math.round(Math.max(...day.hours.map((h) => h.solar))), [day]);
  const peakLoad = useMemo(() => Math.round(Math.max(...day.hours.map((h) => h.load))), [day]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '14px' }}>
      {/* 1. Battery State of Charge */}
      <div className="card" style={{ padding: '16px 18px', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#ECFDF5', display: 'grid', placeItems: 'center', fontSize: '16px', color: '#059669' }}>
            🔋
          </div>
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748B' }}>Battery State of Charge</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
          <span style={{ fontSize: '28px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
            {(now.soc * 100).toFixed(0)}
          </span>
          <span style={{ fontSize: '16px', fontWeight: 700, color: '#64748B' }}>%</span>
        </div>
        <div style={{ fontSize: '11px', color: '#64748B', margin: '4px 0 10px' }}>
          {fmt(now.soc * site.bessKWh)} of {site.bessKWh} kWh stored
        </div>
        {/* Progress Bar */}
        <div style={{ width: '100%', height: '7px', background: '#E2E8F0', borderRadius: '99px', overflow: 'hidden' }}>
          <div
            style={{
              width: `${Math.min(100, Math.max(0, now.soc * 100))}%`,
              height: '100%',
              background: now.soc < 0.25 ? '#EF4444' : '#10B981',
              borderRadius: '99px',
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      </div>

      {/* 2. Solar Generating */}
      <div className="card" style={{ padding: '16px 18px', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#FFFBEB', display: 'grid', placeItems: 'center', fontSize: '16px', color: '#D97706' }}>
            ☀️
          </div>
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748B' }}>Solar Generating</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
          <span style={{ fontSize: '28px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
            {fmt(now.solar)}
          </span>
          <span style={{ fontSize: '14px', fontWeight: 700, color: '#64748B' }}>kW</span>
        </div>
        <div style={{ fontSize: '11px', color: '#64748B', margin: '4px 0 8px' }}>
          Rooftop solar output
        </div>
        {/* Sparkline Histogram */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '24px', gap: '2px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', flex: 1, height: '100%' }}>
            {day.hours.map((h, i) => {
              const maxVal = Math.max(1, peakSolar);
              const heightPct = Math.max(8, (h.solar / maxVal) * 100);
              const isCurrent = i === currentHour;
              return (
                <div
                  key={i}
                  title={`${h.h}:00 - ${h.solar} kW`}
                  style={{
                    flex: 1,
                    height: `${heightPct}%`,
                    background: isCurrent ? '#B45309' : h.solar > 0 ? '#FDE68A' : '#F1F5F9',
                    borderRadius: '2px',
                    borderTop: isCurrent ? '2px solid #D97706' : 'none',
                  }}
                />
              );
            })}
          </div>
          <div style={{ fontSize: '10px', color: '#64748B', whiteSpace: 'nowrap', marginLeft: '8px', textAlign: 'right' }}>
            <span style={{ display: 'block', fontSize: '9px', textTransform: 'uppercase', color: '#94A3B8' }}>Peak Today</span>
            <b style={{ color: '#0F172A' }}>{peakSolar} kW</b>
          </div>
        </div>
      </div>

      {/* 3. Site Load */}
      <div className="card" style={{ padding: '16px 18px', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#FEF2F2', display: 'grid', placeItems: 'center', fontSize: '16px', color: '#DC2626' }}>
            ⚡
          </div>
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748B' }}>Site Load</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
          <span style={{ fontSize: '28px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
            {fmt(now.load)}
          </span>
          <span style={{ fontSize: '14px', fontWeight: 700, color: '#64748B' }}>kW</span>
        </div>
        <div style={{ fontSize: '11px', color: '#64748B', margin: '4px 0 8px' }}>
          Supplying to site circuits
        </div>
        {/* Sparkline Histogram */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '24px', gap: '2px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', flex: 1, height: '100%' }}>
            {day.hours.map((h, i) => {
              const maxVal = Math.max(1, peakLoad);
              const heightPct = Math.max(8, (h.load / maxVal) * 100);
              const isCurrent = i === currentHour;
              return (
                <div
                  key={i}
                  title={`${h.h}:00 - ${h.load} kW`}
                  style={{
                    flex: 1,
                    height: `${heightPct}%`,
                    background: isCurrent ? '#991B1B' : '#FECACA',
                    borderRadius: '2px',
                    borderTop: isCurrent ? '2px solid #DC2626' : 'none',
                  }}
                />
              );
            })}
          </div>
          <div style={{ fontSize: '10px', color: '#64748B', whiteSpace: 'nowrap', marginLeft: '8px', textAlign: 'right' }}>
            <span style={{ display: 'block', fontSize: '9px', textTransform: 'uppercase', color: '#94A3B8' }}>Peak Today</span>
            <b style={{ color: '#0F172A' }}>{peakLoad} kW</b>
          </div>
        </div>
      </div>

      {/* 4. Generator Status */}
      <div
        className="card"
        style={{
          padding: '16px 18px',
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '10px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: gensetNow ? '#FEE2E2' : '#ECFDF5',
              display: 'grid',
              placeItems: 'center',
              fontSize: '16px',
              color: gensetNow ? '#DC2626' : '#059669',
            }}
          >
            {gensetNow ? '⚠️' : '🍃'}
          </div>
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748B' }}>Generator Status</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
          <span
            style={{
              fontSize: '28px',
              fontWeight: 800,
              color: gensetNow ? '#DC2626' : '#059669',
              letterSpacing: '-0.02em',
            }}
          >
            {gensetNow ? 'RUNNING' : 'OFF'}
          </span>
        </div>
        <div style={{ fontSize: '11px', color: '#64748B', margin: '4px 0 0' }}>
          {gensetNow ? `${fmt(now.genset)} kW supplying site` : '0 L fuel used'}
        </div>

        {/* Faded background icon watermark */}
        <div
          style={{
            position: 'absolute',
            right: '12px',
            bottom: '10px',
            fontSize: '44px',
            opacity: 0.1,
            pointerEvents: 'none',
          }}
        >
          🚜
        </div>
      </div>
    </div>
  );
}

// --- SUB-COMPONENT 3: LIVE POWER FLOW & KEY METRICS ---
export function LivePowerFlowAndMetrics({ site, now, m, gensetNow }) {
  const [metricMonth, setMetricMonth] = useState('This Month');

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.8fr) minmax(0, 1fr)', gap: '14px' }}>
      {/* LEFT: Live Site Power Flow (5-Node Diagram) */}
      <div className="card" style={{ padding: '20px', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#FFF7ED', border: '1px solid #FFEDD5', display: 'grid', placeItems: 'center', color: '#EA580C', fontSize: '15px' }}>
              ⚡
            </div>
            <div>
              <h2 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                Live Site Power Flow
              </h2>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748B' }}>
                Real-time energy flow across solar, battery, grid and site equipment.
              </p>
            </div>
          </div>



        </div>

        {/* 5-Node Schematic Grid */}
        <div
          style={{
            position: 'relative',
            display: 'grid',
            gridTemplateColumns: '1fr 1.3fr 1fr',
            alignItems: 'center',
            gap: '24px',
            padding: '16px 8px',
          }}
        >
          {/* LEFT NODES: Solar & Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Rooftop Solar */}
            <div
              style={{
                background: '#ECFDF5',
                border: '1.5px solid #A7F3D0',
                borderRadius: '10px',
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                boxShadow: '0 2px 6px rgba(16, 185, 129, 0.08)',
              }}
            >
              <span style={{ fontSize: '24px' }}>☀️</span>
              <div>
                <div style={{ fontSize: '11px', color: '#047857', fontWeight: 600 }}>Rooftop Solar</div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#064E3B' }}>{fmt(now.solar)} kW</div>
              </div>
            </div>

            {/* Grid (Standby) */}
            <div
              style={{
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '10px',
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <span style={{ fontSize: '22px', opacity: 0.6 }}>🗼</span>
              <div>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>Grid</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#475569' }}>
                  0 kW <span style={{ fontSize: '10px', color: '#94A3B8' }}>(Standby)</span>
                </div>
              </div>
            </div>
          </div>

          {/* CENTER NODE: MegaBatt BESS */}
          <div
            style={{
              background: '#FFFBEB',
              border: '2px solid #FCD34D',
              borderRadius: '12px',
              padding: '18px 16px',
              textAlign: 'center',
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.1)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ fontSize: '20px' }}>🔋</span>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#78350F' }}>MegaBatt BESS</span>
            </div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#92400E', margin: '2px 0' }}>
              {(now.soc * 100).toFixed(0)}%
            </div>
            <div style={{ fontSize: '11px', color: '#B45309', fontWeight: 600, marginBottom: '8px' }}>
              {fmt(now.soc * site.bessKWh)} / {site.bessKWh} kWh
            </div>
            {/* Progress */}
            <div style={{ width: '90%', margin: '0 auto', height: '6px', background: '#FDE68A', borderRadius: '99px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${Math.min(100, Math.max(0, now.soc * 100))}%`,
                  height: '100%',
                  background: '#059669',
                  borderRadius: '99px',
                }}
              />
            </div>
          </div>

          {/* RIGHT NODES: Site Circuits & Generator */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Site Circuits */}
            <div
              style={{
                background: '#FEF2F2',
                border: '1.5px solid #FECACA',
                borderRadius: '10px',
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                boxShadow: '0 2px 6px rgba(239, 68, 68, 0.08)',
              }}
            >
              <span style={{ fontSize: '22px' }}>🏗️</span>
              <div>
                <div style={{ fontSize: '11px', color: '#991B1B', fontWeight: 600 }}>Site Circuits</div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#7F1D1D' }}>{fmt(now.load)} kW</div>
              </div>
            </div>

            {/* Generator */}
            <div
              style={{
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '10px',
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <span style={{ fontSize: '22px', opacity: 0.6 }}>🚜</span>
              <div>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>Generator</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: gensetNow ? '#DC2626' : '#475569' }}>
                  {gensetNow ? `${fmt(now.genset)} kW` : '0 kW'} <span style={{ fontSize: '10px', color: gensetNow ? '#DC2626' : '#94A3B8' }}>{gensetNow ? '(Active)' : '(Locked)'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT: Key Metrics Summary Card */}
      <div className="card" style={{ padding: '20px', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: 0 }}>Key Metrics</h2>
            <select
              value={metricMonth}
              onChange={(e) => setMetricMonth(e.target.value)}
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: '#475569',
                border: '1px solid #CBD5E1',
                borderRadius: '6px',
                padding: '3px 8px',
                background: '#FFFFFF',
              }}
            >
              <option value="This Month">This Month</option>
              <option value="Last Month">Last Month</option>
              <option value="Full Project">Full Project</option>
            </select>
          </div>

          {/* Metric Rows */}
          <div style={{ display: 'grid', gap: '14px' }}>
            {/* 1. Diesel Eliminated */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#ECFDF5', display: 'grid', placeItems: 'center', color: '#059669', fontSize: '16px' }}>
                  ⛽
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>Diesel Eliminated</div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>{fmt(m.avoidedL)} L</div>
                </div>
              </div>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#059669', background: '#ECFDF5', padding: '2px 8px', borderRadius: '99px' }}>
                ↑ 18% <span style={{ fontSize: '9px', color: '#64748B', fontWeight: 500 }}>vs last mo</span>
              </span>
            </div>

            {/* 2. CO2 Reduction */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#F0FDFA', display: 'grid', placeItems: 'center', color: '#0F766E', fontSize: '16px' }}>
                  🌱
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>CO₂ Reduction</div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>{fmt(m.co2Kg || Math.round(m.avoidedL * 2.68))} kg</div>
                </div>
              </div>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#059669', background: '#ECFDF5', padding: '2px 8px', borderRadius: '99px' }}>
                ↑ 18% <span style={{ fontSize: '9px', color: '#64748B', fontWeight: 500 }}>vs last mo</span>
              </span>
            </div>

            {/* 3. Generator Rental Avoided */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#FFFBEB', display: 'grid', placeItems: 'center', color: '#D97706', fontSize: '16px' }}>
                  💵
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>Generator Rental Avoided</div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>RM {fmt(site.rentalAvoided)}</div>
                </div>
              </div>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#059669', background: '#ECFDF5', padding: '2px 8px', borderRadius: '99px' }}>
                ↑ 12% <span style={{ fontSize: '9px', color: '#64748B', fontWeight: 500 }}>vs last mo</span>
              </span>
            </div>

            {/* 4. Net Cash OpEx Saved */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#ECFDF5', display: 'grid', placeItems: 'center', color: '#059669', fontSize: '16px' }}>
                  📈
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>Net Cash OpEx Saved</div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#0F766E' }}>RM {fmt(m.totalRM)}</div>
                </div>
              </div>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#059669', background: '#ECFDF5', padding: '2px 8px', borderRadius: '99px' }}>
                ↑ 15% <span style={{ fontSize: '9px', color: '#64748B', fontWeight: 500 }}>vs last mo</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- SUB-COMPONENT 4: BOTTOM 3 ANALYTICS CHARTS ---
export function BottomAnalyticsRow({ site, day, currentHour }) {
  // Aggregate daily totals for energy mix
  const { totalSolar, totalBattery, totalGenset, totalEnergy, solarPct, battPct } = useMemo(() => {
    const s = Math.round(day.hours.reduce((acc, h) => acc + h.solar, 0));
    const b = Math.round(day.hours.reduce((acc, h) => acc + h.discharge, 0));
    const g = Math.round(day.hours.reduce((acc, h) => acc + h.genset, 0));
    const total = Math.max(1, s + b + g);
    return {
      totalSolar: s,
      totalBattery: b,
      totalGenset: g,
      totalEnergy: total,
      solarPct: Math.round((s / total) * 100),
      battPct: Math.round((b / total) * 100),
    };
  }, [day]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
      {/* 1. Energy Mix (Today) */}
      <div className="card" style={{ padding: '18px 20px', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px' }}>
        <h2 style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', marginBottom: '14px' }}>
          Energy Mix (Today)
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {/* SVG Donut Chart */}
          <div style={{ position: 'relative', width: '110px', height: '110px', flexShrink: 0 }}>
            <svg width="110" height="110" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle cx="50" cy="50" r="38" fill="none" stroke="#F1F5F9" strokeWidth="12" />
              {/* Solar segment (Green) */}
              <circle
                cx="50"
                cy="50"
                r="38"
                fill="none"
                stroke="#059669"
                strokeWidth="12"
                strokeDasharray={`${(solarPct / 100) * 238.76} 238.76`}
                strokeDashoffset="0"
                transform="rotate(-90 50 50)"
                strokeLinecap="round"
              />
              {/* Battery segment (Orange) */}
              <circle
                cx="50"
                cy="50"
                r="38"
                fill="none"
                stroke="#D97706"
                strokeWidth="12"
                strokeDasharray={`${(battPct / 100) * 238.76} 238.76`}
                strokeDashoffset={`-${(solarPct / 100) * 238.76}`}
                transform="rotate(-90 50 50)"
              />
            </svg>
            {/* Center total */}
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', lineHeight: 1.1 }}>{totalEnergy}</div>
              <div style={{ fontSize: '9px', color: '#64748B', fontWeight: 600 }}>kWh total</div>
            </div>
          </div>

          {/* Legend */}
          <div style={{ display: 'grid', gap: '6px', fontSize: '11px', flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#0F172A', fontWeight: 600 }}>
                <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#059669', marginRight: '6px' }} />
                Solar
              </span>
              <span style={{ color: '#64748B', fontWeight: 700 }}>{solarPct}% ({totalSolar} kWh)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#0F172A', fontWeight: 600 }}>
                <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#D97706', marginRight: '6px' }} />
                Battery
              </span>
              <span style={{ color: '#64748B', fontWeight: 700 }}>{battPct}% ({totalBattery} kWh)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#0F172A', fontWeight: 600 }}>
                <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#94A3B8', marginRight: '6px' }} />
                Generator
              </span>
              <span style={{ color: '#94A3B8', fontWeight: 600 }}>0% (0 kWh)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#0F172A', fontWeight: 600 }}>
                <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#CBD5E1', marginRight: '6px' }} />
                Grid
              </span>
              <span style={{ color: '#94A3B8', fontWeight: 600 }}>0% (0 kWh)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Battery SOC Trend */}
      <div className="card" style={{ padding: '18px 20px', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', margin: 0 }}>Battery SOC Trend</h2>
          <span style={{ fontSize: '10px', color: '#64748B', fontWeight: 700, background: '#F1F5F9', padding: '2px 6px', borderRadius: '4px' }}>
            {site.bessKWh} kWh
          </span>
        </div>
        {/* SVG Area Line Chart */}
        <div style={{ height: '110px', width: '100%', position: 'relative' }}>
          <svg width="100%" height="90" viewBox="0 0 280 80" preserveAspectRatio="none">
            {/* Guide Lines */}
            <line x1="0" y1="10" x2="280" y2="10" stroke="#F1F5F9" strokeWidth="1" />
            <line x1="0" y1="40" x2="280" y2="40" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="0" y1="75" x2="280" y2="75" stroke="#F1F5F9" strokeWidth="1" />

            {/* Gradient definition */}
            <defs>
              <linearGradient id="socGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Area Path */}
            {(() => {
              const points = day.hours.map((h, i) => {
                const x = (i / 23) * 280;
                const y = 75 - h.soc * 65;
                return `${x},${y}`;
              });
              const dArea = `M 0,75 L ${points.join(' L ')} L 280,75 Z`;
              const dLine = `M ${points.join(' L ')}`;
              const currentX = (currentHour / 23) * 280;
              const currentY = 75 - (day.hours[currentHour]?.soc || 0.2) * 65;

              return (
                <>
                  <path d={dArea} fill="url(#socGradient)" />
                  <path d={dLine} fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" />
                  <circle cx={currentX} cy={currentY} r="4" fill="#059669" stroke="#FFFFFF" strokeWidth="2" />
                </>
              );
            })()}
          </svg>
          {/* Axis Labels */}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#94A3B8', marginTop: '4px' }}>
            <span>12am</span>
            <span>6am</span>
            <span>12pm</span>
            <span>6pm</span>
            <span>12am</span>
          </div>
        </div>
      </div>

      {/* 3. Site Load vs Solar Generation */}
      <div className="card" style={{ padding: '18px 20px', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', margin: 0 }}>Site Load vs Solar</h2>
          <div style={{ display: 'flex', gap: '10px', fontSize: '10px' }}>
            <span style={{ color: '#DC2626', fontWeight: 600 }}>● Load</span>
            <span style={{ color: '#D97706', fontWeight: 600 }}>● Solar</span>
          </div>
        </div>
        {/* SVG Dual-Line Chart */}
        <div style={{ height: '110px', width: '100%', position: 'relative' }}>
          <svg width="100%" height="90" viewBox="0 0 280 80" preserveAspectRatio="none">
            {/* Guide Lines */}
            <line x1="0" y1="10" x2="280" y2="10" stroke="#F1F5F9" strokeWidth="1" />
            <line x1="0" y1="40" x2="280" y2="40" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="0" y1="75" x2="280" y2="75" stroke="#F1F5F9" strokeWidth="1" />

            {(() => {
              const maxVal = Math.max(1, ...day.hours.map((h) => Math.max(h.solar, h.load)));
              const solarPoints = day.hours.map((h, i) => {
                const x = (i / 23) * 280;
                const y = 75 - (h.solar / maxVal) * 65;
                return `${x},${y}`;
              });
              const loadPoints = day.hours.map((h, i) => {
                const x = (i / 23) * 280;
                const y = 75 - (h.load / maxVal) * 65;
                return `${x},${y}`;
              });

              return (
                <>
                  <path d={`M ${solarPoints.join(' L ')}`} fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round" />
                  <path d={`M ${loadPoints.join(' L ')}`} fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" />
                </>
              );
            })()}
          </svg>
          {/* Axis Labels */}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#94A3B8', marginTop: '4px' }}>
            <span>12am</span>
            <span>6am</span>
            <span>12pm</span>
            <span>6pm</span>
            <span>12am</span>
          </div>
        </div>
      </div>
    </div>
  );
}
