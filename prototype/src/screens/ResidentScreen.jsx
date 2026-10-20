import { useState } from 'react';

export default function ResidentScreen({ user, complaints = [], onAddComplaint, onLogout }) {
  const [unitBlock, setUnitBlock] = useState('Damayan Residensi (Block B - Direct Site Facing)');
  const [category, setCategory] = useState('Low-Frequency Engine / Motor Hum');
  const [issue, setIssue] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!issue.trim()) return;

    onAddComplaint({
      who: `Resident (${unitBlock.split(' (')[0]})`,
      issue: `[${category}] ${issue.trim()}`,
      action: '',
      closed: false,
    });

    setSubmitted(true);
    setIssue('');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', color: '#0F172A', fontFamily: 'inherit' }}>
      {/* Top Header */}
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
            SDP
          </span>
          <div>
            <div style={{ fontWeight: 800, fontSize: '16px', letterSpacing: '-0.02em' }}>
              Sime Darby Property: Resident Community Portal
            </div>
            <div style={{ fontSize: '12px', color: '#94A3B8' }}>
              Putra Heights Phase 2 Boundary Care
            </div>
          </div>
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
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: 1040, margin: '0 auto', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Live Boundary Noise & Clean Power Banner */}
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
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#CCFBF1', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Live Sound Telemetry
              </div>
              <h1 style={{ fontSize: '24px', fontWeight: 800, margin: '6px 0' }}>
                Putra Heights Site Boundary (Facing Damayan Residensi)
              </h1>
              <p style={{ margin: 0, fontSize: '14px', color: '#CCFBF1', maxWidth: 620, lineHeight: 1.5 }}>
                This site is powered by clean solar and battery storage. Zero continuous diesel generator running next to your home.
              </p>
            </div>

            <div
              style={{
                backgroundColor: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(8px)',
                borderRadius: 12,
                padding: '16px 22px',
                textAlign: 'center',
                minWidth: 190,
                border: '1px solid rgba(255,255,255,0.25)',
              }}
            >
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#CCFBF1' }}>Live Boundary Noise</div>
              <div style={{ fontSize: '36px', fontWeight: 900, letterSpacing: '-0.03em' }} className="num">
                54.10 <span style={{ fontSize: '18px', fontWeight: 600 }}>dBA</span>
              </div>
              <div
                style={{
                  backgroundColor: '#059669',
                  color: '#FFFFFF',
                  fontSize: '11px',
                  fontWeight: 800,
                  padding: '3px 10px',
                  borderRadius: 9999,
                  marginTop: 4,
                  display: 'inline-block',
                }}
              >
                ✓ Safe (5.90 dBA below 60.00 dBA limit)
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
              <div style={{ fontSize: '11px', color: '#CCFBF1' }}>DOE Statutory Daytime Limit</div>
              <div style={{ fontSize: '14px', fontWeight: 700 }} className="num">60.00 dBA (Schedule 6)</div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#CCFBF1' }}>Site Power System</div>
              <div style={{ fontSize: '14px', fontWeight: 700 }}>261 kWh Battery + 150 kWp Solar</div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#CCFBF1' }}>Backup Diesel Generator</div>
              <div style={{ fontSize: '14px', fontWeight: 700 }}>100% OFF (Hardware Lockout)</div>
            </div>
          </div>
        </section>

        {/* 2 Columns: Report Form + Live Community Inquiries */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
          {/* Column 1: Anonymous Report Form */}
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
              <h2 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 4px 0' }}>
                Report Noise, Dust, or Disturbance
              </h2>
              <p style={{ fontSize: '13px', color: '#64748B', margin: 0, lineHeight: 1.45 }}>
                Hear unusual machinery noise, dust, or bright floodlights? Submit your feedback directly to the on-site Environmental Officer.
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
                ✅ <strong>Feedback Received:</strong> Your report has been dispatched to the on-site Environmental Officer. An inspection has been triggered.
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Anonymous Guarantee */}
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
                    100% Anonymous (No personal data collected)
                  </div>
                  <div style={{ fontSize: '11px', color: '#15803D' }}>
                    No names, IC numbers, or phone numbers are required.
                  </div>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>
                  Your General Area / Building
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
                  <option value="Damayan Residensi (Block B - Direct Site Facing)">Damayan Residensi (Block B - Facing Site)</option>
                  <option value="Damayan Residensi (Block A - North Facing)">Damayan Residensi (Block A - North Facing)</option>
                  <option value="Putra Avenue Landed Homes">Putra Avenue Landed Homes</option>
                  <option value="Putra Heights Commercial Hub">Putra Heights Commercial Hub</option>
                </select>
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
                    backgroundColor: '#FFFFFF',
                  }}
                >
                  <option value="Low-Frequency Engine / Motor Hum">Low-Frequency Engine or Motor Hum</option>
                  <option value="Late-Night Crane / Hoist Movement">Late-Night Crane or Hoist Movement</option>
                  <option value="Access Road Lorries / Speeding">Access Road Lorries or Speeding</option>
                  <option value="Dust / Mud on Public Road">Dust or Mud on Public Road</option>
                  <option value="Bright Floodlight Glare into Bedrooms">Bright Floodlights Shining into Bedrooms</option>
                  <option value="General Environmental Inquiry">General Inquiry</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>
                  Observation Details & Time
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe what you hear or see (e.g. constant humming vibration, loud banging after 8 PM, bright light facing windows)..."
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
                <span>📢</span> Send to Site Environmental Officer
              </button>
            </form>
          </section>

          {/* Column 2: Recent Feedback & Actions Taken */}
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
              <h2 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 4px 0' }}>
                Recent Community Feedback & Actions Taken
              </h2>
              <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
                Official log of reports reviewed and resolved by the site team.
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
                          <strong>⏳ Under Review:</strong> Environmental Officer has been alerted.
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
              💡 <strong>On-Site Fast Resolution:</strong> Issues reported here are resolved directly on-site to preserve neighborhood tranquility.
            </div>
          </section>
        </div>

        {/* Bottom 2 Cards: Permitted Hours & Process */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
          {/* Permitted Working Hours */}
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
                  <div style={{ fontSize: '11px', color: '#64748B' }}>Normal construction, cranes, and hoists</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#059669' }}>08:00 - 18:00</div>
                  <div style={{ fontSize: '10px', color: '#64748B' }}>Limit: 60.00 dBA</div>
                </div>
              </div>

              <div style={{ padding: '8px 12px', backgroundColor: '#F8FAFC', borderRadius: 8, border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A' }}>Monday - Saturday (Evening)</div>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>Quiet indoor finishing work only</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#D97706' }}>18:00 - 22:00</div>
                  <div style={{ fontSize: '10px', color: '#64748B' }}>Limit: 55.00 dBA</div>
                </div>
              </div>

              <div style={{ padding: '8px 12px', backgroundColor: '#FEF2F2', borderRadius: 8, border: '1px solid #FECACA', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#991B1B' }}>Sundays & Late Night</div>
                  <div style={{ fontSize: '11px', color: '#B91C1C' }}>STRICTLY NO WORK. 100% shutdown</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#991B1B' }}>22:00 - 08:00</div>
                  <div style={{ fontSize: '10px', color: '#B91C1C' }}>Limit: 45.00 dBA</div>
                </div>
              </div>
            </div>
          </div>

          {/* How Your Report Is Handled */}
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
                How Your Report Is Handled
              </h3>
            </div>
            <p style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.45, margin: '0 0 14px 0' }}>
              Every complaint is officially logged and tracked until resolved:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span style={{ backgroundColor: '#EEF2FF', color: '#4F46E5', fontWeight: 800, fontSize: '11px', padding: '3px 7px', borderRadius: 6, minWidth: 24, textAlign: 'center' }}>
                  1
                </span>
                <div style={{ fontSize: '12px', color: '#334155' }}>
                  <strong>Site Environmental Officer Alert:</strong> The licensed officer receives your notification and checks boundary sound sensors immediately.
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span style={{ backgroundColor: '#EEF2FF', color: '#4F46E5', fontWeight: 800, fontSize: '11px', padding: '3px 7px', borderRadius: 6, minWidth: 24, textAlign: 'center' }}>
                  2
                </span>
                <div style={{ fontSize: '12px', color: '#334155' }}>
                  <strong>Immediate On-Site Action:</strong> The team investigates the noise source (e.g. idling truck, unshielded tool) and adjusts or turns it off within 30 minutes.
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span style={{ backgroundColor: '#EEF2FF', color: '#4F46E5', fontWeight: 800, fontSize: '11px', padding: '3px 7px', borderRadius: 6, minWidth: 24, textAlign: 'center' }}>
                  3
                </span>
                <div style={{ fontSize: '12px', color: '#334155' }}>
                  <strong>Resolution Updated in Public Log:</strong> What was done to fix the issue is posted here so you can verify the result.
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
