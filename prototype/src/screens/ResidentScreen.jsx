import { useState } from 'react';
import logoImg from '../assets/BUILDWITHGEEKS LOGO.png';

export default function ResidentScreen({ user, complaints = [], onAddComplaint, onLogout }) {
  const [unitBlock, setUnitBlock] = useState('Damayan Residensi (Block B - Direct Site Facing)');
  const [category, setCategory] = useState('Low-Frequency Engine / Motor Hum');
  const [issue, setIssue] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Accordion open/close state
  const [openAccordions, setOpenAccordions] = useState({
    feedback: false,
    hours: false,
    handling: false,
  });

  const toggleAccordion = (key) => {
    setOpenAccordions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

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
    // Auto open feedback log so they see their submission
    setOpenAccordions((prev) => ({ ...prev, feedback: true }));
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <img
            src={logoImg}
            alt="GreenPulse"
            style={{ height: '32px', width: 'auto', display: 'block' }}
          />
          <div style={{ fontWeight: 700, fontSize: '15px', color: '#F8FAFC', letterSpacing: '-0.01em' }}>
            Resident Community Portal
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
      <main style={{ maxWidth: 780, margin: '0 auto', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* PRIMARY FORM: REPORT NOISE, DUST, OR DISTURBANCE */}
        <section
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 14,
            padding: '28px 24px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          }}
        >
          <div style={{ marginBottom: 18 }}>
            <h2 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 6px 0', color: '#0F172A' }}>
              Report Noise, Dust, or Disturbance
            </h2>

          </div>

          {submitted && (
            <div
              style={{
                backgroundColor: '#F0FDF4',
                border: '1px solid #BBF7D0',
                color: '#166534',
                borderRadius: 8,
                padding: '14px 16px',
                fontSize: '13px',
                marginBottom: 18,
                lineHeight: 1.45,
              }}
            >
              ✅ <strong>Feedback Dispatched:</strong> Site Environmental Officer (Kak Nurul) has received your alert. A perimeter inspection is in progress. Check the feedback log below to see resolution status.
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Form Fields Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: 6 }}>
                  Your General Area / Building
                </label>
                <select
                  value={unitBlock}
                  onChange={(e) => setUnitBlock(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1px solid #CBD5E1',
                    fontSize: '13px',
                    backgroundColor: '#FFFFFF',
                    color: '#0F172A',
                  }}
                >
                  <option value="City of Elmina (Kanopi Residences - Facing Site)">City of Elmina (Kanopi Residences - Facing Site)</option>
                  <option value="City of Elmina (Elmina Green Phases 3 & 4)">City of Elmina (Elmina Green Phases 3 & 4)</option>
                  <option value="Serenia City (Serenia Baleria Precinct)">Serenia City (Serenia Baleria Precinct)</option>
                  <option value="Serenia City (Commercial Hub Buffer)">Serenia City (Commercial Hub Buffer)</option>
                  <option value="Bandar Bukit Raja (The Straits Landed Homes)">Bandar Bukit Raja (The Straits Landed Homes)</option>
                  <option value="Bandar Bukit Raja (Industrial Park Buffer Zone)">Bandar Bukit Raja (Industrial Park Buffer Zone)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: 6 }}>
                  Disturbance Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1px solid #CBD5E1',
                    fontSize: '13px',
                    backgroundColor: '#FFFFFF',
                    color: '#0F172A',
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
            </div>

            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: 6 }}>
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
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: '1px solid #CBD5E1',
                  fontSize: '13px',
                  fontFamily: 'inherit',
                  color: '#0F172A',
                  resize: 'vertical',
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
                padding: '12px 20px',
                borderRadius: 8,
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                transition: 'background-color 0.15s ease',
              }}
            >
              <span>📢</span> Send to Site Environmental Officer
            </button>

            {/* Option 1: Trust reassurance line directly below submit button */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                fontSize: '12px',
                color: '#64748B',
                marginTop: -4,
              }}
            >
              <span style={{ fontSize: '15px' }}>🛡️</span>
              <span>
                <strong style={{ color: '#166534', fontWeight: 600 }}>100% Anonymous</strong> — No names, IC numbers, or phone numbers are collected.
              </span>
            </div>
          </form>
        </section>

        {/* SECTION: COMMUNITY INFORMATION & WORKING RULES (DROPDOWN ACCORDIONS) */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>
            Community Information & Guidelines
          </div>

          {/* ACCORDION 1: PERMITTED CONSTRUCTION WORKING HOURS */}
          <div
            style={{
              backgroundColor: '#1E293B',
              borderRadius: 10,
              border: '1px solid #334155',
              overflow: 'hidden',
              transition: 'border-color 0.15s ease',
            }}
          >
            <button
              type="button"
              onClick={() => toggleAccordion('hours')}
              style={{
                width: '100%',
                padding: '16px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: '16px' }}>🕒</span>
                <span style={{ fontSize: '15px', fontWeight: 700, color: '#FFFFFF' }}>
                  Permitted Construction Working Hours
                </span>
              </div>
              <span style={{ fontSize: '20px', fontWeight: 800, color: '#F59E0B' }}>
                {openAccordions.hours ? '−' : '+'}
              </span>
            </button>

            {openAccordions.hours && (
              <div
                style={{
                  padding: '16px 20px 20px',
                  borderTop: '1px solid #334155',
                  backgroundColor: '#0F172A',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ padding: '10px 14px', backgroundColor: '#1E293B', borderRadius: 8, border: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#F8FAFC' }}>Monday - Saturday (Daytime)</div>
                      <div style={{ fontSize: '12px', color: '#94A3B8' }}>Normal construction, cranes, and hoists</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: '#4ADE80' }}>08:00 - 18:00</div>
                      <div style={{ fontSize: '11px', color: '#94A3B8' }}>Limit: 60.00 dBA</div>
                    </div>
                  </div>

                  <div style={{ padding: '10px 14px', backgroundColor: '#1E293B', borderRadius: 8, border: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#F8FAFC' }}>Monday - Saturday (Evening)</div>
                      <div style={{ fontSize: '12px', color: '#94A3B8' }}>Quiet indoor finishing work only</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: '#FBBF24' }}>18:00 - 22:00</div>
                      <div style={{ fontSize: '11px', color: '#94A3B8' }}>Limit: 55.00 dBA</div>
                    </div>
                  </div>

                  <div style={{ padding: '10px 14px', backgroundColor: 'rgba(153, 27, 27, 0.25)', borderRadius: 8, border: '1px solid #991B1B', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#FCA5A5' }}>Sundays & Late Night</div>
                      <div style={{ fontSize: '12px', color: '#F87171' }}>STRICTLY NO WORK. 100% shutdown</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: '#FCA5A5' }}>22:00 - 08:00</div>
                      <div style={{ fontSize: '11px', color: '#F87171' }}>Limit: 45.00 dBA</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ACCORDION 2: HOW YOUR REPORT IS HANDLED */}
          <div
            style={{
              backgroundColor: '#1E293B',
              borderRadius: 10,
              border: '1px solid #334155',
              overflow: 'hidden',
              transition: 'border-color 0.15s ease',
            }}
          >
            <button
              type="button"
              onClick={() => toggleAccordion('handling')}
              style={{
                width: '100%',
                padding: '16px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: '16px' }}>⚖️</span>
                <span style={{ fontSize: '15px', fontWeight: 700, color: '#FFFFFF' }}>
                  How Your Report Is Handled
                </span>
              </div>
              <span style={{ fontSize: '20px', fontWeight: 800, color: '#F59E0B' }}>
                {openAccordions.handling ? '−' : '+'}
              </span>
            </button>

            {openAccordions.handling && (
              <div
                style={{
                  padding: '16px 20px 20px',
                  borderTop: '1px solid #334155',
                  backgroundColor: '#0F172A',
                }}
              >
                <p style={{ fontSize: '12px', color: '#94A3B8', margin: '0 0 12px 0' }}>
                  Every complaint is officially logged and tracked until resolved on site:
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <span style={{ backgroundColor: '#312E81', color: '#A5B4FC', fontWeight: 800, fontSize: '11px', padding: '3px 7px', borderRadius: 6, minWidth: 24, textAlign: 'center' }}>
                      1
                    </span>
                    <div style={{ fontSize: '13px', color: '#E2E8F0' }}>
                      <strong style={{ color: '#FFFFFF' }}>Site Environmental Officer Alert:</strong> The licensed officer receives your notification and checks boundary sound sensors immediately.
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <span style={{ backgroundColor: '#312E81', color: '#A5B4FC', fontWeight: 800, fontSize: '11px', padding: '3px 7px', borderRadius: 6, minWidth: 24, textAlign: 'center' }}>
                      2
                    </span>
                    <div style={{ fontSize: '13px', color: '#E2E8F0' }}>
                      <strong style={{ color: '#FFFFFF' }}>Immediate On-Site Action:</strong> The team investigates the noise source (e.g. idling truck, unshielded tool) and adjusts or turns it off within 30 minutes.
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <span style={{ backgroundColor: '#312E81', color: '#A5B4FC', fontWeight: 800, fontSize: '11px', padding: '3px 7px', borderRadius: 6, minWidth: 24, textAlign: 'center' }}>
                      3
                    </span>
                    <div style={{ fontSize: '13px', color: '#E2E8F0' }}>
                      <strong style={{ color: '#FFFFFF' }}>Resolution Updated in Public Log:</strong> What was done to fix the issue is posted in the log below so you can verify the result.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ACCORDION 3: RECENT COMMUNITY FEEDBACK & ACTIONS TAKEN */}
          <div
            style={{
              backgroundColor: '#1E293B',
              borderRadius: 10,
              border: '1px solid #334155',
              overflow: 'hidden',
              transition: 'border-color 0.15s ease',
            }}
          >
            <button
              type="button"
              onClick={() => toggleAccordion('feedback')}
              style={{
                width: '100%',
                padding: '16px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: '16px' }}>📋</span>
                <span style={{ fontSize: '15px', fontWeight: 700, color: '#FFFFFF' }}>
                  Recent Community Feedback & Actions Taken
                </span>
                <span
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    color: '#94A3B8',
                    fontSize: '11px',
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: 999,
                  }}
                >
                  {complaints.length} Logged
                </span>
              </div>
              <span style={{ fontSize: '20px', fontWeight: 800, color: '#F59E0B' }}>
                {openAccordions.feedback ? '−' : '+'}
              </span>
            </button>

            {openAccordions.feedback && (
              <div
                style={{
                  padding: '16px 20px 20px',
                  borderTop: '1px solid #334155',
                  backgroundColor: '#0F172A',
                }}
              >
                <p style={{ fontSize: '12px', color: '#94A3B8', margin: '0 0 12px 0' }}>
                  Official log of resident inquiries reviewed and resolved by the site environmental team.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 320, overflowY: 'auto' }}>
                  {complaints.length === 0 ? (
                    <div style={{ color: '#64748B', fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>
                      No active community noise inquiries logged.
                    </div>
                  ) : (
                    complaints.map((c) => (
                      <div
                        key={c.id}
                        style={{
                          border: '1px solid #334155',
                          borderRadius: 8,
                          padding: '12px 14px',
                          backgroundColor: '#1E293B',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: 4 }}>
                          <span style={{ fontWeight: 700, color: '#F8FAFC' }}>{c.who}</span>
                          <span style={{ color: '#94A3B8' }}>{c.date}</span>
                        </div>
                        <div style={{ fontSize: '13px', color: '#CBD5E1', marginBottom: 6 }}>
                          {c.issue}
                        </div>
                        <div style={{ fontSize: '12px' }}>
                          {c.closed ? (
                            <div style={{ color: '#4ADE80', backgroundColor: 'rgba(22, 101, 52, 0.25)', padding: '4px 8px', borderRadius: 4, border: '1px solid #166534' }}>
                              <strong>✓ Resolved by EO:</strong> {c.action}
                            </div>
                          ) : (
                            <div style={{ color: '#FBBF24', backgroundColor: 'rgba(180, 83, 9, 0.25)', padding: '4px 8px', borderRadius: 4, border: '1px solid #92400E' }}>
                              <strong>⏳ Under Review:</strong> Site Environmental Officer has been alerted.
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div style={{ marginTop: 14, paddingTop: 10, borderTop: '1px solid #334155', fontSize: '12px', color: '#94A3B8' }}>
                  💡 <strong>On-Site Fast Resolution:</strong> Issues reported here are resolved directly on-site to preserve neighborhood tranquility.
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
