import { useEffect, useMemo, useState } from 'react';
import Shell from '../components/Shell';
import { DayChart } from '../components/Charts';
import { HeroBanner, TopKpiCards, LivePowerFlowAndMetrics, BottomAnalyticsRow } from '../components/MeDashboard';
import MeEquipmentView from '../components/MeEquipmentView';
import MePlanningView from '../components/MePlanningView';
import { SITES } from '../data/sites';
import { WEATHER, planTips, monthly, fmt, GENSET_KWH_PER_L, DIESEL_RM_PER_L, simulateDay, simulateForecastDay } from '../data/model';
import { getSolarCastForecast } from '../data/aiEngine';
import { fetchLiveSiteWeather, getGoogleWeatherApiKey, setGoogleWeatherApiKey } from '../data/weatherService';

const TABS = [
  { id: 'flow', label: 'Battery & Power Flow', icon: '⚡' },
  { id: 'equipment', label: 'Heavy Machinery & Circuits', icon: '🏗️' },
  { id: 'weather', label: 'Intelligent Power Planning', icon: '🧠' },
];

export default function MeScreen({ user, sites = SITES, onLogout }) {
  const [siteId, setSiteId] = useState('elmina');
  const [activeTab, setActiveTab] = useState('flow');
  const [liveWeather, setLiveWeather] = useState(null);
  const [isWeatherKeyModalOpen, setIsWeatherKeyModalOpen] = useState(false);
  const [googleKeyInput, setGoogleKeyInput] = useState('');
  const weather = 'storm';
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [hour, setHour] = useState(11);
  const [smart, setSmart] = useState(true);
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
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const dayLabel = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' });
      days.push({
        dayLabel,
        dateFormatted: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        maxTemp: 32 - (i % 2),
        minTemp: 24,
        conditionText: i % 2 === 0 ? 'Heavy Thunderstorm' : 'Afternoon Storm',
        conditionType: 'THUNDERSTORM',
        emoji: '⛈️',
        rainProbability: 70 - (i % 3) * 5,
        stormStart: 13,
        stormEnd: 16,
      });
    }
    return days;
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
      onLogout={onLogout}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Hero Township Header Banner */}
        <HeroBanner site={site} liveWeather={liveWeather} />

        {/* TAB 1: BATTERY & POWER FLOW VIEW */}
        {activeTab === 'flow' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Top 4 KPI Metric Cards with Mini-Histograms */}
            <TopKpiCards site={site} now={now} day={day} currentHour={hour} gensetNow={gensetNow} />

            {/* Middle: 5-Node Live Power Flow & Key Impact Metrics */}
            <LivePowerFlowAndMetrics site={site} now={now} m={m} gensetNow={gensetNow} />

            {/* Bottom: 3 Analytics Visualizations */}
            <BottomAnalyticsRow site={site} day={day} currentHour={hour} />

            {/* Interactive 24-Hour Timeline Scrubber */}
            <div className="card" style={{ padding: '14px 18px', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                  ⏱️ Active Simulation Timeline: <strong style={{ color: '#0F766E' }}>{hour}:00 ({hour < 12 ? `${hour === 0 ? 12 : hour} AM` : `${hour === 12 ? 12 : hour - 12} PM`})</strong>
                </span>
                <span style={{ fontSize: '11px', color: '#64748B' }}>
                  Drag slider to inspect live solar output, battery charge/discharge & site machinery demand at any hour
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="23"
                value={hour}
                onChange={(e) => setHour(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#0F766E', cursor: 'pointer' }}
                aria-label="Simulation hour slider"
              />
            </div>


            {/* Worker Quarters 24/7 Power Supply */}
            <section
              className="card"
              style={{
                padding: '20px 22px',
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '20px' }}>🏠</span>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A' }}>
                        Worker Quarters Power Supply
                      </span>

                    </div>
                    <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                      Keeps fans, lights, and clean water running all night when the diesel generator is off.
                    </div>
                  </div>
                </div>
                <button
                  id="run-clq-audit-btn"
                  type="button"
                  onClick={() => setDormAuditRan(!dormAuditRan)}
                  style={{
                    backgroundColor: dormAuditRan ? '#059669' : '#0F172A',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'background-color 0.15s ease',
                    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  {dormAuditRan ? '✓ Power Status Confirmed' : '📋 Check Night Power Status'}
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px 14px' }}>
                  <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>Dorm Fans & Lights</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#059669', margin: '2px 0' }}>100% Running</div>
                </div>

                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px 14px' }}>
                  <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>Room Temperature</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', margin: '2px 0' }}>26.5°C</div>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>Comfortable airflow maintained for workers</div>
                </div>

                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px 14px' }}>
                  <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>Backup Priority</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#2563EB', margin: '2px 0' }}>Never Turned Off</div>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>Battery always reserves power for worker dorms</div>
                </div>
              </div>

              {dormAuditRan && (
                <div
                  style={{
                    backgroundColor: '#F0FDF4',
                    border: '1px solid #BBF7D0',
                    borderRadius: '8px',
                    padding: '12px 14px',
                    marginTop: '14px',
                    fontSize: '12px',
                    color: '#166534',
                    lineHeight: 1.45,
                  }}
                >
                  ✅ <strong>Power Verified:</strong> Worker quarters received continuous electricity throughout the night directly from battery storage with zero blackouts.
                </div>
              )}
            </section>
          </div>
        )}

        {/* TAB 2: MACHINERY & CIRCUITS VIEW */}
        {activeTab === 'equipment' && (
          <MeEquipmentView
            site={site}
            now={now}
            allEquipment={allEquipment}
            siteCustomEq={siteCustomEq}
            onOpenAddModal={() => setIsAddEqModalOpen(true)}
            onRemoveEquipment={handleRemoveEquipment}
          />
        )}

        {/* TAB 3: INTELLIGENT POWER PLANNING */}
        {activeTab === 'weather' && (
          <MePlanningView
            site={site}
            liveWeather={liveWeather}
            selectedDayIndex={selectedDayIndex}
            setSelectedDayIndex={setSelectedDayIndex}
            dailyForecastList={dailyForecastList}
            activeForecastDay={activeForecastDay}
            dailySavings={dailySavings}
            equipmentPlan={equipmentPlan}
            activePlanDay={activePlanDay}
            now={now}
            DayChart={DayChart}
          />
        )}
      </div>


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

    </Shell>
  );
}
