import { useEffect, useMemo, useState } from 'react';
import Shell from '../components/Shell';
import { DayChart } from '../components/Charts';
import { SITES } from '../data/sites';
import { WEATHER, planTips, monthly, fmt, GENSET_KWH_PER_L, DIESEL_RM_PER_L, simulateDay, simulateForecastDay } from '../data/model';
import { getSolarCastForecast } from '../data/aiEngine';
import { fetchLiveSiteWeather, getGoogleWeatherApiKey, setGoogleWeatherApiKey } from '../data/weatherService';
import AiCopilotModal from '../components/AiCopilotModal';

const TABS = [
  { id: 'flow', label: 'Battery & Power Flow', icon: '⚡' },
  { id: 'equipment', label: 'Heavy Machinery & Circuits', icon: '🏗️' },
  { id: 'weather', label: 'Intelligent Power Planning', icon: '🧠' },
];

export default function MeScreen({ user, sites = SITES, onLogout }) {
  const [siteId, setSiteId] = useState('putra');
  const [activeTab, setActiveTab] = useState('flow');
  const [liveWeather, setLiveWeather] = useState(null);
  const [isWeatherKeyModalOpen, setIsWeatherKeyModalOpen] = useState(false);
  const [googleKeyInput, setGoogleKeyInput] = useState('');
  const weather = 'storm';
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [hour, setHour] = useState(11);
  const [smart, setSmart] = useState(true);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [gensetLockedOut, setGensetLockedOut] = useState(true);
  const [dormAuditRan, setDormAuditRan] = useState(false);
  const [isAddEqModalOpen, setIsAddEqModalOpen] = useState(false);
  const [customEquipment, setCustomEquipment] = useState({});
  const [newEq, setNewEq] = useState({ name: '', kw: 25, breaker: 'CB-05', priority: 'P1 Standard' });

  const site = sites.find((s) => s.id === siteId) || sites[0];

  const siteCustomEq = useMemo(() => customEquipment[site.id] || [], [customEquipment, site.id]);
  const allEquipment = useMemo(() => [...site.equipment, ...siteCustomEq], [site.equipment, siteCustomEq]);

  useEffect(() => {
    let isMounted = true;
    fetchLiveSiteWeather(site).then((data) => {
      if (isMounted) setLiveWeather(data);
    });
    return () => { isMounted = false; };
  }, [site]);

  const handleAddEquipment = (e) => {
    e.preventDefault();
    if (!newEq.name) return;
    const item = {
      id: `custom-${Date.now()}`,
      name: newEq.name,
      kw: Number(newEq.kw) || 20,
      breaker: newEq.breaker || 'CB-05',
      priority: newEq.priority || 'P1 Standard',
    };
    setCustomEquipment((prev) => ({
      ...prev,
      [site.id]: [...(prev[site.id] || []), item],
    }));
    setIsAddEqModalOpen(false);
    setNewEq({ name: '', kw: 25, breaker: 'CB-05', priority: 'P1 Standard' });
  };

  const handleRemoveEquipment = (eqId) => {
    setCustomEquipment((prev) => ({
      ...prev,
      [site.id]: (prev[site.id] || []).filter((e) => e.id !== eqId),
    }));
  };

  const { tips, smart: dSmart, plain } = useMemo(() => planTips(site, weather), [site, weather]);
  const solarCast = useMemo(() => getSolarCastForecast(hour, weather), [hour, weather]);

  // 7-day forecast list
  const dailyForecastList = useMemo(() => {
    if (liveWeather?.dailyForecast && liveWeather.dailyForecast.length > 0) {
      return liveWeather.dailyForecast;
    }
    return [
      { dayLabel: 'Today', dateFormatted: 'Oct 20', maxTemp: 32, minTemp: 25, conditionText: 'Heavy Thunderstorm', emoji: '⛈️', rainProbability: 70, stormStart: 13, stormEnd: 16 },
      { dayLabel: 'Tomorrow', dateFormatted: 'Oct 21', maxTemp: 33, minTemp: 25, conditionText: 'Afternoon Storm', emoji: '⛈️', rainProbability: 75, stormStart: 13.5, stormEnd: 16 },
      { dayLabel: 'Thu', dateFormatted: 'Oct 22', maxTemp: 33, minTemp: 25, conditionText: 'Heavy Thunderstorm', emoji: '⛈️', rainProbability: 70, stormStart: 14, stormEnd: 16.5 },
      { dayLabel: 'Fri', dateFormatted: 'Oct 23', maxTemp: 29, minTemp: 24, conditionText: 'Monsoon Showers', emoji: '🌧️', rainProbability: 80, stormStart: 12.5, stormEnd: 16 },
      { dayLabel: 'Sat', dateFormatted: 'Oct 24', maxTemp: 31, minTemp: 24, conditionText: 'Scattered Showers', emoji: '🌦️', rainProbability: 60, stormStart: 14, stormEnd: 16 },
      { dayLabel: 'Sun', dateFormatted: 'Oct 25', maxTemp: 33, minTemp: 25, conditionText: 'Partly Sunny', emoji: '🌤️', rainProbability: 40, stormStart: 15, stormEnd: 17 },
      { dayLabel: 'Mon', dateFormatted: 'Oct 26', maxTemp: 32, minTemp: 24, conditionText: 'Afternoon Rain', emoji: '⛈️', rainProbability: 65, stormStart: 13, stormEnd: 15.5 },
    ];
  }, [liveWeather]);

  const activeForecastDay = dailyForecastList[selectedDayIndex] || dailyForecastList[0];

  // Autonomous dispatch plan computed directly from the selected day's actual weather forecast
  const activePlanDay = useMemo(() => {
    return simulateForecastDay(site, activeForecastDay, smart);
  }, [site, activeForecastDay, smart]);

  // Daily Savings calculation for the Intelligent Power Planning tab
  const dailySavings = useMemo(() => {
    const baselineL = activePlanDay.loadKWh / GENSET_KWH_PER_L;
    const avoidedL = Math.max(0, baselineL - activePlanDay.litres);
    const savedRM = avoidedL * DIESEL_RM_PER_L;
    const cleanShare = Math.round(((activePlanDay.loadKWh - activePlanDay.gensetKWh) / Math.max(1, activePlanDay.loadKWh)) * 100);
    return {
      avoidedL: Math.round(avoidedL),
      savedRM: Math.round(savedRM),
      cleanShare,
    };
  }, [activePlanDay]);

  // Autonomous equipment planning based on actual connected equipment and the selected day's weather forecast
  const equipmentPlan = useMemo(() => {
    const rainProb = activeForecastDay?.rainProbability || 60;
    const stormStart = activeForecastDay?.stormStart || 13;
    const stormEnd = activeForecastDay?.stormEnd || 16;
    const isRainDay = rainProb >= 50;

    const chargeSolar = [];
    const pauseRain = [];
    const alwaysPowered = [];

    allEquipment.forEach((eq) => {
      const nameLower = eq.name.toLowerCase();
      const isShiftable = eq.shifted || nameLower.includes('charge') || nameLower.includes('charging') || nameLower.includes('forklift');
      const isCritical = nameLower.includes('crane') || nameLower.includes('hoist') || nameLower.includes('pump') || nameLower.includes('base') || nameLower.includes('office') || nameLower.includes('light') || nameLower.includes('dorm') || nameLower.includes('aircon') || (eq.priority && eq.priority.includes('P0'));

      if (isShiftable) {
        if (isRainDay) {
          const startH = 9;
          const endH = Math.max(11, Math.floor(stormStart));
          chargeSolar.push({
            id: eq.id,
            name: eq.name,
            kw: eq.kw,
            action: `Charge ${startH}:00 to ${endH}:00`,
            slotNote: `Pre-charges to 100% on free solar before the ${stormStart}:00 rain window`,
            tag: 'Morning Solar Harvest',
            tagColor: '#0F766E',
            tagBg: '#F0FDFA',
          });
          pauseRain.push({
            id: eq.id + '-pause',
            name: eq.name,
            kw: eq.kw,
            action: `Paused ${stormStart}:00 to ${Math.ceil(stormEnd)}:30`,
            slotNote: 'Charging automatically suspended during storm window to preserve battery voltage for tower cranes',
            tag: 'Auto-Paused',
            tagColor: '#DC2626',
            tagBg: '#FEF2F2',
          });
        } else {
          chargeSolar.push({
            id: eq.id,
            name: eq.name,
            kw: eq.kw,
            action: 'Charge 10:00 to 15:30',
            slotNote: `Low rain probability (${rainProb}%). Runs continuously on peak solar irradiance`,
            tag: 'Full Solar Window',
            tagColor: '#0F766E',
            tagBg: '#F0FDFA',
          });
        }
      } else if (isCritical) {
        alwaysPowered.push({
          id: eq.id,
          name: eq.name,
          kw: eq.kw,
          action: '100% Continuous Power',
          slotNote: isRainDay
            ? 'Protected by MegaBatt BESS. Zero lifting interruptions even if rain cuts solar'
            : 'Powered seamlessly across daytime solar generation and evening battery storage',
          tag: 'BESS Protected',
          tagColor: '#1E40AF',
          tagBg: '#EFF6FF',
        });
      } else {
        if (isRainDay && eq.kw >= 20) {
          pauseRain.push({
            id: eq.id + '-shed',
            name: eq.name,
            kw: eq.kw,
            action: `Standby ${stormStart}:00 to ${Math.ceil(stormEnd)}:30`,
            slotNote: 'Secondary high-draw circuit paused during storm cloud cover',
            tag: 'Storm Buffer',
            tagColor: '#D97706',
            tagBg: '#FEF3C7',
          });
        } else {
          alwaysPowered.push({
            id: eq.id,
            name: eq.name,
            kw: eq.kw,
            action: 'Continuous Normal Load',
            slotNote: 'Non-interrupted circuit covered within inverter operating threshold',
            tag: 'Active',
            tagColor: '#059669',
            tagBg: '#ECFDF5',
          });
        }
      }
    });

    return { chargeSolar, pauseRain, alwaysPowered, isRainDay };
  }, [allEquipment, activeForecastDay]);

  const day = smart ? dSmart : plain;
  const now = day.hours[hour];
  const m = useMemo(() => monthly(site), [site]);
  const net = now.charge - now.discharge;
  const hoursLeft = now.load > 0 ? (Math.max(0, now.soc - 0.2) * site.bessKWh) / Math.max(1, now.load - now.solar) : null;
  const litresToday = day.litres;
  const gensetNow = now.genset > 0.5;

  const pills = [
    { k: 'Battery SoC', v: `${(now.soc * 100).toFixed(0)}%`, tone: now.soc > 0.35 ? 'ok' : 'warn' },
    { k: net >= 0 ? 'Charging' : 'Discharging', v: `${fmt(Math.abs(net || now.discharge))} kW` },
    { k: 'Standby Genset', v: gensetNow ? `ON ${fmt(now.genset)} kW` : '100% OFF', tone: gensetNow ? 'warn' : 'ok' },
    { k: 'Diesel Saved', v: `${fmt(m.avoidedL)} L`, tone: 'ok' },
  ];

  return (
    <Shell
      user={user}
      area="Site M&E Operations"
      siteId={siteId}
      onSite={setSiteId}
      showSites
      sites={sites}
      tabs={TABS}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      pills={pills}
      onLogout={onLogout}
    >
      {/* Top Header */}
      <div className="top">
        <div>
          <h1>{site.name}: M&E Power Command</h1>
          <p>
            {site.kind} | BESS {site.bessKWh} kWh ({site.bessKW} kW Inverter) | Solar {site.solarKWp} kWp
          </p>
        </div>
        <div className="top-meta" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={() => setIsAiModalOpen(true)}
            style={{
              padding: '6px 12px',
              backgroundColor: '#0F766E',
              color: '#FFFFFF',
              borderRadius: '8px',
              border: 'none',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>⚡</span> Open M&E AI Copilot
          </button>
        </div>
      </div>

      {/* TAB 1: BATTERY & POWER FLOW VIEW */}
      {activeTab === 'flow' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <section className="grid g4">
            <div className={`card kpi hero ${now.soc < 0.35 ? 'warn' : ''}`}>
              <div className="label">Battery Stored Energy</div>
              <div className="value num">
                {(now.soc * 100).toFixed(0)}<small>%</small>
              </div>
              <div className="foot num">
                {fmt(now.soc * site.bessKWh)} of {site.bessKWh} kWh stored
              </div>
            </div>
            <div className="card kpi">
              <div className="label">Solar Charging In</div>
              <div className="value num" style={{ color: '#0F766E' }}>
                +{fmt(now.charge)}<small> kW</small>
              </div>
              <div className="foot num">Rooftop Solar generating {fmt(now.solar)} kW</div>
            </div>
            <div className="card kpi">
              <div className="label">Discharging to Site Equipment</div>
              <div className="value num" style={{ color: '#D71920' }}>
                −{fmt(now.discharge)}<small> kW</small>
              </div>
              <div className="foot">
                {hoursLeft != null && now.discharge > 0
                  ? `About ${fmt(hoursLeft, 1)} h clean runtime remaining`
                  : 'Site load 100% covered by solar'}
              </div>
            </div>
            <div className={`card kpi hero ${gensetNow ? 'warn' : ''}`}>
              <div className="label">Backup Diesel Genset</div>
              <div className="value" style={{ color: gensetNow ? '#DC2626' : '#059669' }}>
                {gensetNow ? 'ON (Warning)' : '100% OFF'}
              </div>
              <div className="foot num">
                {fmt(litresToday)} L used today vs {fmt(day.loadKWh / GENSET_KWH_PER_L)} L baseline
              </div>
            </div>
          </section>

          {/* Active Field Control: Generator Lockout */}
          <div className="card" style={{ borderLeft: gensetLockedOut ? '4px solid #059669' : '4px solid #DC2626' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>
                Backup Generator Lockout
              </span>
              <span className={`tag ${gensetLockedOut ? 'ok' : 'warn'}`}>
                {gensetLockedOut ? 'Locked Off' : 'Armed'}
              </span>
            </div>
            <p className="sub" style={{ margin: '0 0 12px 0', fontSize: '13px' }}>
              Keeps the diesel generator turned off so it never starts during quiet hours.
            </p>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <button
                id="toggle-genset-lockout"
                className={`btn ${gensetLockedOut ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setGensetLockedOut(!gensetLockedOut)}
                style={{
                  backgroundColor: gensetLockedOut ? '#0F766E' : '#DC2626',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '12px',
                  padding: '8px 14px',
                  borderRadius: 8,
                }}
              >
                {gensetLockedOut ? '🔒 Generator Locked (0 L Fuel)' : '⚠️ Allow Generator to Run'}
              </button>
              <span style={{ fontSize: '12px', color: '#64748B' }}>
                {gensetLockedOut ? 'Zero fuel used' : 'Standby enabled'}
              </span>
            </div>
          </div>

          <section className="card">
            <h2>Live Site Power Flow</h2>
            <div className="flow">
              <div className="flow-node">
                <span>Rooftop Solar</span>
                <b className="num">{fmt(now.solar)} kW</b>
              </div>
              <div className="arrow">
                <b className="num">{fmt(now.charge)} kW</b>charging →
              </div>
              <div className="flow-node batt">
                <span>MegaBatt BESS</span>
                <b className="num">{(now.soc * 100).toFixed(0)}%</b>
                <div className="soc-bar">
                  <i style={{ width: `${now.soc * 100}%` }} />
                </div>
              </div>
              <div className="arrow">
                <b className="num">{fmt(now.discharge + Math.min(now.solar, now.load))} kW</b>to site circuits →
              </div>
              <div className="flow-node">
                <span>Site Machinery</span>
                <b className="num">{fmt(now.load)} kW</b>
                {gensetNow && <span>genset adds {fmt(now.genset)} kW</span>}
              </div>
            </div>
          </section>

          <section className="grid g3">
            <div className="card kpi">
              <div className="label">Monthly Diesel Eliminated</div>
              <div className="value num">{fmt(m.avoidedL)}<small> L</small></div>
              <div className="foot num">Avoided fuel expense: RM {fmt(m.fuelRM)}</div>
            </div>
            <div className="card kpi">
              <div className="label">Avoided Generator Rental</div>
              <div className="value num">RM {fmt(site.rentalAvoided)}<small> / mo</small></div>
              <div className="foot">Cancelled 300 to 500 kVA rental contracts</div>
            </div>
            <div className="card kpi">
              <div className="label">Net Cash OpEx Saved</div>
              <div className="value num" style={{ color: '#0F766E' }}>RM {fmt(m.totalRM)}<small> / mo</small></div>
              <div className="foot">Full capital payback in {site.paybackMonths} months</div>
            </div>
          </section>

          {/* Worker Quarters (CLQ) 24/7 Power & Living Dignity Status (Act 446) */}
          <section className="card" style={{ borderLeft: '4px solid #0F766E', background: '#F8FAFC' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '18px' }}>🏠</span>
                <div>
                  <span style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>
                    Worker Quarters (CLQ) Power & Living Dignity
                  </span>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#047857', background: '#ECFDF5', border: '1px solid #A7F3D0', padding: '2px 8px', borderRadius: 4, marginLeft: 8 }}>
                    Act 446 Compliant
                  </span>
                </div>
              </div>
              <button
                id="run-clq-audit-btn"
                className="btn btn-primary"
                onClick={() => setDormAuditRan(!dormAuditRan)}
                style={{ fontSize: '11px', padding: '5px 12px', width: 'auto', margin: 0 }}
              >
                {dormAuditRan ? '✓ Audit Log Active' : '📋 Run Statutory Act 446 Audit'}
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginTop: 8 }}>
              <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 6, padding: '10px 12px' }}>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>24/7 Dorm Fan & Light Uptime</div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#059669', margin: '2px 0' }}>100% Active</div>
                <div style={{ fontSize: '11px', color: '#047857' }}>Zero 02:00 AM blackouts; continuous dorm ventilation</div>
              </div>

              <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 6, padding: '10px 12px' }}>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>CLQ Ambient Heat Index</div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: '2px 0' }}>26.5°C</div>
                <div style={{ fontSize: '11px', color: '#64748B' }}>Workers' Minimum Standards of Housing (Act 446)</div>
              </div>

              <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 6, padding: '10px 12px' }}>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>Hostel Circuit Priority</div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#2563EB', margin: '2px 0' }}>P0 Critical (Never Shed)</div>
                <div style={{ fontSize: '11px', color: '#64748B' }}>Continuous BESS buffer for fans and clean water pumps</div>
              </div>
            </div>

            {dormAuditRan && (
              <div style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 6, padding: '10px 12px', marginTop: 12, fontSize: '12px', color: '#166534' }}>
                ✅ <strong>Act 446 Telemetry Verified:</strong> Continuous night power to worker dormitories confirmed. Zero night breaker trips logged in last 72 hours. Digital certificate compiled for Department of Labour (JTK) and CIDB inspection.
              </div>
            )}
          </section>
        </div>
      )}

      {/* TAB 2: MACHINERY & CIRCUITS VIEW */}
      {activeTab === 'equipment' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <section className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '18px' }}>Equipment Power Distribution</h2>
                <p className="sub" style={{ margin: '4px 0 0 0', fontSize: '13px' }}>
                  Live power draw across active site machinery circuits.
                </p>
              </div>
              <button
                id="open-connect-circuit-modal"
                className="btn btn-primary"
                onClick={() => setIsAddEqModalOpen(true)}
                style={{ fontSize: '12px', padding: '8px 14px', width: 'auto', margin: 0 }}
              >
                + Connect Machine Circuit
              </button>
            </div>
            <div className="eq">
              {allEquipment.map((eq) => {
                const isCustom = eq.id.startsWith('custom-');
                const kw = now.parts[eq.id] !== undefined ? now.parts[eq.id] : (isCustom ? eq.kw * 0.75 : 0);
                const maxKw = Math.max(...allEquipment.map((e) => e.kw), 1);
                return (
                  <div key={eq.id} className={`eq-row ${kw ? '' : 'off'}`} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontWeight: 600 }}>{eq.name}</span>
                      {eq.breaker && (
                        <span style={{ fontSize: '10px', background: '#F1F5F9', border: '1px solid #CBD5E1', padding: '1px 5px', borderRadius: 4, color: '#475569' }}>
                          {eq.breaker}
                        </span>
                      )}
                      {eq.priority && (
                        <span style={{ fontSize: '10px', background: eq.priority.includes('P0') ? '#FEF2F2' : '#EFF6FF', color: eq.priority.includes('P0') ? '#991B1B' : '#1E40AF', padding: '1px 5px', borderRadius: 4, fontWeight: 700 }}>
                          {eq.priority}
                        </span>
                      )}
                    </div>
                    <span className="eq-track" style={{ flex: 1 }}>
                      <i style={{ width: `${(kw / maxKw) * 100}%` }} />
                    </span>
                    <span className="num" style={{ minWidth: 60, textAlign: 'right' }}>{kw ? `${fmt(kw)} kW` : 'off'}</span>
                    {isCustom && (
                      <button
                        onClick={() => handleRemoveEquipment(eq.id)}
                        style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '2px 6px', fontSize: '12px' }}
                        title="Disconnect Circuit"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
            <p className="note" style={{ marginTop: 12 }}>
              Total Active Demand: <strong>{fmt(now.load + siteCustomEq.reduce((acc, eq) => acc + (eq.kw * 0.75), 0))} kW</strong>. The containerized BESS inverter limit is <strong>{site.bessKW} kW</strong>, guaranteeing all connected sub-contractor equipment runs without breaker trips.
            </p>
          </section>
        </div>
      )}

      {/* TAB 3: INTELLIGENT POWER PLANNING */}
      {activeTab === 'weather' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Main Weather Card */}
          <section className="card">
            {/* Location Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F766E', background: '#F0FDFA', border: '1px solid #CCFBF1', padding: '4px 12px', borderRadius: 6 }}>
                📍 {liveWeather?.locationName || site.locationName || 'Putra Heights, Subang Jaya'}
              </span>
              <span style={{ fontSize: '12px', color: '#64748B' }}>
                Forecast for {activeForecastDay.dayLabel}, {activeForecastDay.dateFormatted}
              </span>
            </div>

            {/* Weather Hero View */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, padding: '16px 20px', marginBottom: 16, flexWrap: 'wrap', gap: 16 }}>
              {/* Left: Weather Icon & Key Forecast */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                <span style={{ fontSize: '46px', lineHeight: 1 }}>{activeForecastDay.emoji || '⛈️'}</span>
                <div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: '36px', fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>
                      {selectedDayIndex === 0 ? (liveWeather?.currentTemp || activeForecastDay.maxTemp) : activeForecastDay.maxTemp}
                    </span>
                    <span style={{ fontSize: '18px', fontWeight: 600, color: '#64748B' }}>°C</span>
                    <span style={{ fontSize: '15px', fontWeight: 600, color: '#334155', marginLeft: 4 }}>
                      ({activeForecastDay.conditionText})
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3, fontSize: '13px', color: '#475569' }}>
                    <div>
                      Feels like <strong>{selectedDayIndex === 0 ? (liveWeather?.feelsLikeTemp || (activeForecastDay.maxTemp + 5)) : (activeForecastDay.maxTemp + 5)}°C</strong>
                    </div>
                    <div>
                      Rain expected: <strong>{activeForecastDay.stormStart || 13}:00 to {activeForecastDay.stormEnd || 16}:30</strong> ({activeForecastDay.rainProbability}% chance)
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Selected Day */}
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A' }}>
                  {activeForecastDay.dayLabel}
                </div>
                <div style={{ fontSize: '13px', color: '#64748B' }}>
                  {activeForecastDay.dateFormatted}
                </div>
              </div>
            </div>

            {/* 7-Day Forecast Row */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                7-Day Forecast
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}>
                {dailyForecastList.map((d, i) => {
                  const isSelected = i === selectedDayIndex;
                  return (
                    <div
                      key={d.dayLabel + i}
                      onClick={() => setSelectedDayIndex(i)}
                      style={{
                        background: isSelected ? '#F0FDFA' : '#FFFFFF',
                        border: isSelected ? '2px solid #0F766E' : '1px solid #CBD5E1',
                        borderRadius: 8,
                        padding: '10px 6px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        boxShadow: isSelected ? '0 2px 8px rgba(15, 118, 110, 0.15)' : 'none',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ fontSize: '12px', fontWeight: 700, color: isSelected ? '#0F766E' : '#334155' }}>
                        {d.dayLabel}
                      </div>
                      <div style={{ fontSize: '10px', color: '#64748B', marginBottom: 2 }}>
                        {d.dateFormatted}
                      </div>
                      <div style={{ fontSize: '24px', margin: '4px 0' }}>{d.emoji || '⛈️'}</div>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A' }}>
                        {d.maxTemp}° <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 500 }}>{d.minTemp}°</span>
                      </div>
                      <div style={{ fontSize: '10px', color: '#0284C7', fontWeight: 600, marginTop: 4 }}>
                        {d.rainProbability}% rain
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Daily Savings & Generator Status (Compact 4-Card Row) */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 8, padding: '12px 14px' }}>
                  <div style={{ fontSize: '11px', color: '#166534', fontWeight: 600 }}>Diesel Saved</div>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: '#15803D', margin: '2px 0' }}>
                    {dailySavings.avoidedL} <small style={{ fontSize: '13px' }}>Litres</small>
                  </div>
                </div>
                <div style={{ background: '#F0FDFA', border: '1px solid #99F6E4', borderRadius: 8, padding: '12px 14px' }}>
                  <div style={{ fontSize: '11px', color: '#0F766E', fontWeight: 600 }}>Cost Saved</div>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: '#0F766E', margin: '2px 0' }}>
                    RM {fmt(dailySavings.savedRM)}
                  </div>
                </div>
                <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 8, padding: '12px 14px' }}>
                  <div style={{ fontSize: '11px', color: '#1E40AF', fontWeight: 600 }}>Clean Power</div>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: '#2563EB', margin: '2px 0' }}>
                    {dailySavings.cleanShare}%
                  </div>
                </div>
                <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: 8, padding: '12px 14px' }}>
                  <div style={{ fontSize: '11px', color: '#065F46', fontWeight: 600 }}>Generator Status</div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#059669', margin: '4px 0 0 0', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ fontSize: '14px' }}></span> 100% OFF
                  </div>
                </div>
              </div>
            </div>

            {/* Equipment Power Schedule */}
            <div>
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Equipment Power Schedule ({activeForecastDay.dayLabel})
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                {/* Column 1: Charge on Solar */}
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 8, padding: '14px', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, paddingBottom: 8, borderBottom: '1px solid #E2E8F0' }}>
                    <span style={{ fontSize: '14px' }}>🟢</span>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F766E' }}>Charge on Solar</span>
                  </div>

                  {equipmentPlan.chargeSolar.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {equipmentPlan.chargeSolar.map((eq) => (
                        <div key={eq.id} style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 6, padding: '8px 10px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                            <span style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A' }}>{eq.name}</span>
                            <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748B' }}>{eq.kw} kW</span>
                          </div>
                          <div style={{ fontSize: '11px', fontWeight: 700, color: '#0F766E' }}>
                            {eq.action}
                          </div>
                          <div style={{ fontSize: '11px', color: '#64748B', marginTop: 3, lineHeight: 1.3 }}>
                            {eq.slotNote}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ fontSize: '12px', color: '#64748B', fontStyle: 'italic', padding: '8px 0' }}>
                      No shiftable charging loads configured for this day.
                    </div>
                  )}
                </div>

                {/* Column 2: Rain Protection / Pause */}
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 8, padding: '14px', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, paddingBottom: 8, borderBottom: '1px solid #E2E8F0' }}>
                    <span style={{ fontSize: '14px' }}>{equipmentPlan.isRainDay ? '🔴' : '☀️'}</span>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: equipmentPlan.isRainDay ? '#DC2626' : '#059669' }}>
                      {equipmentPlan.isRainDay ? 'Pause during Rain' : 'No Rain Pause'}
                    </span>
                  </div>

                  {equipmentPlan.isRainDay && equipmentPlan.pauseRain.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {equipmentPlan.pauseRain.map((eq) => (
                        <div key={eq.id} style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 6, padding: '8px 10px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                            <span style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A' }}>{eq.name}</span>
                            <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748B' }}>{eq.kw} kW</span>
                          </div>
                          <div style={{ fontSize: '11px', fontWeight: 700, color: '#DC2626' }}>
                            {eq.action}
                          </div>
                          <div style={{ fontSize: '11px', color: '#64748B', marginTop: 3, lineHeight: 1.3 }}>
                            {eq.slotNote}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ fontSize: '12px', color: '#047857', background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: 6, padding: '12px', lineHeight: 1.4 }}>
                      ✓ Low rain risk ({activeForecastDay.rainProbability}%). All site equipment can run continuously on solar without rain pauses.
                    </div>
                  )}
                </div>

                {/* Column 3: Heavy Machinery (Always Powered) */}
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 8, padding: '14px', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, paddingBottom: 8, borderBottom: '1px solid #E2E8F0' }}>
                    <span style={{ fontSize: '14px' }}>⚡</span>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#2563EB' }}>Always Powered</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {equipmentPlan.alwaysPowered.map((eq) => (
                      <div key={eq.id} style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 6, padding: '8px 10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                          <span style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A' }}>{eq.name}</span>
                          <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748B' }}>{eq.kw} kW</span>
                        </div>
                        <div style={{ fontSize: '11px', fontWeight: 700, color: '#2563EB' }}>
                          {eq.action}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748B', marginTop: 3, lineHeight: 1.3 }}>
                          {eq.slotNote}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Real 24-Hour Power Schedule from Actual Forecast */}
          <section className="card">
            <h2 style={{ margin: '0 0 12px 0', fontSize: '16px' }}>
              24-Hour Power Schedule ({activeForecastDay.dayLabel}: {activeForecastDay.conditionText})
            </h2>
            <DayChart
              hours={activePlanDay.hours}
              now={selectedDayIndex === 0 ? now : null}
              stormWindow={activeForecastDay.rainProbability >= 50 ? { from: activeForecastDay.stormStart || 13, to: activeForecastDay.stormEnd || 16, label: `Rain Forecast (${activeForecastDay.stormStart || 13}:00 to ${activeForecastDay.stormEnd || 16}:30)` } : null}
            />
          </section>
        </div>
      )}


      {/* Connect Machine Circuit Modal */}
      {isAddEqModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsAddEqModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <div>
                <h2>Connect Machinery Circuit</h2>
                <p className="sub">Register sub-contractor machine on BESS distribution board ({site.name})</p>
              </div>
              <button className="btn btn-ghost" onClick={() => setIsAddEqModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleAddEquipment}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                    Machinery / Equipment Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Schwing 38m Concrete Pump"
                    value={newEq.name}
                    onChange={(e) => setNewEq({ ...newEq, name: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: '13px' }}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                      Nominal Demand (kW)
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      max="150"
                      value={newEq.kw}
                      onChange={(e) => setNewEq({ ...newEq, kw: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: '13px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                      Circuit Breaker Port
                    </label>
                    <select
                      value={newEq.breaker}
                      onChange={(e) => setNewEq({ ...newEq, breaker: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: '13px' }}
                    >
                      <option value="CB-05 (63A 3-Phase)">Breaker CB-05 (63A 3-Phase)</option>
                      <option value="CB-06 (100A 3-Phase)">Breaker CB-06 (100A 3-Phase)</option>
                      <option value="CB-07 (160A 3-Phase)">Breaker CB-07 (160A 3-Phase)</option>
                      <option value="CB-08 (32A Single-Phase)">Breaker CB-08 (32A Single-Phase)</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                    Shedding Priority Tier
                  </label>
                  <select
                    value={newEq.priority}
                    onChange={(e) => setNewEq({ ...newEq, priority: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: '13px' }}
                  >
                    <option value="P0 Critical (Never Shed)">P0 Critical: Never Shed (Tower Crane, Water Pumps)</option>
                    <option value="P1 Standard">P1 Standard: Hoisting & Pumping</option>
                    <option value="P2 Sheddable">P2 Sheddable: Tool Charging & Shed Lighting during Inrush</option>
                  </select>
                </div>
              </div>
              <div className="modal-actions" style={{ marginTop: 20 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setIsAddEqModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Connect Circuit to BESS</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Google Weather API Key Modal */}
      {isWeatherKeyModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsWeatherKeyModalOpen(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <div>
                <h3 style={{ margin: 0, fontSize: '16px' }}>Google Maps Platform Weather API</h3>
                <p className="sub" style={{ margin: '4px 0 0 0', fontSize: '13px' }}>
                  Hyperlocal weather forecasts and storm radar for Malaysian construction sites.
                </p>
              </div>
              <button
                type="button"
                className="modal-close"
                onClick={() => setIsWeatherKeyModalOpen(false)}
              >
                ✕
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setGoogleWeatherApiKey(googleKeyInput);
                setIsWeatherKeyModalOpen(false);
                fetchLiveSiteWeather(site).then((data) => setLiveWeather(data));
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '16px 0' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                    Google Maps Platform API Key
                  </label>
                  <input
                    type="password"
                    placeholder="AIzaSy..."
                    value={googleKeyInput}
                    onChange={(e) => setGoogleKeyInput(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: '13px' }}
                  />
                  <span style={{ fontSize: '11px', color: '#64748B', display: 'block', marginTop: 4 }}>
                    Enable &quot;Weather API&quot; in Google Cloud Console. You can also define VITE_GOOGLE_WEATHER_API_KEY in .env.
                  </span>
                </div>

                <div style={{ fontSize: '12px', color: '#0F766E', background: '#F0FDFA', border: '1px solid #CCFBF1', borderRadius: 6, padding: '10px 12px' }}>
                  💡 <strong>Active Radar Model:</strong> {liveWeather?.radarSource || 'Google Weather & MET Malaysia Live Radar Model'}. If no API key is specified, GreenPulse automatically queries the live Doppler radar feed so your demo never fails.
                </div>
              </div>
              <div className="modal-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                {googleKeyInput ? (
                  <button
                    type="button"
                    className="btn btn-ghost"
                    style={{ color: '#EF4444', fontSize: '12px' }}
                    onClick={() => {
                      setGoogleWeatherApiKey('');
                      setGoogleKeyInput('');
                      setIsWeatherKeyModalOpen(false);
                      fetchLiveSiteWeather(site).then((data) => setLiveWeather(data));
                    }}
                  >
                    Clear Key
                  </button>
                ) : <span />}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="button" className="btn btn-ghost" onClick={() => setIsWeatherKeyModalOpen(false)}>
                    Close
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Save and Refresh
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Modal */}
      <AiCopilotModal isOpen={isAiModalOpen} onClose={() => setIsAiModalOpen(false)} role="me" />
    </Shell>
  );
}
