import { useState } from 'react';

export default function ResidentScreen({ user, complaints = [], onAddComplaint, onLogout }) {
  const [unitBlock, setUnitBlock] = useState('Damayan Residensi (Block B - Direct Site Facing)');
  const [category, setCategory] = useState('Low-Frequency Engine / Motor Hum');
  const [issue, setIssue] = useState('Audible low-frequency hum from construction zone while putting baby to sleep.');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!issue.trim()) return;

    onAddComplaint({
      who: `Anonymous Resident (${unitBlock})`,
      issue: `[${category}] ${issue.trim()}`,
      action: '',
      closed: false,
    });

    setSubmitted(true);
    setIssue('');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', color: '#0F172A', fontFamily: 'inherit' }}>
      {/* Top Navigation Bar */}
      <header
        style={{
          backgroundColor: '#0F172A',
          color: '#FFFFFF',
          padding: '16px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #1E293B',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span
            style={{
              backgroundColor: '#D71920',
              color: '#FFFFFF',
              fontWeight: 900,
              padding: '4px 8px',
              borderRadius: 6,
              fontSize: '14px',
            }}
          >
            GP
          </span>
          <div>
            <div style={{ fontWeight: 800, fontSize: '16px', letterSpacing: '-0.02em' }}>
              GreenPulse Community Sound Care
            </div>
            <div style={{ fontSize: '12px', color: '#94A3B8' }}>
              Sime Darby Property | Phase 1 Resident Care Portal (Putra Heights)
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ textAlign: 'right', display: 'none', md: 'block' }}>
            <div style={{ fontSize: '13px', fontWeight: 600 }}>{user.title}</div>
            <div style={{ fontSize: '11px', color: '#94A3B8' }}>{user.org}</div>
          </div>
          <button
            onClick={onLogout}
            style={{
              backgroundColor: 'rgba(255,255,255,0.1)',
              color: '#FFFFFF',
              border: '1px solid rgba(255,255,255,0.2)',
              padding: '6px 14px',
              borderRadius: 8,
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Log Out
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ maxWidth: 1040, margin: '0 auto', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Transparency Hero Banner */}
        <section
          style={{
            background: 'linear-gradient(135deg, #0F766E 0%, #115E59 100%)',
            color: '#FFFFFF',
            borderRadius: 14,
            padding: '24px',
            boxShadow: '0 10px 25px -5px rgba(15, 118, 110, 0.2)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
            <div>

              <h1 style={{ fontSize: '24px', fontWeight: 800, margin: '8px 0 6px 0' }}>
                Putra Heights Phase 2 Construction Boundary
              </h1>
              <p style={{ margin: 0, fontSize: '14px', color: '#CCFBF1', maxWidth: 600, lineHeight: 1.5 }}>
                Direct acoustic telemetry from the sensor facing Damayan Residensi. This site is powered by clean solar and battery storage to safeguard neighborhood tranquility.
              </p>
            </div>

            <div
              style={{
                backgroundColor: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(8px)',
                borderRadius: 12,
                padding: '16px 20px',
                textAlign: 'center',
                minWidth: 180,
                border: '1px solid rgba(255,255,255,0.25)',
              }}
            >
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#CCFBF1' }}>Live Boundary Sound</div>
              <div style={{ fontSize: '36px', fontWeight: 900, letterSpacing: '-0.03em' }}>
                54.1 <span style={{ fontSize: '18px', fontWeight: 600 }}>dBA</span>
              </div>
              <div
                style={{
                  backgroundColor: '#059669',
                  color: '#FFFFFF',
                  fontSize: '11px',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: 9999,
                  marginTop: 4,
                  display: 'inline-block',
                }}
              >
                ✓ 5.9 dBA Below DOE Limit
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 12,
              marginTop: 20,
              paddingTop: 16,
              borderTop: '1px solid rgba(255,255,255,0.2)',
            }}
          >
            <div>
              <div style={{ fontSize: '11px', color: '#CCFBF1' }}>Statutory Daytime Limit (DOE)</div>
              <div style={{ fontSize: '14px', fontWeight: 700 }}>60.0 dBA L90 (Schedule 6)</div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#CCFBF1' }}>Site Clean Energy Source</div>
              <div style={{ fontSize: '14px', fontWeight: 700 }}>MegaBatt 261 kWh BESS + 150 kWp Solar</div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#CCFBF1' }}>Backup Diesel Generator</div>
              <div style={{ fontSize: '14px', fontWeight: 700 }}>100% OFF (Hardware Lockout)</div>
            </div>
          </div>
        </section>

        {/* Two-Column Grid: Report Form & Live Inquiries */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
          {/* Report Disturbance Form */}
          <section
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 12,
              padding: '24px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}
          >
            <div style={{ marginBottom: 16 }}>
              <span
                style={{
                  backgroundColor: '#FEF2F2',
                  color: '#991B1B',
                  fontSize: '11px',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: 4,
                }}
              >
                DIRECT CONTRACTOR ESCALATION
              </span>
              <h2 style={{ fontSize: '18px', fontWeight: 800, margin: '8px 0 4px 0' }}>
                Report Noise Disturbance or Inquiry
              </h2>
              <p style={{ fontSize: '13px', color: '#64748B', margin: 0, lineHeight: 1.45 }}>
                Noticed unusual machinery noise, dust, or vehicle speeding? Submit your feedback directly to the on-site Environmental Officer (Inta Bina / Sime Darby Property).
              </p>
            </div>

            {submitted && (
              <div
                style={{
                  backgroundColor: '#F0FDF4',
                  border: '1px solid #BBF7D0',
                  color: '#166534',
                  borderRadius: 8,
                  padding: '12px 14px',
                  fontSize: '13px',
                  marginBottom: 16,
                  lineHeight: 1.45,
                }}
              >
                ✅ <strong>Feedback Received:</strong> Your observation has been dispatched to the Site Environmental Officer. A perimeter sound inspection has been initiated. Thank you for helping keep our township quiet.
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Permanent Anonymous Guarantee Banner */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 14px',
                  backgroundColor: '#F0FDF4',
                  borderRadius: 8,
                  border: '1px solid #BBF7D0',
                }}
              >
                <span style={{ fontSize: '18px' }}>🛡️</span>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#166534' }}>
                    100% Anonymous by Design (Zero Personal Data Collected)
                  </div>
                  <div style={{ fontSize: '11px', color: '#15803D', lineHeight: 1.35 }}>
                    No names, phone numbers, or unit numbers are requested. Your privacy is protected under PDPA while enabling the EO to locate the disturbance.
                  </div>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>
                  My General Location / Phase (For Sound Sensor Triangulation)
                </label>
                <select
                  value={unitBlock}
                  onChange={(e) => setUnitBlock(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: '1px solid #CBD5E1',
                    fontSize: '13px',
                    backgroundColor: '#FFFFFF',
                  }}
                >
                  <option value="Damayan Residensi (Block B - Direct Site Facing)">Damayan Residensi (Block B - Direct Site Facing)</option>
                  <option value="Damayan Residensi (Block A - North Facing)">Damayan Residensi (Block A - North Facing)</option>
                  <option value="Putra Avenue Landed Homes (Boundary West)">Putra Avenue Landed Homes (Boundary West)</option>
                  <option value="Putra Heights Commercial Hub">Putra Heights Commercial Hub</option>
                </select>
                <p style={{ fontSize: '11px', color: '#64748B', margin: '4px 0 0 0' }}>
                  The Environmental Officer uses this to inspect the perimeter sound sensor nearest to your block.
                </p>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>
                  Disturbance Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: '1px solid #CBD5E1',
                    fontSize: '13px',
                  }}
                >
                  <option value="Low-Frequency Engine / Motor Hum">Low-Frequency Engine / Motor Hum</option>
                  <option value="Late-Night Hoisting / Crane Movement">Late-Night Crane / Hoist Movement</option>
                  <option value="Access Road Lorry Noise / Speeding">Access Road Lorries / Speeding</option>
                  <option value="Dust / Mud on Public Road">Dust / Wheel Wash Mud</option>
                  <option value="Bright Floodlight Glare into Bedrooms">Bright Floodlight Glare into Bedrooms</option>
                  <option value="General Environmental Inquiry">General Inquiry</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>
                  Observation Details & Time of Occurrence
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe what you hear or observe from your unit (e.g. constant humming vibration, sudden metallic banging, unauthorized generator running)..."
                  value={issue}
                  onChange={(e) => setIssue(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: '1px solid #CBD5E1',
                    fontSize: '13px',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              <button
                type="submit"
                id="submit-resident-complaint"
                style={{
                  backgroundColor: '#D71920',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '10px 16px',
                  borderRadius: 8,
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                <span>📢</span> Dispatch to Site Environmental Officer
              </button>
            </form>
          </section>

          {/* Community Feedback & Live Resolution Log */}
          <section
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 12,
              padding: '24px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{ marginBottom: 16 }}>
              <span
                style={{
                  backgroundColor: '#F1F5F9',
                  color: '#475569',
                  fontSize: '11px',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: 4,
                }}
              >
                COMMUNITY TRANSPARENCY
              </span>
              <h2 style={{ fontSize: '18px', fontWeight: 800, margin: '8px 0 4px 0' }}>
                Phase 1 Resident Inquiries & Verified Actions
              </h2>
              <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
                Official log of feedback reviewed and resolved by the Environmental Officer.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto', maxHeight: 380 }}>
              {complaints.length === 0 ? (
                <div style={{ color: '#94A3B8', fontSize: '13px', textAlign: 'center', padding: '30px 0' }}>
                  No active community noise inquiries logged.
                </div>
              ) : (
                complaints.map((c) => (
                  <div
                    key={c.id}
                    style={{
                      border: '1px solid #E2E8F0',
                      borderRadius: 8,
                      padding: '12px 14px',
                      backgroundColor: c.closed ? '#F8FAFC' : '#FFFBEB',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: 4 }}>
                      <span style={{ fontWeight: 700, color: '#0F172A' }}>{c.who}</span>
                      <span style={{ color: '#64748B' }}>{c.date}</span>
                    </div>
                    <div style={{ fontSize: '13px', color: '#334155', marginBottom: 6 }}>
                      {c.issue}
                    </div>
                    <div style={{ fontSize: '12px' }}>
                      {c.closed ? (
                        <div style={{ color: '#166534', backgroundColor: '#F0FDF4', padding: '4px 8px', borderRadius: 4, border: '1px solid #BBF7D0' }}>
                          <strong>✓ Resolved by EO:</strong> {c.action}
                        </div>
                      ) : (
                        <div style={{ color: '#B45309', backgroundColor: '#FEF3C7', padding: '4px 8px', borderRadius: 4, border: '1px solid #FDE68A' }}>
                          <strong>⏳ Under Active Review:</strong> Environmental Officer has been alerted.
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div
              style={{
                marginTop: 'auto',
                paddingTop: 16,
                borderTop: '1px solid #F1F5F9',
                fontSize: '12px',
                color: '#64748B',
                lineHeight: 1.45,
              }}
            >
              💡 <strong>Direct Resolution Policy:</strong> By resolving inquiries within minutes on-site, Sime Darby Property and Inta Bina prevent municipal stop-work notices and preserve good neighbour relations.
            </div>
          </section>
        </div>

        {/* Community Governance Information Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
          {/* Card 1: Chain of Custody */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 12,
              padding: '20px 24px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: '18px' }}>⚖️</span>
              <h3 style={{ fontSize: '15px', fontWeight: 800, margin: 0, color: '#0F172A' }}>
                Who Handles Your Complaint? (Chain of Custody)
              </h3>
            </div>
            <p style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.45, margin: '0 0 14px 0' }}>
              Complaints are legally governed under the <strong>DOE Environmental Management Plan (EMP Section 8: Public Grievance Redress Mechanism)</strong>:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span style={{ backgroundColor: '#EEF2FF', color: '#4F46E5', fontWeight: 800, fontSize: '11px', padding: '3px 7px', borderRadius: 6, minWidth: 24, textAlign: 'center' }}>
                  1
                </span>
                <div style={{ fontSize: '12px', color: '#334155' }}>
                  <strong>Site Environmental Officer (EO):</strong> Licensed officer on site receives your report and immediately cross-checks perimeter decibel sensors.
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span style={{ backgroundColor: '#EEF2FF', color: '#4F46E5', fontWeight: 800, fontSize: '11px', padding: '3px 7px', borderRadius: 6, minWidth: 24, textAlign: 'center' }}>
                  2
                </span>
                <div style={{ fontSize: '12px', color: '#334155' }}>
                  <strong>Site Foreman & M&E Lead:</strong> EO inspects active zones to shut down unshielded auxiliary equipment or idling delivery lorries within 30 minutes.
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span style={{ backgroundColor: '#EEF2FF', color: '#4F46E5', fontWeight: 800, fontSize: '11px', padding: '3px 7px', borderRadius: 6, minWidth: 24, textAlign: 'center' }}>
                  3
                </span>
                <div style={{ fontSize: '12px', color: '#334155' }}>
                  <strong>Sime Darby Township Liaison:</strong> Copy forwarded to Sime Darby Property Township Management for independent community quality audit.
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Permitted Working Hours */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 12,
              padding: '20px 24px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: '18px' }}>🕒</span>
              <h3 style={{ fontSize: '15px', fontWeight: 800, margin: 0, color: '#0F172A' }}>
                Permitted Construction Working Hours (MBSA / DOE)
              </h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ padding: '8px 12px', backgroundColor: '#F8FAFC', borderRadius: 8, border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A' }}>Monday - Saturday (Daytime)</div>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>Heavy framing, tower cranes, hoists</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#059669' }}>08:00 - 18:00</div>
                  <div style={{ fontSize: '10px', color: '#64748B' }}>Limit: 60 dBA</div>
                </div>
              </div>

              <div style={{ padding: '8px 12px', backgroundColor: '#F8FAFC', borderRadius: 8, border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A' }}>Monday - Saturday (Evening)</div>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>Restricted low-noise indoor finishing only</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#D97706' }}>18:00 - 22:00</div>
                  <div style={{ fontSize: '10px', color: '#64748B' }}>Limit: 55 dBA</div>
                </div>
              </div>

              <div style={{ padding: '8px 12px', backgroundColor: '#FEF2F2', borderRadius: 8, border: '1px solid #FECACA', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#991B1B' }}>Night Silent Window & Sundays</div>
                  <div style={{ fontSize: '11px', color: '#B91C1C' }}>Zero construction allowed. 100% shutdown</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#991B1B' }}>22:00 - 08:00</div>
                  <div style={{ fontSize: '10px', color: '#B91C1C' }}>Limit: 45 dBA</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
