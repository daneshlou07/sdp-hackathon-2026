import { useMemo } from 'react';
import { fmt } from '../data/model';

export default function MeEquipmentView({
  site,
  now,
  allEquipment,
  siteCustomEq,
  onOpenAddModal,
  onRemoveEquipment,
}) {
  // Calculate total load and headroom
  const activeCustomDemand = siteCustomEq.reduce((acc, eq) => acc + (eq.kw * 0.75), 0);
  const totalDemand = Math.round(now.load + activeCustomDemand);
  const inverterLimit = site.bessKW || 200;
  const headroomKw = Math.max(0, inverterLimit - totalDemand);
  const headroomPct = Math.round((headroomKw / inverterLimit) * 100);
  const maxMachineKw = Math.max(...allEquipment.map((e) => e.kw), 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 1. CAPACITY & DISTRIBUTION HEADER CARD */}
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px', marginBottom: '18px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ fontSize: '18px' }}>🏗️</span>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.01em' }}>
                Heavy Machinery & Circuit Distribution
              </h2>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#047857',
                  background: '#ECFDF5',
                  border: '1px solid #A7F3D0',
                  padding: '2px 8px',
                  borderRadius: '999px',
                }}
              >
                Inverter Protected
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '13px', color: '#64748B', lineHeight: 1.4 }}>
              Active machine circuits connected to the containerized {site.bessKWh} kWh BESS distribution board.
            </p>
          </div>

          <button
            id="open-connect-circuit-modal"
            type="button"
            onClick={onOpenAddModal}
            style={{
              backgroundColor: '#D71920',
              color: '#FFFFFF',
              border: 'none',
              padding: '9px 16px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'background-color 0.15s ease',
              boxShadow: '0 2px 6px rgba(215, 25, 32, 0.25)',
            }}
          >
            <span>+</span> Connect Machinery Circuit
          </button>
        </div>

        {/* 4 Mini Stat Telemetry Badges */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px',
            paddingTop: '16px',
            borderTop: '1px solid #F1F5F9',
          }}
        >
          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px 14px' }}>
            <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>Active Site Demand</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', margin: '2px 0' }}>
              <span style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A' }}>{totalDemand}</span>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748B' }}>kW</span>
            </div>
            <div style={{ fontSize: '11px', color: '#059669', fontWeight: 600 }}>
              {Math.round((totalDemand / inverterLimit) * 100)}% of Inverter Limit
            </div>
          </div>

          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px 14px' }}>
            <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>BESS Inverter Rating</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', margin: '2px 0' }}>
              <span style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A' }}>{inverterLimit}</span>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748B' }}>kW</span>
            </div>
            <div style={{ fontSize: '11px', color: '#64748B' }}>
              Continuous Inverter Capacity
            </div>
          </div>

          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px 14px' }}>
            <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>Available Headroom</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', margin: '2px 0' }}>
              <span style={{ fontSize: '20px', fontWeight: 800, color: '#2563EB' }}>{headroomKw}</span>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748B' }}>kW</span>
            </div>
            <div style={{ fontSize: '11px', color: '#1E40AF', fontWeight: 600 }}>
              {headroomPct}% Inrush Buffer Reserve
            </div>
          </div>

          <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '8px', padding: '12px 14px' }}>
            <div style={{ fontSize: '11px', color: '#065F46', fontWeight: 600 }}>Circuit Safety Status</div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#047857', margin: '3px 0 2px' }}>
              Zero Trips Logged
            </div>
            <div style={{ fontSize: '11px', color: '#059669' }}>
              Continuous Inrush Management Active
            </div>
          </div>
        </div>
      </div>

      {/* 2. EQUIPMENT CIRCUIT CARDS */}
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
            Active Machinery Feeder Circuits ({allEquipment.length})
          </h3>
          <span style={{ fontSize: '12px', color: '#64748B' }}>
            Live readings update every 30s
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {allEquipment.map((eq) => {
            const isCustom = eq.id.startsWith('custom-');
            const kw = now.parts[eq.id] !== undefined ? now.parts[eq.id] : (isCustom ? eq.kw * 0.75 : 0);
            const isRunning = kw > 0;
            const pctOfMax = Math.min(100, Math.max(8, (kw / maxMachineKw) * 100));

            const priorityText = eq.priority || 'P1 Standard';
            const isP0 = priorityText.includes('P0');
            const isP2 = priorityText.includes('P2');

            return (
              <div
                key={eq.id}
                style={{
                  background: isRunning ? '#FFFFFF' : '#F8FAFC',
                  border: isRunning ? '1px solid #CBD5E1' : '1px solid #E2E8F0',
                  borderRadius: '10px',
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  transition: 'all 0.15s ease',
                  opacity: isRunning ? 1 : 0.7,
                }}
              >
                {/* Status Dot */}
                <div
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: isRunning ? '#10B981' : '#94A3B8',
                    boxShadow: isRunning ? '0 0 8px rgba(16, 185, 129, 0.6)' : 'none',
                    flexShrink: 0,
                  }}
                />

                {/* Name & Circuit Port */}
                <div style={{ minWidth: '220px', flex: '1 1 220px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: isRunning ? '#0F172A' : '#475569' }}>
                      {eq.name}
                    </span>
                    {eq.breaker && (
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 600,
                          backgroundColor: '#F1F5F9',
                          color: '#475569',
                          padding: '1px 6px',
                          borderRadius: '4px',
                          border: '1px solid #E2E8F0',
                        }}
                      >
                        {eq.breaker}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                    Rated Capacity: {eq.kw} kW &bull; {isRunning ? 'Running on BESS power' : 'Circuit idle / Standby'}
                  </div>
                </div>

                {/* Priority Tier Chip */}
                <div style={{ minWidth: '130px', flexShrink: 0 }}>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: '6px',
                      display: 'inline-block',
                      backgroundColor: isP0 ? '#EFF6FF' : isP2 ? '#FFFBEB' : '#F8FAFC',
                      color: isP0 ? '#1E40AF' : isP2 ? '#92400E' : '#334155',
                      border: isP0 ? '1px solid #BFDBFE' : isP2 ? '1px solid #FDE68A' : '1px solid #E2E8F0',
                    }}
                  >
                    {isP0 ? '🛡️ P0 Critical' : isP2 ? '⏸️ P2 Sheddable' : '⚙️ P1 Standard'}
                  </span>
                </div>

                {/* Power Bar */}
                <div style={{ flex: '2 1 180px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ height: '7px', background: '#F1F5F9', borderRadius: '99px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${isRunning ? pctOfMax : 0}%`,
                        height: '100%',
                        background: isP0
                          ? 'linear-gradient(90deg, #3B82F6 0%, #1D4ED8 100%)'
                          : 'linear-gradient(90deg, #10B981 0%, #059669 100%)',
                        borderRadius: '99px',
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </div>
                </div>

                {/* Live kW Reading */}
                <div style={{ minWidth: '85px', textAlign: 'right', flexShrink: 0 }}>
                  <span style={{ fontSize: '15px', fontWeight: 800, color: isRunning ? '#0F172A' : '#94A3B8' }}>
                    {isRunning ? `${fmt(kw)} kW` : '0 kW'}
                  </span>
                </div>

                {/* Disconnect Action (For Custom Connected Circuits) */}
                {isCustom && (
                  <button
                    type="button"
                    onClick={() => onRemoveEquipment(eq.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#94A3B8',
                      cursor: 'pointer',
                      padding: '4px 8px',
                      fontSize: '14px',
                      borderRadius: '4px',
                      transition: 'color 0.15s ease',
                    }}
                    title="Disconnect Circuit from BESS"
                  >
                    ✕
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Technical Safety Note */}
        <div
          style={{
            marginTop: '16px',
            padding: '12px 14px',
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            fontSize: '12px',
            color: '#475569',
            lineHeight: 1.5,
          }}
        >
          💡 <strong>Continuous Inrush Buffer:</strong> The {site.bessKW} kW BESS inverter absorbs heavy motor startup spikes (cranes and passenger hoists) in under 5 milliseconds without voltage drop, eliminating diesel genset stutter or nuisance trips.
        </div>
      </div>
    </div>
  );
}
