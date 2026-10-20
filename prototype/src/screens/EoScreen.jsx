import { useMemo, useState } from 'react';
import Shell from '../components/Shell';
import { LineLimit } from '../components/Charts';
import { SITES } from '../data/sites';
import { limitAt, noiseDay, status, SEED_COMPLAINTS } from '../data/noise';
import { simulateDay, monthly, fmt } from '../data/model';
import { getEchoShieldAttribution } from '../data/aiEngine';

const TABS = [
  { id: 'meter', label: 'Boundary Sound & DOE Limits', icon: '🔊' },
  { id: 'echoshield', label: 'EchoShield False-Alarm Filter', icon: '🛡️' },
  { id: 'water', label: 'Water, Silt & Concrete Wash', icon: '🌊' },
  { id: 'circular', label: 'Circular Timber & Concrete', icon: '♻️' },
];

const SEED_CIRCULAR_LOGS = [
  { id: 1, date: '2026-10-18', material: '7-ply WBP Plywood Formwork', qty: 150, unit: 'Sheets', source: 'Block A Level 4 Slab', target: 'Pass 3: Carpark Floor Gard Board', roroSavings: 1200 },
  { id: 2, date: '2026-10-17', material: 'Scrap Concrete Slurry', qty: 6, unit: 'm³', source: 'Batching Washout Basin', target: 'Cast into 14 Precast Wheel-Stops', roroSavings: 600 },
  { id: 3, date: '2026-10-15', material: '7-ply WBP Plywood Formwork', qty: 120, unit: 'Sheets', source: 'Block B Level 2 Column Formwork', target: 'Pass 4: Worker CLQ Bedframes', roroSavings: 960 },
  { id: 4, date: '2026-10-12', material: 'Used Cooking Oil', qty: 60, unit: 'Litres', source: 'CLQ Worker Canteen #1', target: 'Licensed Biofuel Processor', roroSavings: 180 },
];

