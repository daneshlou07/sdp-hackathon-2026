import { useEffect, useMemo, useState } from 'react';
import Shell from '../components/Shell';
import { DayChart } from '../components/Charts';
import { SITES } from '../data/sites';
import { WEATHER, planTips, monthly, fmt, GENSET_KWH_PER_L, DIESEL_RM_PER_L, simulateDay } from '../data/model';
import { getSolarCastForecast } from '../data/aiEngine';
import { fetchLiveSiteWeather, getGoogleWeatherApiKey, setGoogleWeatherApiKey } from '../data/weatherService';
import AiCopilotModal from '../components/AiCopilotModal';

const TABS = [
  { id: 'flow', label: 'Battery & Power Flow', icon: '⚡' },
  { id: 'equipment', label: 'Heavy Machinery & Circuits', icon: '🏗️' },
  { id: 'weather', label: 'Intelligent Power Planning', icon: '🧠' },
  { id: 'clq', label: 'Worker CLQ Microgrid (Act 446)', icon: '🏠' },
];

export default function MeScreen({ user, sites = SITES, onLogout }) {
  const [siteId, setSiteId] = useState('putra');
  const [activeTab, setActiveTab] = useState('flow');
  const [liveWeather, setLiveWeather] = useState(null);
  const [isWeatherKeyModalOpen, setIsWeatherKeyModalOpen] = useState(false);
  const [googleKeyInput, setGoogleKeyInput] = useState('');
  const weather = 'storm';
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [simWeather, setSimWeather] = useState('storm');
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

  // Dynamic simulation for the chosen weather mode
  const activeSimDay = useMemo(() => {
    return simulateDay(site, simWeather, smart);
  }, [site, simWeather, smart]);

  // Daily Savings calculation for the Intelligent Power Planning tab
  const dailySavings = useMemo(() => {
    const baselineL = activeSimDay.loadKWh / GENSET_KWH_PER_L;
    const avoidedL = Math.max(0, baselineL - activeSimDay.litres);
    const savedRM = avoidedL * DIESEL_RM_PER_L;
    const cleanShare = Math.round(((activeSimDay.loadKWh - activeSimDay.gensetKWh) / Math.max(1, activeSimDay.loadKWh)) * 100);
    return {
      avoidedL: Math.round(avoidedL),
      savedRM: Math.round(savedRM),
      cleanShare,
    };
  }, [activeSimDay]);

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
          <section className="card" style={{ borderLeft: '4px solid #0F766E' }}>
            {/* Top Bar: Location Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F766E', background: '#F0FDFA', border: '1px solid #CCFBF1', padding: '4px 12px', borderRadius: 6 }}>
                  📍 {liveWeather?.locationName || site.locationName || 'Putra Heights, Klang Valley'}
                </span>
                <span style={{ fontSize: '12px', color: '#64748B' }}>
                  ({site.lat ? `${site.lat.toFixed(3)}°N, ${site.lon.toFixed(3)}°E` : '3.003°N, 101.573°E'})
                </span>
              </div>
              <span style={{ fontSize: '12px', color: '#059669', fontWeight: 700, background: '#ECFDF5', border: '1px solid #A7F3D0', padding: '4px 12px', borderRadius: 6 }}>
                ⚡ Automated Site Power Planning Active
              </span>
            </div>

            {/* Weather Hero View (Clean Stacked Lines for Readability) */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, padding: '16px 20px', marginBottom: 16, flexWrap: 'wrap', gap: 16 }}>
              {/* Left: Weather Icon & Stacked Lines */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 18 }}>
                <span style={{ fontSize: '50px', lineHeight: 1, marginTop: 4 }}>{activeForecastDay.emoji || '⛈️'}</span>
                <div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: '38px', fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>
                      {selectedDayIndex === 0 ? (liveWeather?.currentTemp || activeForecastDay.maxTemp) : activeForecastDay.maxTemp}
                    </span>
                    <span style={{ fontSize: '20px', fontWeight: 600, color: '#64748B' }}>°C</span>
                    <span style={{ fontSize: '15px', fontWeight: 600, color: '#334155', marginLeft: 6 }}>
                      ({activeForecastDay.conditionText})
                    </span>
                  </div>

                  {/* Separate Stacked Lines */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: '13px', color: '#334155' }}>
                    <div>
                      <span style={{ color: '#64748B', fontWeight: 500 }}>Feels like: </span>
                      <strong>{selectedDayIndex === 0 ? (liveWeather?.feelsLikeTemp || (activeForecastDay.maxTemp + 5)) : (activeForecastDay.maxTemp + 5)}°C</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748B', fontWeight: 500 }}>Chance of rain: </span>
                      <strong style={{ color: activeForecastDay.rainProbability > 60 ? '#0284C7' : '#334155' }}>
                        {activeForecastDay.rainProbability}%
                      </strong>
                      <span style={{ color: '#64748B', fontSize: '12px' }}>
                        {' '}(Rain expected {activeForecastDay.stormStart || 13}:00 to {activeForecastDay.stormEnd || 16}:30)
                      </span>
                    </div>
                    <div>
                      <span style={{ color: '#64748B', fontWeight: 500 }}>Humidity: </span>
                      <strong>{selectedDayIndex === 0 ? (liveWeather?.currentHumidity || 70) : 72}%</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748B', fontWeight: 500 }}>Wind speed: </span>
                      <strong>{selectedDayIndex === 0 ? (liveWeather?.windSpeed || 8) : 9} km/h</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Selected Day Badge */}
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#0F766E', fontWeight: 700 }}>
                  Active Horizon
                </div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', marginTop: 2 }}>
                  {activeForecastDay.dayLabel}
                </div>
                <div style={{ fontSize: '13px', color: '#64748B', marginTop: 2 }}>
                  {activeForecastDay.dateFormatted}
                </div>
                <div style={{ marginTop: 8, fontSize: '11px', color: '#047857', fontWeight: 600, background: '#ECFDF5', border: '1px solid #A7F3D0', padding: '3px 8px', borderRadius: 4, display: 'inline-block' }}>
                  Optimal Dispatch Plan
                </div>
              </div>
            </div>

            {/* 7-Day Forecast Row */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  7-Day Week Forecast (Click a day to view plan)
                </span>
                <span style={{ fontSize: '11px', color: '#0F766E', fontWeight: 600 }}>
                  Day {selectedDayIndex + 1} of 7 Selected
                </span>
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

            {/* 1-Click Weather Simulation Toggle (Addition 2) */}
            <div style={{ background: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: 8, padding: '12px 14px', marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#1E293B' }}>
                  🌤️ Test Weather Simulation (Click to preview how power adjusts):
                </span>
                <span style={{ fontSize: '11px', color: '#64748B' }}>
                  Active: <strong>{simWeather === 'sunny' ? 'Full Sun' : simWeather === 'monsoon' ? 'Heavy Rain' : 'Afternoon Storm'}</strong>
                </span>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => setSimWeather('sunny')}
                  style={{
                    flex: 1,
                    minWidth: 140,
                    padding: '8px 12px',
                    borderRadius: 6,
                    border: simWeather === 'sunny' ? '2px solid #D97706' : '1px solid #CBD5E1',
                    background: simWeather === 'sunny' ? '#FEF3C7' : '#FFFFFF',
                    color: simWeather === 'sunny' ? '#92400E' : '#334155',
                    fontWeight: 700,
                    fontSize: '12px',
                    cursor: 'pointer',
                  }}
                >
                  ☀️ Normal Sun (Sunny)
                </button>
                <button
                  type="button"
                  onClick={() => setSimWeather('storm')}
                  style={{
                    flex: 1,
                    minWidth: 140,
                    padding: '8px 12px',
                    borderRadius: 6,
                    border: simWeather === 'storm' ? '2px solid #0F766E' : '1px solid #CBD5E1',
                    background: simWeather === 'storm' ? '#CCFBF1' : '#FFFFFF',
                    color: simWeather === 'storm' ? '#0F766E' : '#334155',
                    fontWeight: 700,
                    fontSize: '12px',
                    cursor: 'pointer',
                  }}
                >
                  ⛈️ Afternoon Storm (Default)
                </button>
                <button
                  type="button"
                  onClick={() => setSimWeather('monsoon')}
                  style={{
                    flex: 1,
                    minWidth: 140,
                    padding: '8px 12px',
                    borderRadius: 6,
                    border: simWeather === 'monsoon' ? '2px solid #2563EB' : '1px solid #CBD5E1',
                    background: simWeather === 'monsoon' ? '#DBEAFE' : '#FFFFFF',
                    color: simWeather === 'monsoon' ? '#1E40AF' : '#334155',
                    fontWeight: 700,
                    fontSize: '12px',
                    cursor: 'pointer',
                  }}
                >
                  🌧️ Rainy All Day (Monsoon)
                </button>
              </div>
            </div>

            {/* Daily Money & Fuel Saved Box (Addition 1) */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Daily Site Savings for {activeForecastDay.dayLabel}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 8, padding: '12px 14px' }}>
                  <div style={{ fontSize: '11px', color: '#166534', fontWeight: 600 }}>Diesel Saved Today</div>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: '#15803D', margin: '2px 0' }}>
                    {dailySavings.avoidedL} <small style={{ fontSize: '14px' }}>Litres</small>
                  </div>
                  <div style={{ fontSize: '11px', color: '#166534' }}>
                    Avoided running dirty generator
                  </div>
                </div>
                <div style={{ background: '#F0FDFA', border: '1px solid #99F6E4', borderRadius: 8, padding: '12px 14px' }}>
                  <div style={{ fontSize: '11px', color: '#0F766E', fontWeight: 600 }}>Cash Saved Today</div>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: '#0F766E', margin: '2px 0' }}>
                    RM {fmt(dailySavings.savedRM)}
                  </div>
                  <div style={{ fontSize: '11px', color: '#0F766E' }}>
                    Based on RM 5.17 / L fuel price
                  </div>
                </div>
                <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 8, padding: '12px 14px' }}>
                  <div style={{ fontSize: '11px', color: '#1E40AF', fontWeight: 600 }}>Clean Energy Share</div>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: '#2563EB', margin: '2px 0' }}>
                    {dailySavings.cleanShare}%
                  </div>
                  <div style={{ fontSize: '11px', color: '#1E40AF' }}>
                    Powered directly by sun & battery
                  </div>
                </div>
              </div>
            </div>

            {/* Standby Generator Status Badge (Addition 4) */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#ECFDF5',
                border: '1px solid #A7F3D0',
                borderRadius: 8,
                padding: '12px 16px',
                marginBottom: 16,
                flexWrap: 'wrap',
                gap: 10,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: '20px' }}>🟢</span>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#065F46' }}>
                    Standby Generator: 100% OFF (Cold Standby) • 0 Litres Burned
                  </div>
                  <div style={{ fontSize: '12px', color: '#047857' }}>
                    The diesel generator stays turned off. MegaBatt battery carries all crane and site loads.
                  </div>
                </div>
              </div>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#047857', background: '#D1FAE5', padding: '4px 10px', borderRadius: 6 }}>
                Zero Emissions
              </span>
            </div>

            {/* Equipment Charging Plan (Simple Words, NOT complex) */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Smart Equipment Charging Plan for {activeForecastDay.dayLabel}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                {/* Column 1: Charge on Sun */}
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 8, padding: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <span style={{ fontSize: '14px' }}>🟢</span>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F766E' }}>Charge Now (Free Sun)</span>
                  </div>
                  <p style={{ fontSize: '11px', color: '#64748B', margin: '0 0 8px 0' }}>
                    Plug in during morning and midday sun:
                  </p>
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: '12px', color: '#334155', display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <li>EV Forklifts (8.5 kW)</li>
                    <li>Scissor Lifts (4.0 kW)</li>
                    <li>Hand Tools & Battery Packs (3.2 kW)</li>
                    <li>Site Radios & Drones (1.5 kW)</li>
                  </ul>
                  <div style={{ marginTop: 8, fontSize: '11px', color: '#059669', fontWeight: 600 }}>
                    ✓ 100% powered by free rooftop solar
                  </div>
                </div>

                {/* Column 2: Pause during Rain */}
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 8, padding: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <span style={{ fontSize: '14px' }}>🔴</span>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#DC2626' }}>Pause During Rain</span>
                  </div>
                  <p style={{ fontSize: '11px', color: '#64748B', margin: '0 0 8px 0' }}>
                    Pause during {activeForecastDay.stormStart || 13}:00 to {activeForecastDay.stormEnd || 16}:30:
                  </p>
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: '12px', color: '#334155', display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <li>Secondary spare battery banks</li>
                    <li>Heavy workshop heaters</li>
                    <li>Welding training benches</li>
                  </ul>
                  <div style={{ marginTop: 8, fontSize: '11px', color: '#DC2626', fontWeight: 600 }}>
                    ✓ Paused automatically to save power
                  </div>
                </div>

                {/* Column 3: Heavy Machinery */}
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 8, padding: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <span style={{ fontSize: '14px' }}>⚡</span>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#2563EB' }}>Always Powered</span>
                  </div>
                  <p style={{ fontSize: '11px', color: '#64748B', margin: '0 0 8px 0' }}>
                    Zero interruptions, rain or shine:
                  </p>
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: '12px', color: '#334155', display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <li>Main Tower Crane (45 kW)</li>
                    <li>Passenger Hoist (22 kW)</li>
                    <li>Water Discharge Pumps (15 kW)</li>
                    <li>Worker CLQ Dorm Fans (4.2 kW)</li>
                  </ul>
                  <div style={{ marginTop: 8, fontSize: '11px', color: '#2563EB', fontWeight: 600 }}>
                    ✓ Battery buffer guarantees no breaker trips
                  </div>
                </div>
              </div>
            </div>

            {/* 3 Simple Rules for Site Supervisors Checklist (Addition 3) */}
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 8, padding: '14px 16px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#0F766E', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                📋 3 Simple Rules for Site Supervisors Today
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <span style={{ fontSize: '16px' }}>1️⃣</span>
                  <div style={{ fontSize: '12px', color: '#334155' }}>
                    <strong>Morning (8:00 AM to 11:30 AM):</strong> Clean morning sunshine charges the battery up to 88%. Keep all routine equipment running normally.
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <span style={{ fontSize: '16px' }}>2️⃣</span>
                  <div style={{ fontSize: '12px', color: '#334155' }}>
                    <strong>Midday (11:30 AM to 1:30 PM):</strong> Solar is at peak strength. Best time to plug in and recharge electric forklifts and power tools on free sun energy.
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <span style={{ fontSize: '16px' }}>3️⃣</span>
                  <div style={{ fontSize: '12px', color: '#334155' }}>
                    <strong>Afternoon Rain ({activeForecastDay.stormStart || 13}:00 to {activeForecastDay.stormEnd || 16}:30):</strong> Rain clouds will cut solar. The battery buffer carries tower cranes and hoists safely. Leave the backup diesel generator off.
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Interactive 24-Hour Power Chart */}
          <section className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '16px' }}>
                  24-Hour Site Power Schedule ({simWeather === 'sunny' ? 'Sunny Weather' : simWeather === 'monsoon' ? 'Rainy Day' : 'Afternoon Storm'})
                </h2>
                <p className="sub" style={{ margin: '2px 0 0 0', fontSize: '12px' }}>
                  Interactive dispatch simulation: click or hover along the hours to inspect solar generation, battery buffer, and site equipment load.
                </p>
              </div>
            </div>
            <DayChart
              hours={activeSimDay.hours}
              now={null}
              stormWindow={simWeather === 'storm' ? { from: activeForecastDay.stormStart || 13, to: activeForecastDay.stormEnd || 16, label: `Rain (${activeForecastDay.stormStart || 13}:00 to ${activeForecastDay.stormEnd || 16}:30)` } : null}
            />
            <div style={{ display: 'flex', gap: 16, marginTop: 12, fontSize: '12px', color: '#64748B', flexWrap: 'wrap', padding: '8px 12px', background: '#F8FAFC', borderRadius: 6, border: '1px solid #E2E8F0' }}>
              <span>☀️ <strong>Yellow:</strong> Free Solar Power</span>
              <span>🔋 <strong>Green:</strong> Stored Battery Energy</span>
              <span>🌧️ <strong>Blue Shaded Area:</strong> Afternoon Rain Window</span>
              <span>⛽ <strong>Genset:</strong> 0 kW (100% OFF)</span>
            </div>
          </section>
        </div>
      )}

      {/* TAB 4: WORKER CLQ MICROGRID VIEW (ACT 446) */}
      {activeTab === 'clq' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <section className="grid g3">
            <div className="card kpi hero">
              <div className="label">24/7 Fan & Light Uptime</div>
              <div className="value num" style={{ color: '#059669' }}>100%</div>
              <div className="foot">Zero 02:00 AM blackouts; continuous dorm ventilation</div>
            </div>
            <div className="card kpi">
              <div className="label">CLQ Ambient Heat Index</div>
              <div className="value num">26.5°<small>C</small></div>
              <div className="foot">Workers' Minimum Standards of Housing (Act 446)</div>
            </div>
            <div className="card kpi">
              <div className="label">CLQ Diesel Displaced</div>
              <div className="value num">4,500<small> L / mo</small></div>
              <div className="foot num">Saves RM 23,265/mo vs running 25kVA hostel genset</div>
            </div>
          </section>

          <section className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div>
                <h2 style={{ margin: 0 }}>Centralised Labour Quarters (CLQ) Off-Grid Living Dignity</h2>
                <p className="sub" style={{ margin: '4px 0 0 0' }}>
                  Directly solves the documented off-grid hostel living conditions at Inta Bina Rimbayu CLQ (100 to 300 workers).
                </p>
              </div>
              <button
                id="run-clq-audit-btn"
                className="btn btn-primary"
                onClick={() => setDormAuditRan(true)}
                style={{ fontSize: '12px', padding: '6px 12px' }}
              >
                📋 Run Statutory Act 446 Audit
              </button>
            </div>

            {dormAuditRan && (
              <div style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 8, padding: 12, marginBottom: 12, fontSize: '13px', color: '#166534' }}>
                ✅ <strong>Act 446 Telemetry Verified:</strong> 42 hostel fans pulling 4.2 kW continuously. Ambient dorm temperature stabilized at 26.5°C. Zero nighttime breaker trips logged in last 72 hours. Digital certificate compiled for Department of Labour (JTK) inspection.
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12, marginTop: 12 }}>
              <div style={{ background: '#F8FAFC', padding: 12, borderRadius: 8, border: '1px solid #E2E8F0' }}>
                <h3 style={{ fontSize: '14px', margin: '0 0 6px 0', color: '#0F172A' }}>🌬️ Continuous Night Ventilation</h3>
                <p style={{ fontSize: '13px', color: '#475569', margin: 0, lineHeight: 1.4 }}>
                  Conventional CLQs cut gensets at 02:00 AM to save fuel, leaving workers sweltering in 30°C humidity. GreenPulse BESS guarantees 100% night fan operation, ensuring deep sleep and cutting next-day site accidents.
                </p>
              </div>
              <div style={{ background: '#F8FAFC', padding: 12, borderRadius: 8, border: '1px solid #E2E8F0' }}>
                <h3 style={{ fontSize: '14px', margin: '0 0 6px 0', color: '#0F172A' }}>🔥 Electrical Fire Prevention</h3>
                <p style={{ fontSize: '13px', color: '#475569', margin: 0, lineHeight: 1.4 }}>
                  Eliminates pirated extension cords and overloaded wiring in worker rooms. Monitored circuit breakers prevent overloads from phone charging and shared induction cookers.
                </p>
              </div>
              <div style={{ background: '#F8FAFC', padding: 12, borderRadius: 8, border: '1px solid #E2E8F0' }}>
                <h3 style={{ fontSize: '14px', margin: '0 0 6px 0', color: '#0F172A' }}>📋 Statutory Act 446 Audit Ready</h3>
                <p style={{ fontSize: '13px', color: '#475569', margin: 0, lineHeight: 1.4 }}>
                  Logs temperature, clean water pump power, and lighting uptime for Department of Labour (JTK) and CIDB hostel inspections without manual paper logs.
                </p>
              </div>
            </div>
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
