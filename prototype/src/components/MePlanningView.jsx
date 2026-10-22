import { fmt } from '../data/model';

export default function MePlanningView({
  site,
  liveWeather,
  selectedDayIndex,
  setSelectedDayIndex,
  dailyForecastList,
  activeForecastDay,
  dailySavings,
  equipmentPlan,
  activePlanDay,
  now,
  DayChart,
}) {
  const isToday = selectedDayIndex === 0;

  const currentTemp = isToday
    ? (liveWeather?.currentTemp ?? liveWeather?.temp ?? activeForecastDay.maxTemp)
    : activeForecastDay.maxTemp;

  const feelsLike = isToday
    ? (liveWeather?.feelsLikeTemp ?? (activeForecastDay.maxTemp + 5))
    : (activeForecastDay.maxTemp + 5);

  const humidity = isToday
    ? (liveWeather?.currentHumidity ?? 78)
    : 78;

  const conditionText = isToday
    ? (liveWeather?.conditionText || liveWeather?.condition || activeForecastDay.conditionText)
    : activeForecastDay.conditionText;

  const conditionEmoji = isToday
    ? (liveWeather?.emoji || activeForecastDay.emoji || '⛅')
    : (activeForecastDay.emoji || '⛅');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 1. WEATHER & HYPERLOCAL RADAR CARD */}
      <div
        className="card"
        style={{
          padding: '20px 22px',
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
        }}
      >


        {/* Hero Forecast Banner */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)',
            border: '1px solid #E2E8F0',
            borderRadius: '10px',
            padding: '16px 20px',
            marginBottom: '18px',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          {/* Left: Weather Icon & Key Forecast */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
            <span style={{ fontSize: '48px', lineHeight: 1 }}>{conditionEmoji}</span>
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontSize: '36px', fontWeight: 800, color: '#0F172A', lineHeight: 1, letterSpacing: '-0.02em' }}>
                  {currentTemp}
                </span>
                <span style={{ fontSize: '18px', fontWeight: 600, color: '#64748B' }}>°C</span>
                <span style={{ fontSize: '15px', fontWeight: 700, color: '#334155', marginLeft: '4px' }}>
                  ({conditionText})
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '13px', color: '#475569' }}>
                <div>
                  Feels like <strong>{feelsLike}°C</strong> &bull; Humidity <strong>{humidity}%</strong>
                </div>
                <div>
                  {activeForecastDay.rainProbability >= 50 ? (
                    <span style={{ color: '#DC2626', fontWeight: 600 }}>
                      ⚠️ Rain Expected: {activeForecastDay.stormStart || 13}:00 to {activeForecastDay.stormEnd || 16}:30 ({activeForecastDay.rainProbability}% chance)
                    </span>
                  ) : (
                    <span style={{ color: '#059669', fontWeight: 600 }}>
                      ✓ High Solar Yield Expected ({activeForecastDay.rainProbability}% rain chance)
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Selected Day Indicator */}
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A' }}>
              {activeForecastDay.dayLabel}
            </div>
            <div style={{ fontSize: '13px', color: '#64748B' }}>
              {activeForecastDay.dateFormatted}
            </div>
            <div style={{ marginTop: '6px' }}>

            </div>
          </div>
        </div>

        {/* 7-Day Forecast Selector */}
        <div>
          <div style={{ fontSize: '11px', fontWeight: 800, color: '#475569', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Select 7-Day Forecast Timeline
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
            {dailyForecastList.map((d, i) => {
              const isSelected = i === selectedDayIndex;
              const buttonEmoji = (i === 0 && liveWeather?.emoji) ? liveWeather.emoji : (d.emoji || '⛈️');
              return (
                <button
                  type="button"
                  key={d.dayLabel + i}
                  onClick={() => setSelectedDayIndex(i)}
                  style={{
                    background: isSelected ? '#F0FDFA' : '#FFFFFF',
                    border: isSelected ? '2px solid #0F766E' : '1px solid #CBD5E1',
                    borderRadius: '8px',
                    padding: '10px 4px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    boxShadow: isSelected ? '0 2px 8px rgba(15, 118, 110, 0.18)' : 'none',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '2px',
                  }}
                >
                  <div style={{ fontSize: '12px', fontWeight: 800, color: isSelected ? '#0F766E' : '#1E293B' }}>
                    {d.dayLabel}
                  </div>
                  <div style={{ fontSize: '10px', color: '#64748B' }}>
                    {d.dateFormatted}
                  </div>
                  <div style={{ fontSize: '24px', margin: '4px 0' }}>{buttonEmoji}</div>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#0F172A' }}>
                    {d.maxTemp}° <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 500 }}>{d.minTemp}°</span>
                  </div>
                  <div style={{ fontSize: '10px', color: d.rainProbability >= 60 ? '#0284C7' : '#64748B', fontWeight: 700, marginTop: '2px' }}>
                    {d.rainProbability}%
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. DAILY SAVINGS & DISPATCH KPI ROW */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '12px' }}>
        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '16px 18px', boxShadow: '0 2px 6px rgba(0, 0, 0, 0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '16px' }}>🛢️</span>
            <span style={{ fontSize: '12px', color: '#166534', fontWeight: 700 }}>Diesel Avoided</span>
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#15803D', letterSpacing: '-0.02em' }}>
            {dailySavings.avoidedL} <small style={{ fontSize: '14px', fontWeight: 600 }}>Litres</small>
          </div>
          <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>
            Zero tanker runs required today
          </div>
        </div>

        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '16px 18px', boxShadow: '0 2px 6px rgba(0, 0, 0, 0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '16px' }}>💵</span>
            <span style={{ fontSize: '12px', color: '#0F766E', fontWeight: 700 }}>Fuel Cost Saved</span>
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#0F766E', letterSpacing: '-0.02em' }}>
            RM {fmt(dailySavings.savedRM)}
          </div>
          <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>
            Calculated at RM3.00/L commercial diesel
          </div>
        </div>

        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '16px 18px', boxShadow: '0 2px 6px rgba(0, 0, 0, 0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '16px' }}>🌱</span>
            <span style={{ fontSize: '12px', color: '#1E40AF', fontWeight: 700 }}>Clean Power Share</span>
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#2563EB', letterSpacing: '-0.02em' }}>
            {dailySavings.cleanShare}%
          </div>
          <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>
            Supplied via Solar + MegaBatt BESS
          </div>
        </div>

        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '16px 18px', boxShadow: '0 2px 6px rgba(0, 0, 0, 0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '16px' }}>🔒</span>
            <span style={{ fontSize: '12px', color: '#065F46', fontWeight: 700 }}>Generator Lockout</span>
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#059669', letterSpacing: '-0.02em' }}>
            100% OFF
          </div>
          <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>
            Autonomous zero-emission lockout
          </div>
        </div>
      </div>

      {/* 3. EQUIPMENT POWER SCHEDULE (3-COLUMN DISPATCH KANBAN) */}
      <div
        className="card"
        style={{
          padding: '20px',
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
        }}
      >
        <div style={{ marginBottom: '16px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: '0 0 4px 0' }}>
            Autonomous Equipment Dispatch Plan ({activeForecastDay.dayLabel})
          </h3>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>
            Predictive AI aligns heavy loads with peak solar generation and auto-pauses external lifts during monsoon rain.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '14px' }}>
          {/* Column 1: Charge on Solar */}
          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '14px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid #E2E8F0' }}>
              <span style={{ fontSize: '14px' }}>🟢</span>
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#0F766E' }}>Charge on Peak Solar</span>
            </div>

            {equipmentPlan.chargeSolar.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {equipmentPlan.chargeSolar.map((eq) => (
                  <div key={eq.id} style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '10px 12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>{eq.name}</span>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B' }}>{eq.kw} kW</span>
                    </div>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#0F766E' }}>
                      {eq.action}
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px', lineHeight: 1.35 }}>
                      {eq.slotNote}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: '12px', color: '#64748B', fontStyle: 'italic', padding: '12px 0' }}>
                No shiftable charging loads configured for this day.
              </div>
            )}
          </div>

          {/* Column 2: Rain Protection / Pause */}
          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '14px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid #E2E8F0' }}>
              <span style={{ fontSize: '14px' }}>{equipmentPlan.isRainDay ? '🔴' : '☀️'}</span>
              <span style={{ fontSize: '13px', fontWeight: 800, color: equipmentPlan.isRainDay ? '#DC2626' : '#059669' }}>
                {equipmentPlan.isRainDay ? 'Pause During Monsoon Rain' : 'All Clear • No Rain Pause'}
              </span>
            </div>

            {equipmentPlan.isRainDay && equipmentPlan.pauseRain.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {equipmentPlan.pauseRain.map((eq) => (
                  <div key={eq.id} style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '10px 12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>{eq.name}</span>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B' }}>{eq.kw} kW</span>
                    </div>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#DC2626' }}>
                      {eq.action}
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px', lineHeight: 1.35 }}>
                      {eq.slotNote}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: '12px', color: '#047857', background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '8px', padding: '14px', lineHeight: 1.45 }}>
                ✓ Low rain probability ({activeForecastDay.rainProbability}%). All site machinery and outdoor hoisting can run uninterrupted on solar and BESS.
              </div>
            )}
          </div>

          {/* Column 3: Always Powered (P0 Critical) */}
          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '14px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid #E2E8F0' }}>
              <span style={{ fontSize: '14px' }}>⚡</span>
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#2563EB' }}>Always Powered (Never Shed)</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {equipmentPlan.alwaysPowered.map((eq) => (
                <div key={eq.id} style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '10px 12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>{eq.name}</span>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B' }}>{eq.kw} kW</span>
                  </div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#2563EB' }}>
                    {eq.action}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px', lineHeight: 1.35 }}>
                    {eq.slotNote}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. 24-HOUR POWER SCHEDULE SIMULATION CHART */}
      <div
        className="card"
        style={{
          padding: '20px',
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: '0 0 2px 0' }}>
              Daily Power Dispatch ({activeForecastDay.dayLabel})
            </h3>

          </div>
          {activeForecastDay.rainProbability >= 50 && (
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#991B1B',
                background: '#FEF2F2',
                border: '1px solid #FECACA',
                padding: '3px 10px',
                borderRadius: '6px',
              }}
            >
              🌧️ Storm Window: {activeForecastDay.stormStart || 13}:00–{activeForecastDay.stormEnd || 16}:30
            </span>
          )}
        </div>

        <DayChart
          hours={activePlanDay.hours}
          now={selectedDayIndex === 0 ? now : null}
          stormWindow={
            activeForecastDay.rainProbability >= 50
              ? {
                from: activeForecastDay.stormStart || 13,
                to: activeForecastDay.stormEnd || 16,
                label: `Rain Forecast (${activeForecastDay.stormStart || 13}:00 to ${activeForecastDay.stormEnd || 16}:30)`,
              }
              : null
          }
        />
      </div>
    </div>
  );
}