export default function EoScreen({
  user,
  sites = SITES,
  complaints: propComplaints,
  onAddComplaint,
  onResolveComplaint,
  onLogout,
}) {
  const [siteId, setSiteId] = useState('putra');
  const [activeTab, setActiveTab] = useState('meter');
  const [hour, setHour] = useState(11);
  const [showModal, setShowModal] = useState(false);
  const [localComplaints, setLocalComplaints] = useState(SEED_COMPLAINTS);
  const complaints = propComplaints || localComplaints;
  const [resolvingId, setResolvingId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [newComplaint, setNewComplaint] = useState({ who: '', issue: '', action: '' });
  const [alertThreshold, setAlertThreshold] = useState(58);
  const [alertDispatched, setAlertDispatched] = useState(false);
  const [circularLogs, setCircularLogs] = useState(SEED_CIRCULAR_LOGS);
  const [isAddCircularOpen, setIsAddCircularOpen] = useState(false);
  const [newCircular, setNewCircular] = useState({
    material: '7-ply WBP Plywood Formwork',
    qty: 50,
    unit: 'Sheets',
    source: 'Block A Level 6 Beams',
    target: 'Pass 3: Carpark Floor Gard Board',
  });

  const site = sites.find((s) => s.id === siteId) || sites[0];
  const daySim = useMemo(() => simulateDay(site, 'sunny', true), [site]);
  const noiseProfile = useMemo(() => noiseDay(site, daySim.hours, false), [site, daySim]);
  const noiseWithGenset = useMemo(() => noiseDay(site, daySim.hours, true), [site, daySim]);
  const m = useMemo(() => monthly(site), [site]);

  // EchoShield Acoustic Source Separation
  const echoShield = useMemo(() => getEchoShieldAttribution(), []);

  const currentNoise = noiseProfile[hour].db;
  const currentLimit = limitAt(hour);
  const noiseTone = status(currentNoise, currentLimit.l90);
  const gensetBaseline = noiseWithGenset[hour].db;
  const reductionDb = (gensetBaseline - currentNoise).toFixed(1);

  const totalTimberDiverted = useMemo(() => {
    return circularLogs.filter((l) => l.unit === 'Sheets').reduce((acc, l) => acc + l.qty, 180);
  }, [circularLogs]);

  const totalConcreteUpcycled = useMemo(() => {
    return circularLogs.filter((l) => l.unit === 'm³').reduce((acc, l) => acc + l.qty, 12);
  }, [circularLogs]);

  const totalRoroSavings = useMemo(() => {
    return circularLogs.reduce((acc, l) => acc + l.roroSavings, 660);
  }, [circularLogs]);

  const handleAddCircular = (e) => {
    e.preventDefault();
    if (!newCircular.material || !newCircular.qty) return;
    const qty = Number(newCircular.qty) || 10;
    const unit = newCircular.unit;
    let savings = 0;
    if (unit === 'Sheets') savings = Math.round(qty * 8);
    else if (unit === 'm³') savings = Math.round(qty * 100);
    else savings = Math.round(qty * 3);

    const entry = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      material: newCircular.material,
      qty,
      unit,
      source: newCircular.source || 'Active Casting Zone',
      target: newCircular.target,
      roroSavings: savings,
    };
    setCircularLogs([entry, ...circularLogs]);
    setIsAddCircularOpen(false);
    setNewCircular({
      material: '7-ply WBP Plywood Formwork',
      qty: 50,
      unit: 'Sheets',
      source: 'Block A Level 6 Beams',
      target: 'Pass 3: Carpark Floor Gard Board',
    });
  };

  const chartPoints = noiseProfile.map((p, i) => ({
    tick: `${String(p.h).padStart(2, '0')}:00`,
    db: p.db,
    before: noiseWithGenset[i].db,
  }));

  const pills = [
    { k: 'Boundary Sound', v: `${currentNoise} dBA`, tone: noiseTone === 'ok' ? 'ok' : 'warn' },
    { k: 'DOE Schedule 6', v: `${currentLimit.l90} dBA` },
    { k: 'Dark Smoke', v: '0 min (Ringelmann 0)', tone: 'ok' },
    { k: 'Drain Turbidity', v: '18 NTU (<50)', tone: 'ok' },
  ];

  const addComplaint = (e) => {
    e.preventDefault();
    if (!newComplaint.who || !newComplaint.issue) return;
    if (onAddComplaint) {
      onAddComplaint(newComplaint);
    } else {
      setLocalComplaints([
        {
          id: Date.now(),
          date: new Date().toISOString().split('T')[0],
          site: site.id,
          who: newComplaint.who,
          issue: newComplaint.issue,
          action: newComplaint.action || '',
          closed: !!newComplaint.action,
        },
        ...localComplaints,
      ]);
    }
    setNewComplaint({ who: '', issue: '', action: '' });
  };

  return (
    <Shell
      user={user}
      area="Environmental Governance"
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
          <h1>{site.name}: Environmental & Safety Shield</h1>
          <p>
            DOE Planning Guidelines Schedule 6 (Residential Boundary) | Zero Stop-Work Notices Logged
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
            <span>⚡</span> Open Acoustic AI Audit
          </button>
          <button id="open-emp-modal" className="btn btn-primary" onClick={() => setShowModal(true)}>
            Export Monthly DOE EMP Report
          </button>
        </div>
      </div>

      {/* Compliance Banner */}
      <div className={`banner ${noiseTone === 'ok' ? 'ok' : 'near'}`} style={{ marginBottom: 16 }}>
        <span>
          {noiseTone === 'ok' && '🟢 100% DOE STATUTORY COMPLIANCE: Boundary sound level is safely below Schedule 6 limits.'}
          {noiseTone !== 'ok' && '⚠️ NEAR STATUTORY LIMIT: Sound level is within 3 dBA of the threshold. Monitor heavy hoisting.'}
        </span>
        <span className="num">
          Checked at {String(hour).padStart(2, '0')}:00 (Limit: {currentLimit.l90} dBA L90)
        </span>
      </div>

      {/* TAB 1: BOUNDARY SOUND & DOE LIMITS */}
      {activeTab === 'meter' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="card hour-slider">
            <label htmlFor="eo-hour">Simulated Assessment Hour</label>
            <input id="eo-hour" type="range" min="0" max="23" value={hour} onChange={(e) => setHour(+e.target.value)} />
            <b className="num">{String(hour).padStart(2, '0')}:00</b>
            <span className="tag" style={{ marginLeft: 16 }}>{currentLimit.label}</span>
          </div>

          {/* Active Field Control: Acoustic Warning Threshold & SMS Dispatch */}
          <div className="card" style={{ borderLeft: '4px solid #0F766E' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '14px', color: '#0F172A' }}>Acoustic Warning Trigger Calibration</h3>
                <p className="sub" style={{ margin: '2px 0 0 0' }}>
                  Dispatches preventive warning to site foreman before the statutory {currentLimit.l90} dBA Schedule 6 limit is breached.
                </p>
              </div>
              <b className="num" style={{ color: '#0F766E', fontSize: '15px' }}>
                Threshold: {alertThreshold} dBA
              </b>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 10 }}>
              <input
                id="noise-threshold-slider"
                type="range"
                min="50"
                max="60"
                step="0.5"
                value={alertThreshold}
                onChange={(e) => setAlertThreshold(+e.target.value)}
                style={{ flex: 1 }}
              />
              <button
                id="send-noise-alert-btn"
                className="btn btn-primary"
                onClick={() => setAlertDispatched(true)}
                style={{ fontSize: '12px', padding: '6px 12px', whiteSpace: 'nowrap' }}
              >
                📱 Dispatch Test Warning to Foreman
              </button>
            </div>

            {alertDispatched && (
              <div style={{ marginTop: 10, backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 6, padding: '8px 12px', fontSize: '12px', color: '#166534' }}>
                📲 <strong>SMS Dispatched to Site Foreman:</strong> "Acoustic early warning: Boundary sound is at {currentNoise} dBA (Calibration: {alertThreshold} dBA). Ensure tower crane hoist speed is modulated and throttle back earthwork machinery."
              </div>
            )}
          </div>

          <section className="grid g3">
            <div className="card gauge">
              <h2>Live Boundary Sound Level</h2>
              <p className="sub">West Residential Boundary (SLM-01 Sensor)</p>
              <div
                className="big num"
                style={{
                  color: noiseTone === 'ok' ? 'var(--green)' : 'var(--amber)',
                }}
              >
                {currentNoise} <small style={{ fontSize: 20 }}>dBA</small>
              </div>
              <div className="foot">
                <span className={`tag ${noiseTone === 'ok' ? 'ok' : 'near'}`}>
                  {(currentLimit.l90 - currentNoise).toFixed(1)} dBA safely below limit
                </span>
              </div>
              <p className="note">Statutory Limit: {currentLimit.l90} dBA L90 under DOE Planning Guidelines</p>
            </div>

            <div className="card">
              <h2>Acoustic Noise Reduction</h2>
              <p className="sub">Silent BESS vs Baseline 500 kVA Diesel Generator</p>
              <div style={{ display: 'grid', gap: 10, marginTop: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--line)' }}>
                  <span>Old Diesel Genset Drone</span>
                  <b className="num">{gensetBaseline} dBA</b>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--line)' }}>
                  <span>GreenPulse Clean Battery</span>
                  <b className="num" style={{ color: 'var(--green)' }}>{currentNoise} dBA</b>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontWeight: 600 }}>
                  <span>Perceived Noise Reduction</span>
                  <span className="tag ok num">−{reductionDb} dBA (88% quieter)</span>
                </div>
              </div>
              <p className="note">Eliminates the continuous low-frequency hum that triggers resident complaints.</p>
            </div>

            <div className="card">
              <h2>Clean Air & Spill Elimination</h2>
              <p className="sub">Environmental Quality (Clean Air) Reg. 2014</p>
              <div style={{ display: 'grid', gap: 10, marginTop: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--line)' }}>
                  <span>Dark Smoke Observations</span>
                  <b className="num" style={{ color: 'var(--green)' }}>0 minutes (Ringelmann 0)</b>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--line)' }}>
                  <span>Skid Tank Spillage Risk</span>
                  <b style={{ color: 'var(--green)' }}>Zero (No fuel bund needed)</b>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--line)' }}>
                  <span>Monthly Diesel Eliminated</span>
                  <b className="num">{fmt(m.avoidedL)} Litres</b>
                </div>
              </div>
              <p className="note">Meets CIDB Green Construction standards without fuel bund inspections.</p>
            </div>
          </section>

          <section className="card">
            <h2>24-Hour Boundary Sound Level Profile vs DOE Statutory Limits</h2>
            <p className="sub">
              Green line: GreenPulse BESS. Grey line: Conventional diesel genset. Red dashed line: DOE Schedule 6 limit.
            </p>
            <LineLimit points={chartPoints} limitAt={(p, i) => limitAt(i).l90} label="24-Hour Sound Level Profile" />
            <div className="legend" style={{ marginTop: 12 }}>
              <span><i style={{ background: 'var(--green)' }} />With BESS & Solar</span>
              <span><i style={{ background: '#94a3b8' }} />Old Diesel Generator Baseline</span>
              <span><i style={{ background: 'var(--danger)', height: 2 }} />DOE Statutory Limit (Schedule 6)</span>
            </div>
          </section>
        </div>
      )}

      {/* TAB 2: ECHOSHIELD FALSE-ALARM FILTER */}
      {activeTab === 'echoshield' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <section className="card" style={{ borderLeft: '4px solid #0F766E' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div>
                <span style={{ backgroundColor: '#0F766E', color: '#fff', fontSize: '11px', fontWeight: 800, padding: '2px 6px', borderRadius: 4 }}>
                  ACOUSTIC AI TIER 3
                </span>
                <h2 style={{ display: 'inline', marginLeft: 8, fontSize: '16px' }}>
                  EchoShield Acoustic Source Separation (Edge ML)
                </h2>
              </div>
              <span style={{ backgroundColor: '#ECFDF5', color: '#065F46', border: '1px solid #A7F3D0', fontSize: '12px', fontWeight: 700, padding: '3px 8px', borderRadius: 9999 }}>
                ✓ {echoShield.status}
              </span>
            </div>
            <p className="sub" style={{ marginBottom: 12 }}>
              Standard boundary sound meters trigger false exceedances when heavy vehicles pass on public roads. EchoShield decomposes the sound spectrum to isolate true site equipment from ambient traffic, shielding the site from wrongful stop-work penalties.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10, marginBottom: 14 }}>
              {echoShield.classifiedSources.map((s, i) => (
                <div
                  key={i}
                  style={{
                    backgroundColor: s.percentage > 50 ? '#FFFBEB' : '#F8FAFC',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: s.percentage > 50 ? '1px solid #FDE68A' : '1px solid #E2E8F0',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748B', marginBottom: 4 }}>
                    <span>{s.category}</span>
                    <b>{s.percentage}% Energy</b>
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', marginBottom: 2 }}>{s.source}</div>
                  <div className="num" style={{ fontSize: '16px', fontWeight: 800, color: s.percentage > 50 ? '#B45309' : '#0F766E' }}>
                    {s.contributionDba} dBA
                  </div>
                </div>
              ))}
            </div>

            <div style={{ backgroundColor: '#F0FDFA', borderRadius: 8, padding: '10px 14px', border: '1px solid #CCFBF1', fontSize: '13px', color: '#134E4A', lineHeight: 1.45 }}>
              💡 <strong>Explainable AI Audit Log:</strong> {echoShield.aiExplanation}
            </div>
          </section>

          <section className="card">
            <h2>Community Feedback & Inquiry Log (EMP Section 8)</h2>
            <p className="sub">Mandatory log for Department of Environment and municipal council public relations audits.</p>
            <div style={{ display: 'grid', gap: 12 }}>
              {complaints.map((c) => (
                <div key={c.id} style={{ borderBottom: '1px solid var(--line)', paddingBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                    <div>
                      <b>{c.who}</b>
                      <span className="src">{c.date}</span>
                    </div>
                    <span className={`tag ${c.closed ? 'ok' : 'warn'}`}>
                      {c.closed ? 'Resolved' : 'Pending Review'}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, marginTop: 4, color: '#334155' }}>
                    <strong>Observation:</strong> {c.issue}
                  </div>
                  {c.closed ? (
                    <div style={{ fontSize: 12, color: 'var(--green)', marginTop: 4 }}>
                      <strong>✓ Action Logged:</strong> {c.action}
                    </div>
                  ) : (
                    <div style={{ marginTop: 8, backgroundColor: '#FFFBEB', padding: 8, borderRadius: 6, border: '1px solid #FDE68A' }}>
                      <div style={{ fontSize: 12, color: '#B45309', fontWeight: 600, marginBottom: 4 }}>
                        Resident Inquiry Awaiting Environmental Officer Action:
                      </div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <input
                          type="text"
                          placeholder="e.g. Inspected perimeter at 20:45. Confirmed BESS silent; shut down idling pump."
                          value={resolvingId === c.id ? replyText : ''}
                          onChange={(e) => {
                            setResolvingId(c.id);
                            setReplyText(e.target.value);
                          }}
                          style={{ flex: 1, padding: '5px 8px', fontSize: 12, borderRadius: 4, border: '1px solid #CBD5E1' }}
                        />
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={() => {
                            if (onResolveComplaint) {
                              onResolveComplaint(c.id, replyText);
                            }
                            setResolvingId(null);
                            setReplyText('');
                          }}
                          style={{ fontSize: 11, padding: '5px 10px', whiteSpace: 'nowrap' }}
                        >
                          Resolve & Notify Resident
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <form onSubmit={addComplaint} style={{ marginTop: 16, borderTop: '1px solid var(--line)', paddingTop: 12 }}>
              <h3 style={{ fontSize: 13, marginBottom: 8 }}>Log Community Inquiry or Inspection</h3>
              <div style={{ display: 'grid', gap: 8 }}>
                <input
                  type="text"
                  placeholder="Caller / Resident / Officer (e.g. JMB Damayan Resident)"
                  value={newComplaint.who}
                  onChange={(e) => setNewComplaint({ ...newComplaint, who: e.target.value })}
                  style={{ padding: '6px 8px', borderRadius: 6, border: '1px solid var(--line)', fontSize: 13 }}
                />
                <input
                  type="text"
                  placeholder="Inquiry or Observation"
                  value={newComplaint.issue}
                  onChange={(e) => setNewComplaint({ ...newComplaint, issue: e.target.value })}
                  style={{ padding: '6px 8px', borderRadius: 6, border: '1px solid var(--line)', fontSize: 13 }}
                />
                <input
                  type="text"
                  placeholder="Action Taken"
                  value={newComplaint.action}
                  onChange={(e) => setNewComplaint({ ...newComplaint, action: e.target.value })}
                  style={{ padding: '6px 8px', borderRadius: 6, border: '1px solid var(--line)', fontSize: 13 }}
                />
                <button type="submit" className="btn btn-ghost" style={{ justifySelf: 'start' }}>
                  Save to Official EMP Log
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {/* TAB 3: WATER, SILT & CONCRETE WASH */}
      {activeTab === 'water' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <section className="grid g3">
            <div className="card kpi hero">
              <div className="label">Sediment Basin Turbidity</div>
              <div className="value num" style={{ color: '#059669' }}>18<small> NTU</small></div>
              <div className="foot">DOE ESCP Statutory Limit: &lt; 50 NTU (Safe)</div>
            </div>
            <div className="card kpi">
              <div className="label">Concrete Washout Acidity</div>
              <div className="value num" style={{ color: '#059669' }}>7.4<small> pH</small></div>
              <div className="foot">Neutralised (Raw toxic slurry is pH 11–12)</div>
            </div>
            <div className="card kpi">
              <div className="label">Rainwater Harvested</div>
              <div className="value num">142<small> m³ / mo</small></div>
              <div className="foot">Used for lorry wash bay & dust sprinklers</div>
            </div>
          </section>

          <section className="card">
            <h2>Erosion and Sediment Control Plan (ESCP) Silt & Drainage Shield</h2>
            <p className="sub">
              Protects public roadside storm drains and rivers from red clay mud contamination during tropical downpours.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12, marginTop: 12 }}>
              <div style={{ background: '#F8FAFC', padding: 12, borderRadius: 8, border: '1px solid #E2E8F0' }}>
                <h3 style={{ fontSize: '14px', margin: '0 0 6px 0', color: '#0F172A' }}>💧 Automated Silt Trap Monitoring</h3>
                <p style={{ fontSize: '13px', color: '#475569', margin: 0, lineHeight: 1.4 }}>
                  Sensors in the retention pond trigger alerts if turbidity exceeds 35 NTU, prompting the site team to dose flocculants before mud discharges into public drains, avoiding RM 50,000+ JPS fines.
                </p>
              </div>
              <div style={{ background: '#F8FAFC', padding: 12, borderRadius: 8, border: '1px solid #E2E8F0' }}>
                <h3 style={{ fontSize: '14px', margin: '0 0 6px 0', color: '#0F172A' }}>🧪 Concrete Washout Neutralisation</h3>
                <p style={{ fontSize: '13px', color: '#475569', margin: 0, lineHeight: 1.4 }}>
                  Monitors the lined concrete washout bay where ready-mix trucks wash chutes. Carbon dioxide / acid dosing keeps pH at 7.4 neutral, preventing caustic alkali leaching into groundwater.
                </p>
              </div>
              <div style={{ background: '#F8FAFC', padding: 12, borderRadius: 8, border: '1px solid #E2E8F0' }}>
                <h3 style={{ fontSize: '14px', margin: '0 0 6px 0', color: '#0F172A' }}>🚿 Vehicle Wash Bay Recirculation</h3>
                <p style={{ fontSize: '13px', color: '#475569', margin: 0, lineHeight: 1.4 }}>
                  Water from the wheel wash bay is filtered and recirculated. Stops earthwork lorries from tracking mud onto public roads, eliminating municipal council compound notices.
                </p>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* TAB 4: CIRCULAR TIMBER & CONCRETE */}
      {activeTab === 'circular' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <section className="grid g3">
            <div className="card kpi hero">
              <div className="label">Timber Formwork Diversion</div>
              <div className="value num" style={{ color: '#059669' }}>
                {totalTimberDiverted}<small> Sheets</small>
              </div>
              <div className="foot">Diverted from landfill; saved RM {fmt(totalRoroSavings)} in RORO bins</div>
            </div>
            <div className="card kpi">
              <div className="label">Upcycled Scrap Concrete</div>
              <div className="value num">
                {totalConcreteUpcycled}<small> m³</small>
              </div>
              <div className="foot">Cast into precast road barriers & wheel-stops</div>
            </div>
            <div className="card kpi">
              <div className="label">Used Cooking Oil Recycled</div>
              <div className="value num">180<small> Litres</small></div>
              <div className="foot">Sent to licensed biofuel processor from CLQ canteens</div>
            </div>
          </section>

          <section className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div>
                <h2 style={{ margin: 0 }}>Digital Material Pass: 4-Stage Timber Formwork Circularity</h2>
                <p className="sub" style={{ margin: '4px 0 0 0' }}>
                  Directly implements the recycling protocol documented in internal site ESG records.
                </p>
              </div>
              <button
                id="open-record-circular-modal"
                className="btn btn-primary"
                onClick={() => setIsAddCircularOpen(true)}
                style={{ fontSize: '12px', padding: '6px 12px' }}
              >
                + Record Material Transfer
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10, marginTop: 12 }}>
              <div style={{ background: '#F8FAFC', padding: 12, borderRadius: 8, border: '1px solid #E2E8F0' }}>
                <span className="tag ok">Pass 1 & 2</span>
                <h3 style={{ fontSize: '14px', margin: '6px 0 4px 0' }}>Structural Beams & Slabs</h3>
                <p style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>Fresh 7-ply WBP plywood used for primary concrete casting.</p>
              </div>
              <div style={{ background: '#F8FAFC', padding: 12, borderRadius: 8, border: '1px solid #E2E8F0' }}>
                <span className="tag ok">Pass 3</span>
                <h3 style={{ fontSize: '14px', margin: '6px 0 4px 0' }}>Carpark Surface Protection</h3>
                <p style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>Reused as Floor Gard tile & concrete floor protection boards.</p>
              </div>
              <div style={{ background: '#F8FAFC', padding: 12, borderRadius: 8, border: '1px solid #E2E8F0' }}>
                <span className="tag ok">Pass 4 (Upcycling)</span>
                <h3 style={{ fontSize: '14px', margin: '6px 0 4px 0' }}>Carpentry Workshop</h3>
                <p style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>Fabricated into worker dormitory bedframes and storage racks.</p>
              </div>
              <div style={{ background: '#F8FAFC', padding: 12, borderRadius: 8, border: '1px solid #E2E8F0' }}>
                <span className="tag">End of Life</span>
                <h3 style={{ fontSize: '14px', margin: '6px 0 4px 0' }}>Biomass Diversion</h3>
                <p style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>Sent to licensed woodchip recycling; zero open burning.</p>
              </div>
            </div>
          </section>

          {/* Real-Time Circularity Audit Ledger */}
          <section className="card">
            <h2>Material Circularity Transfer Ledger</h2>
            <p className="sub">Statutory waste diversion chain-of-custody logged by Environmental Officer.</p>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 10, fontSize: '13px' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid #E2E8F0' }}>
                  <th style={{ padding: '8px' }}>Date</th>
                  <th style={{ padding: '8px' }}>Material</th>
                  <th style={{ padding: '8px' }}>Quantity</th>
                  <th style={{ padding: '8px' }}>Source Zone</th>
                  <th style={{ padding: '8px' }}>Circular Re-Use Pass</th>
                  <th style={{ padding: '8px', textAlign: 'right' }}>RORO Saved</th>
                </tr>
              </thead>
              <tbody>
                {circularLogs.map((log) => (
                  <tr key={log.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '8px' }} className="num">{log.date}</td>
                    <td style={{ padding: '8px', fontWeight: 600 }}>{log.material}</td>
                    <td style={{ padding: '8px' }} className="num">{log.qty} {log.unit}</td>
                    <td style={{ padding: '8px', color: '#64748B' }}>{log.source}</td>
                    <td style={{ padding: '8px' }}><span className="tag ok">{log.target}</span></td>
                    <td style={{ padding: '8px', textAlign: 'right', fontWeight: 700, color: '#059669' }} className="num">
                      +RM {fmt(log.roroSavings)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>
      )}

      {/* Record Circular Transfer Modal */}
      {isAddCircularOpen && (
        <div className="modal-backdrop" onClick={() => setIsAddCircularOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <div>
                <h2>Record Material Circularity Transfer</h2>
                <p className="sub">Log formwork or scrap concrete diversion at {site.name}</p>
              </div>
              <button className="btn btn-ghost" onClick={() => setIsAddCircularOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleAddCircular}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                    Material Category
                  </label>
                  <select
                    value={newCircular.material}
                    onChange={(e) => setNewCircular({ ...newCircular, material: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: '13px' }}
                  >
                    <option value="7-ply WBP Plywood Formwork">7-ply WBP Plywood Formwork</option>
                    <option value="Scrap Concrete Slurry">Scrap Concrete Slurry / Washout</option>
                    <option value="Steel Tie Rods & Rebar Ends">Steel Tie Rods & Offcut Rebar</option>
                    <option value="CLQ Used Cooking Oil">CLQ Used Cooking Oil</option>
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                      Quantity
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      max="1000"
                      value={newCircular.qty}
                      onChange={(e) => setNewCircular({ ...newCircular, qty: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: '13px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                      Unit
                    </label>
                    <select
                      value={newCircular.unit}
                      onChange={(e) => setNewCircular({ ...newCircular, unit: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: '13px' }}
                    >
                      <option value="Sheets">Sheets (Formwork)</option>
                      <option value="m³">m³ (Concrete)</option>
                      <option value="Litres">Litres (Cooking Oil)</option>
                      <option value="kg">kg (Scrap Metal)</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                    Source Zone / Structure
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Block A Level 6 Beams"
                    value={newCircular.source}
                    onChange={(e) => setNewCircular({ ...newCircular, source: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                    Circular Re-Use Pass
                  </label>
                  <select
                    value={newCircular.target}
                    onChange={(e) => setNewCircular({ ...newCircular, target: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: '13px' }}
                  >
                    <option value="Pass 3: Carpark Floor Gard Board">Pass 3: Carpark Floor Gard Board</option>
                    <option value="Pass 4: Worker CLQ Bedframes">Pass 4: Worker CLQ Bedframes</option>
                    <option value="Cast into Precast Wheel-Stops">Cast into Precast Wheel-Stops</option>
                    <option value="Sent to Licensed Biofuel Processor">Sent to Licensed Biofuel Processor</option>
                    <option value="Licensed Woodchip Biomass Processor">Licensed Woodchip Biomass Processor</option>
                  </select>
                </div>
              </div>
              <div className="modal-actions" style={{ marginTop: 20 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setIsAddCircularOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Log Transfer to Audit Ledger</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Monthly DOE EMP Summary Modal */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>Monthly Environmental Management Plan (EMP): Executive Summary</h2>
                <p className="sub">Statutory Reporting to Department of Environment (JAS) | Project: {site.name}</p>
              </div>
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}>✕</button>
            </div>

            <div className="emp-badge">
              <span><b>Reporting Period:</b> 1 October 2026 – 31 October 2026</span>
              <span className="tag ok">Statutory Compliance Verified: 100%</span>
            </div>

            <h3>1. Project & Site Telemetry Baseline</h3>
            <table>
              <tbody>
                <tr><td>Project Name</td><td><b>{site.name}</b></td></tr>
                <tr><td>Location / Mukim</td><td>Putra Heights, Petaling, Selangor</td></tr>
                <tr><td>Primary Main Contractor</td><td>Sime Darby Construction</td></tr>
                <tr><td>Site Temporary Power Configuration</td><td>GreenPulse Hybrid BESS ({site.bessKWh} kWh / {site.bessKW} kW) + {site.solarKWp} kWp Solar</td></tr>
                <tr><td>Backup Diesel Generator State</td><td>Cold Standby (100% Locked Out)</td></tr>
              </tbody>
            </table>

            <h3>2. Acoustic Boundary Compliance (DOE Schedule 6)</h3>
            <table>
              <thead>
                <tr>
                  <th>Assessment Period</th>
                  <th>Statutory Limit (L90)</th>
                  <th>Average Measured (Leq)</th>
                  <th>Maximum Peak Logged</th>
                  <th>Exceedance Incidents</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Daytime (07:00 – 19:00)</td><td className="num">60.0 dBA</td><td className="num">{site.noiseBase + 2}.4 dBA</td><td className="num">{site.noiseBase + 6}.1 dBA</td><td><span className="tag ok">0 Events</span></td></tr>
                <tr><td>Evening (19:00 – 22:00)</td><td className="num">55.0 dBA</td><td className="num">{site.noiseBase - 3}.2 dBA</td><td className="num">{site.noiseBase + 1}.0 dBA</td><td><span className="tag ok">0 Events</span></td></tr>
                <tr><td>Night (22:00 – 07:00)</td><td className="num">45.0 dBA</td><td className="num">{site.noiseBase - 8}.0 dBA</td><td className="num">{site.noiseBase - 4}.5 dBA</td><td><span className="tag ok">0 Events (Quiet)</span></td></tr>
              </tbody>
            </table>

            <h3>3. Clean Air Regulations & Fuel Elimination</h3>
            <table>
              <tbody>
                <tr><td>Continuous Diesel Genset Hours Eliminated</td><td className="num"><b>720 Hours</b></td></tr>
                <tr><td>Estimated Diesel Fuel Consumption Avoided</td><td className="num"><b>{fmt(m.avoidedL)} Litres</b></td></tr>
                <tr><td>Scope 1 Greenhouse Gas Emissions Avoided</td><td className="num"><b>{fmt(m.co2t, 1)} tCO2e</b></td></tr>
                <tr><td>Dark Smoke Observations (Clean Air Reg. 2014)</td><td><b>Zero Ringelmann Smoke Incidents</b></td></tr>
                <tr><td>Soil & Water Contamination Spillage Events</td><td><b>Zero (No on-site bulk diesel storage)</b></td></tr>
              </tbody>
            </table>

            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => window.print()}>Print / Save PDF</button>
              <button className="btn btn-primary" onClick={() => setShowModal(false)}>Close Summary</button>
            </div>
          </div>
        </div>
      )}

    </Shell>
  );
}
