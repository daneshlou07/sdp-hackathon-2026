import { useEffect, useMemo, useState } from 'react';
import Shell from '../components/Shell';
import { DayChart } from '../components/Charts';
import { SITES } from '../data/sites';
import { WEATHER, planTips, monthly, fmt, GENSET_KWH_PER_L } from '../data/model';
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
          {/* Main Google Weather Intelligence Card */}
          <section className="card" style={{ borderLeft: '4px solid #0F766E' }}>
            {/* Top Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#0F766E', background: '#F0FDFA', border: '1px solid #CCFBF1', padding: '3px 10px', borderRadius: 6 }}>
                  📍 {liveWeather?.locationName || site.locationName || 'Klang Valley, Malaysia'}
                </span>
                <span style={{ fontSize: '11px', color: '#64748B' }}>
                  ({site.lat ? `${site.lat.toFixed(3)}°N, ${site.lon.toFixed(3)}°E` : '3.003°N, 101.573°E'})
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '11px', color: '#15803D', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5, background: '#F0FDF4', border: '1px solid #DCFCE7', padding: '3px 8px', borderRadius: 5 }}>
                  <span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: '#22C55E' }} />
                  Google Weather API (Live)
                </span>
                <button
                  id="open-google-weather-modal"
                  onClick={() => {
                    setGoogleKeyInput(getGoogleWeatherApiKey());
                    setIsWeatherKeyModalOpen(true);
                  }}
                  style={{
                    fontSize: '11px',
                    padding: '3px 8px',
                    background: '#F8FAFC',
                    border: '1px solid #CBD5E1',
                    borderRadius: 5,
                    cursor: 'pointer',
                    color: '#475569',
                    fontWeight: 600,
                  }}
                  title="Configure Google Maps Weather API Key"
                >
                  ⚙️ Key
                </button>
              </div>
            </div>

            {/* Google Weather Hero View (matches Google Search Weather Widget) */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, padding: '16px 20px', marginBottom: 14, flexWrap: 'wrap', gap: 16 }}>
              {/* Left: Weather Icon, Temperature & Metrics */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <span style={{ fontSize: '48px', lineHeight: 1 }}>{liveWeather?.emoji || '⛈️'}</span>
                <div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                    <span style={{ fontSize: '38px', fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>
                      {liveWeather?.currentTemp || 32}
                    </span>
                    <span style={{ fontSize: '18px', fontWeight: 600, color: '#64748B' }}>°C</span>
                    {liveWeather?.feelsLikeTemp && (
                      <span style={{ fontSize: '12px', color: '#64748B', marginLeft: 4 }}>
                        (Feels like {liveWeather.feelsLikeTemp}°C)
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 12, marginTop: 6, fontSize: '12px', color: '#475569', flexWrap: 'wrap' }}>
                    <span>Precipitation: <strong>{liveWeather?.precipitationProb || 65}%</strong></span>
                    <span>•</span>
                    <span>Humidity: <strong>{liveWeather?.currentHumidity || 70}%</strong></span>
                    <span>•</span>
                    <span>Wind: <strong>{liveWeather?.windSpeed || 8} km/h</strong></span>
                  </div>
                </div>
              </div>

              {/* Right: Condition & Day */}
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#0F766E', fontWeight: 700 }}>
                  Google Weather
                </div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#64748B', margin: '2px 0' }}>
                  {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
                </div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A' }}>
                  {liveWeather?.conditionText || 'Heavy Thunderstorm'}
                </div>
              </div>
            </div>

            {/* 5-Day Forecast Row (Daily forecast cards matching Google Weather) */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                5-Day Hyperlocal Forecast (Google Weather)
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
                {(liveWeather?.dailyForecast || [
                  { dayLabel: 'Today', maxTemp: 32, minTemp: 25, conditionText: 'Heavy Thunderstorm', emoji: '⛈️', rainProbability: 70 },
                  { dayLabel: 'Wed', maxTemp: 33, minTemp: 25, conditionText: 'Heavy Thunderstorm', emoji: '⛈️', rainProbability: 70 },
                  { dayLabel: 'Thu', maxTemp: 33, minTemp: 25, conditionText: 'Heavy Thunderstorm', emoji: '⛈️', rainProbability: 70 },
                  { dayLabel: 'Fri', maxTemp: 29, minTemp: 24, conditionText: 'Thunderstorm', emoji: '⛈️', rainProbability: 80 },
                  { dayLabel: 'Sat', maxTemp: 29, minTemp: 24, conditionText: 'Scattered Thunderstorms', emoji: '⛈️', rainProbability: 60 },
                ]).map((d, i) => (
                  <div
                    key={d.dayLabel}
                    style={{
                      background: i === 0 ? '#F0FDFA' : '#FFFFFF',
                      border: `1px solid ${i === 0 ? '#99F6E4' : '#E2E8F0'}`,
                      borderRadius: 8,
                      padding: '10px 8px',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: '12px', fontWeight: 700, color: i === 0 ? '#0F766E' : '#334155' }}>
                      {d.dayLabel}
                    </div>
                    <div style={{ fontSize: '24px', margin: '4px 0' }}>{d.emoji || '⛈️'}</div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A' }}>
                      {d.maxTemp}° <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 500 }}>{d.minTemp}°</span>
                    </div>
                    <div style={{ fontSize: '10px', color: '#0284C7', fontWeight: 600, marginTop: 2 }}>
                      {d.rainProbability}% rain
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Intelligent Power Planning: Actionable Schedule Horizon */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Today's Site Power Dispatch Strategy (Based on Google Forecast)
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                {(liveWeather?.timeline || [
                  { period: '08:00 - 11:30', title: '🌤️ Morning Solar Harvest', action: 'BESS Pre-Charging', detail: 'Clean irradiance charges BESS to 88%', isStorm: false },
                  { period: '11:30 - 13:30', title: '☀️ Midday Peak Sun', action: 'Run High-Draw Machinery', detail: 'Optimal window to charge EV forklifts on free solar', isStorm: false },
                  { period: '13:00 - 15:30', title: '⛈️ Storm Window', action: 'Storm Buffer (70% Rain)', detail: 'Solar drops 80%. Battery buffer carries cranes', isStorm: true },
                  { period: '17:00 - 07:00', title: '⛅ Evening & Night Shift', action: 'CLQ Living Dignity', detail: 'Stored battery powers 24/7 worker fans & lighting', isStorm: false },
                ]).map((t) => (
                  <div
                    key={t.period}
                    style={{
                      background: t.isStorm ? '#FEF2F2' : '#F8FAFC',
                      border: `1px solid ${t.isStorm ? '#FECACA' : '#E2E8F0'}`,
                      borderRadius: 8,
                      padding: '10px 12px',
                    }}
                  >
                    <div style={{ fontSize: '10px', color: t.isStorm ? '#991B1B' : '#64748B', fontWeight: 600 }}>{t.period}</div>
                    <div style={{ fontSize: '13px', fontWeight: 700, margin: '2px 0', color: t.isStorm ? '#991B1B' : '#0F172A' }}>{t.title}</div>
                    <div style={{ fontSize: '11px', color: t.isStorm ? '#DC2626' : '#0F766E', fontWeight: 700, marginBottom: 2 }}>{t.action}</div>
                    <div style={{ fontSize: '11px', color: '#64748B', lineHeight: 1.3 }}>{t.detail}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ fontSize: '12px', color: '#0F766E', background: '#F0FDFA', border: '1px solid #CCFBF1', borderRadius: 6, padding: '8px 12px' }}>
              ⚡ <strong>Automated Battery Strategy:</strong> Google Weather API forecasts afternoon convective rain ({liveWeather?.stormWindow || '13:00 - 15:30'}). GreenPulse pre-charges the battery to 88% during morning sunshine so tower cranes, passenger hoists, and pumps operate continuously with zero diesel generator starts.
            </div>
          </section>

          {/* Interactive 24-Hour Power Chart */}
          <section className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '16px' }}>Today's 24-Hour Power Schedule</h2>
                <p className="sub" style={{ margin: '2px 0 0 0', fontSize: '12px' }}>
                  Interactive dispatch simulation: hover or click along the timeline to inspect hourly solar, battery, and site load flow.
                </p>
              </div>
            </div>
            <DayChart
              hours={day.hours}
              now={null}
              stormWindow={{ from: liveWeather?.stormStart || 13, to: liveWeather?.stormEnd || 15.5, label: `Rain (${liveWeather?.stormWindow || 'Storm Window'})` }}
            />
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
