import { useState, useMemo } from 'react';
import Shell from '../components/Shell';
import { LineLimit } from '../components/Charts';
import { SITES } from '../data/sites';
import { limitAt, noiseDay, status } from '../data/noise';

const TABS = [
  { id: 'water', label: 'Rain & Silt Runoff', icon: '🌧️' },
  { id: 'noise', label: 'Noise & Dust Limits', icon: '🔊' },
  { id: 'checklist', label: 'Daily Site Checklist & Photos', icon: '📋' },
  { id: 'complaints', label: 'Complaints & Actions', icon: '📢' },
];

const INITIAL_CHECKLIST = [
  {
    id: 1,
    title: 'Perimeter Drains & Silt Traps',
    location: 'North & West Boundary',
    status: 'pass',
    note: 'Silt traps desilted yesterday. Flow clear and unobstructed.',
    photoName: 'silt_trap_north.jpg',
    photoTime: 'Today 08:30 AM',
  },
  {
    id: 2,
    title: 'Silt Fences & Geotextile Barriers',
    location: 'Slope Area (Near Public Road)',
    status: 'pass',
    note: 'Silt fences upright, tightly staked with no tears.',
    photoName: 'silt_fence_slope.jpg',
    photoTime: 'Today 08:45 AM',
  },
  {
    id: 3,
    title: 'Chemical & Diesel Storage Bunding',
    location: 'Machinery Yard',
    status: 'pass',
    note: 'Double containment bunding dry and sealed. Zero fuel spills.',
    photoName: 'fuel_bund_secure.jpg',
    photoTime: 'Today 09:10 AM',
  },
  {
    id: 4,
    title: 'Wheel Wash Bay & Road Cleanliness',
    location: 'Main Site Exit Gate',
    status: 'pass',
    note: 'High-pressure wash bay running. Water sprayed on access road.',
    photoName: 'wheel_wash_exit.jpg',
    photoTime: 'Today 09:30 AM',
  },
  {
    id: 5,
    title: 'Solid Waste Segregation',
    location: 'Sub-contractor Work Zone',
    status: 'pass',
    note: 'Scrap timber and metal sorted in bins. Zero open burning.',
    photoName: 'waste_segregation.jpg',
    photoTime: 'Today 09:45 AM',
  },
];

const INITIAL_COMPLAINTS = [
  {
    id: 1,
    date: '2026-10-19',
    who: 'Resident (Elmina Green Phase 3)',
    issue: 'Mud tracked onto public road by tipper trucks leaving site.',
    action: 'Dispatched site water bowser to wash public road within 15 minutes. Increased wash bay water pressure.',
    closed: true,
  },
  {
    id: 2,
    date: '2026-10-17',
    who: 'Neighbour (Kanopi Residences Buffer)',
    issue: 'Noise heard at 11:00 PM near residential boundary.',
    action: 'Verified GreenPulse battery was silent and generator was 100% locked off. Noise was external road repair by local council.',
    closed: true,
  },
  {
    id: 3,
    date: '2026-10-14',
    who: 'City Council (MBSA) Inspector',
    issue: 'Requested silt trap inspection records ahead of rainy season.',
    action: 'Provided digital weekly desilting log and turbidity sensor history showing 18.20 NTU (well within 50 NTU limit).',
    closed: true,
  },
];

const DRAINAGE_POINTS = [
  { id: 'dp1', name: 'North Boundary Silt Trap (Inlet)', turbidity: 18.2, tss: 24.5, ph: 7.4, status: 'Normal', limit: '< 50 NTU' },
  { id: 'dp2', name: 'South Perimeter Basin (Discharge)', turbidity: 22.4, tss: 28.0, ph: 7.3, status: 'Normal', limit: '< 50 NTU' },
  { id: 'dp3', name: 'Lorry Wheel Wash Basin (Recirculation)', turbidity: 32.1, tss: 36.0, ph: 7.6, status: 'Normal', limit: '< 50 NTU' },
];

export default function EoScreen({
  user,
  sites = SITES,
  onLogout,
}) {
  const [siteId, setSiteId] = useState('elmina');
  const [activeTab, setActiveTab] = useState('water');
  const [hour, setHour] = useState(11);
  const [showReportModal, setShowReportModal] = useState(false);
  const [checklist, setChecklist] = useState(INITIAL_CHECKLIST);
  const [complaints, setComplaints] = useState(INITIAL_COMPLAINTS);
  const [alertThreshold, setAlertThreshold] = useState(58);
  const [alertDispatched, setAlertDispatched] = useState(false);
  const [isAddChecklistOpen, setIsAddChecklistOpen] = useState(false);
  const [newItem, setNewItem] = useState({ title: '', location: '', note: '' });
  const [isAddComplaintOpen, setIsAddComplaintOpen] = useState(false);
  const [newComplaint, setNewComplaint] = useState({ who: '', issue: '', action: '' });
  const [resolvingId, setResolvingId] = useState(null);
  const [resolveText, setResolveText] = useState('');

  const site = sites.find((s) => s.id === siteId) || sites[0];
  const noiseProfile = useMemo(() => noiseDay(site, Array.from({ length: 24 }, (_, h) => ({ h, load: 50, genset: 0 })), false), [site]);
  const noiseWithGenset = useMemo(() => noiseDay(site, Array.from({ length: 24 }, (_, h) => ({ h, load: 50, genset: 30 })), true), [site]);

  const currentNoise = noiseProfile[hour].db;
  const currentLimit = limitAt(hour);
  const noiseTone = status(currentNoise, currentLimit.l90);

  const chartPoints = noiseProfile.map((p, i) => ({
    tick: `${String(p.h).padStart(2, '0')}:00`,
    db: p.db,
    before: noiseWithGenset[i].db,
  }));

  const pills = [
    { k: 'Boundary Noise', v: `${currentNoise.toFixed(2)} dBA`, tone: noiseTone === 'ok' ? 'ok' : 'warn' },
    { k: 'DOE Day Limit', v: `${currentLimit.l90}.00 dBA` },
    { k: 'Silt Turbidity', v: '18.20 NTU (<50)', tone: 'ok' },
    { k: 'Site Checklist', v: `${checklist.filter((c) => c.status === 'pass').length}/${checklist.length} Passed`, tone: 'ok' },
  ];

  const toggleChecklistStatus = (id) => {
    setChecklist(checklist.map((item) => {
      if (item.id === id) {
        return { ...item, status: item.status === 'pass' ? 'action' : 'pass' };
      }
      return item;
    }));
  };

  const handleAddChecklistItem = (e) => {
    e.preventDefault();
    if (!newItem.title) return;
    const item = {
      id: Date.now(),
      title: newItem.title,
      location: newItem.location || 'Site Perimeter',
      status: 'pass',
      note: newItem.note || 'Inspected and verified compliant.',
      photoName: 'site_photo_' + Date.now().toString().slice(-4) + '.jpg',
      photoTime: 'Today ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setChecklist([...checklist, item]);
    setNewItem({ title: '', location: '', note: '' });
    setIsAddChecklistOpen(false);
  };

  const handleAddComplaint = (e) => {
    e.preventDefault();
    if (!newComplaint.who || !newComplaint.issue) return;
    const entry = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      who: newComplaint.who,
      issue: newComplaint.issue,
      action: newComplaint.action || 'Investigated on site. Rectification in progress.',
      closed: !!newComplaint.action,
    };
    setComplaints([entry, ...complaints]);
    setNewComplaint({ who: '', issue: '', action: '' });
    setIsAddComplaintOpen(false);
  };

  const handleResolveComplaint = (id) => {
    if (!resolveText) return;
    setComplaints(complaints.map((c) => {
      if (c.id === id) {
        return { ...c, action: resolveText, closed: true };
      }
      return c;
    }));
    setResolvingId(null);
    setResolveText('');
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
          <h1>{site.name}: Environmental Compliance</h1>
          <p>
            On-Site Environmental Officer Dashboard | Erosion Control, DOE Schedule 6 & Site Audits
          </p>
        </div>
        <div className="top-meta">
          <button id="open-emp-modal" className="btn btn-primary" onClick={() => setShowReportModal(true)}>
            📋 Export Monthly Environmental Report
          </button>
        </div>
      </div>

      {/* Quick Compliance Banner */}
      <div className={`banner ${noiseTone === 'ok' ? 'ok' : 'near'}`} style={{ marginBottom: 16 }}>
        <span>
          {noiseTone === 'ok'
            ? '🟢 100% STATUTORY COMPLIANCE: Water runoff, boundary noise, and dust within legal limits.'
            : '⚠️ ATTENTION: Sound level near limit. Check heavy lifting machinery.'}
        </span>
        <span className="num">
          Site Checked at {String(hour).padStart(2, '0')}:00
        </span>
      </div>

      {/* TAB 1: RAIN & SILT RUNOFF (ESC CONTROL) */}
      {activeTab === 'water' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Key Water Quality KPIs */}
          <section className="grid g3">
            <div className="card kpi hero">
              <div className="label">Silt Trap Turbidity</div>
              <div className="value num" style={{ color: '#059669' }}>
                18.20<small> NTU</small>
              </div>
              <div className="foot">DOE Limit: &lt; 50.00 NTU (Safe for discharge)</div>
            </div>

            <div className="card kpi">
              <div className="label">Discharge Water pH</div>
              <div className="value num" style={{ color: '#059669' }}>
                7.40<small> pH</small>
              </div>
              <div className="foot">Neutral water (Statutory range: 6.00 to 9.00 pH)</div>
            </div>

            <div className="card kpi">
              <div className="label">Total Suspended Solids (TSS)</div>
              <div className="value num" style={{ color: '#059669' }}>
                24.50<small> mg/L</small>
              </div>
              <div className="foot">Statutory Limit: &lt; 50.00 mg/L (No muddy runoff)</div>
            </div>
          </section>

          {/* Heavy Rain Warning Card */}
          <div className="card" style={{ borderLeft: '4px solid #0284C7', background: '#F0F9FF' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '15px', color: '#0369A1' }}>
                  ⛈️ Heavy Rain Early Warning: Rain Expected 13:30 to 16:30
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#334155' }}>
                  Pre-storm protocol: Inspect silt traps, clear perimeter drain blockages, and ensure geotextile fences are securely staked before downpour.
                </p>
              </div>
              <span style={{ fontSize: '12px', fontWeight: 700, background: '#E0F2FE', color: '#0369A1', padding: '4px 10px', borderRadius: 6 }}>
                60% Rain Risk
              </span>
            </div>
          </div>

          {/* Silt Traps & Drainage Status Table */}
          <section className="card">
            <h2 style={{ fontSize: '16px', margin: '0 0 12px 0' }}>Perimeter Drainage & Silt Trap Monitoring Points</h2>
            <div className="table-responsive">
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '1px solid #E2E8F0', color: '#64748B' }}>
                    <th style={{ padding: '8px' }}>Monitoring Point</th>
                    <th style={{ padding: '8px' }}>Turbidity</th>
                    <th style={{ padding: '8px' }}>TSS</th>
                    <th style={{ padding: '8px' }}>pH</th>
                    <th style={{ padding: '8px' }}>Legal Limit</th>
                    <th style={{ padding: '8px' }}>Condition</th>
                  </tr>
                </thead>
                <tbody>
                  {DRAINAGE_POINTS.map((dp) => (
                    <tr key={dp.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '10px 8px', fontWeight: 600, color: '#0F172A' }}>{dp.name}</td>
                      <td style={{ padding: '10px 8px', fontWeight: 700, color: '#059669' }}>{dp.turbidity.toFixed(2)} NTU</td>
                      <td style={{ padding: '10px 8px' }}>{dp.tss.toFixed(2)} mg/L</td>
                      <td style={{ padding: '10px 8px' }}>{dp.ph.toFixed(2)}</td>
                      <td style={{ padding: '10px 8px', color: '#64748B' }}>{dp.limit}</td>
                      <td style={{ padding: '10px 8px' }}>
                        <span className="tag ok">Normal</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {/* TAB 2: NOISE & DUST MONITORING (DOE LIMITS) */}
      {activeTab === 'noise' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Noise & Dust KPIs */}
          <section className="grid g3">
            <div className="card kpi hero">
              <div className="label">Boundary Sound Level</div>
              <div className="value num" style={{ color: noiseTone === 'ok' ? '#059669' : '#D97706' }}>
                {currentNoise.toFixed(2)}<small> dBA</small>
              </div>
              <div className="foot">DOE Schedule 6 Limit: {currentLimit.l90}.00 dBA L90</div>
            </div>

            <div className="card kpi">
              <div className="label">Ambient Dust Level (PM10)</div>
              <div className="value num" style={{ color: '#059669' }}>
                22.50<small> µg/m³</small>
              </div>
              <div className="foot">Clean air (DOE Limit: &lt; 150.00 µg/m³)</div>
            </div>

            <div className="card kpi">
              <div className="label">Diesel Generator Smoke & Hum</div>
              <div className="value num" style={{ color: '#059669' }}>
                100% OFF
              </div>
              <div className="foot">Zero dark smoke, zero nighttime engine drone</div>
            </div>
          </section>

          {/* Warning Trigger Calibration */}
          <div className="card" style={{ borderLeft: '4px solid #0F766E' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, flexWrap: 'wrap', gap: 10 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '14px', color: '#0F172A' }}>Foreman Early Warning Sound Limit</h3>
                <p className="sub" style={{ margin: '2px 0 0 0', fontSize: '12px' }}>
                  Sends an automatic alert to site supervisors before reaching the legal limit of {currentLimit.l90}.00 dBA.
                </p>
              </div>
              <b className="num" style={{ color: '#0F766E', fontSize: '15px' }}>
                Alert at: {alertThreshold}.00 dBA
              </b>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 10 }}>
              <input
                id="noise-threshold-slider"
                type="range"
                min="50"
                max="60"
                step="1"
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
                📱 Send Test Alert
              </button>
            </div>

            {alertDispatched && (
              <div style={{ marginTop: 10, backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 6, padding: '8px 12px', fontSize: '12px', color: '#166534' }}>
                📲 <strong>Alert Dispatched to Site Supervisor:</strong> "Sound reading at {currentNoise.toFixed(2)} dBA. Modulate heavy crane hoist speed to stay under statutory limit."
              </div>
            )}
          </div>

          {/* 24-Hour Sound Level Graph */}
          <section className="card">
            <h2 style={{ fontSize: '16px', margin: '0 0 4px 0' }}>24-Hour Boundary Sound Level vs DOE Statutory Limits</h2>
            <p className="sub" style={{ margin: '0 0 12px 0', fontSize: '12px' }}>
              Green line: GreenPulse clean battery. Grey line: Old noisy diesel generator. Red line: Legal limit.
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

      {/* TAB 3: DAILY SITE CHECKLIST & PHOTO EVIDENCE */}
      {activeTab === 'checklist' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <section className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '16px' }}>Daily Environmental Inspection Checklist</h2>
                <p className="sub" style={{ margin: '2px 0 0 0', fontSize: '12px' }}>
                  Inspection records required daily by Department of Environment (JAS) and client audits.
                </p>
              </div>
              <button
                id="add-checklist-item-btn"
                className="btn btn-primary"
                onClick={() => setIsAddChecklistOpen(true)}
                style={{ fontSize: '12px', padding: '6px 12px' }}
              >
                + Add Inspection Item / Photo
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {checklist.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: 8,
                    flexWrap: 'wrap',
                    gap: 12,
                  }}
                >
                  <div style={{ flex: 1, minWidth: 240 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>
                        {item.title}
                      </span>
                      <span style={{ fontSize: '11px', color: '#64748B', background: '#E2E8F0', padding: '1px 6px', borderRadius: 4 }}>
                        {item.location}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#475569', lineHeight: 1.4 }}>
                      {item.note}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '12px', color: '#0284C7', background: '#E0F2FE', padding: '4px 8px', borderRadius: 4 }}>
                      <span>📷</span>
                      <span style={{ fontWeight: 600 }}>{item.photoName}</span>
                      <span style={{ fontSize: '10px', color: '#0369A1' }}>({item.photoTime})</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleChecklistStatus(item.id)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: 6,
                        border: 'none',
                        fontWeight: 700,
                        fontSize: '11px',
                        cursor: 'pointer',
                        backgroundColor: item.status === 'pass' ? '#ECFDF5' : '#FEF2F2',
                        color: item.status === 'pass' ? '#059669' : '#DC2626',
                      }}
                    >
                      {item.status === 'pass' ? '✓ Passed' : '⚠️ Action Needed'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* TAB 4: COMPLAINTS & CORRECTIVE ACTIONS (ADUAN & TINDAKAN) */}
      {activeTab === 'complaints' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <section className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '16px' }}>Complaints & Corrective Actions (Aduan & Tindakan Pembetulan)</h2>
                <p className="sub" style={{ margin: '2px 0 0 0', fontSize: '12px' }}>
                  Log of community feedback, resident inquiries, and immediate site rectifications.
                </p>
              </div>
              <button
                id="add-complaint-btn"
                className="btn btn-primary"
                onClick={() => setIsAddComplaintOpen(true)}
                style={{ fontSize: '12px', padding: '6px 12px' }}
              >
                + Log New Complaint / Issue
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {complaints.map((c) => (
                <div
                  key={c.id}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 8,
                    border: '1px solid #E2E8F0',
                    background: c.closed ? '#FFFFFF' : '#FFFBEB',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                      {c.who}
                      <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 400, marginLeft: 8 }}>
                        {c.date}
                      </span>
                    </div>
                    <span className={`tag ${c.closed ? 'ok' : 'warn'}`}>
                      {c.closed ? '✓ Resolved' : 'Pending Action'}
                    </span>
                  </div>

                  <div style={{ fontSize: '13px', color: '#334155', margin: '4px 0' }}>
                    <strong>Issue:</strong> {c.issue}
                  </div>

                  {c.closed ? (
                    <div style={{ fontSize: '12px', color: '#059669', background: '#ECFDF5', padding: '6px 10px', borderRadius: 4, marginTop: 6 }}>
                      <strong>✓ Action Taken:</strong> {c.action}
                    </div>
                  ) : (
                    <div style={{ marginTop: 8 }}>
                      {resolvingId === c.id ? (
                        <div style={{ display: 'flex', gap: 8 }}>
                          <input
                            type="text"
                            placeholder="Enter action taken to resolve this issue..."
                            value={resolveText}
                            onChange={(e) => setResolveText(e.target.value)}
                            style={{ flex: 1, padding: '6px 10px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: '12px' }}
                          />
                          <button
                            type="button"
                            className="btn btn-primary"
                            onClick={() => handleResolveComplaint(c.id)}
                            style={{ fontSize: '12px', padding: '6px 12px', whiteSpace: 'nowrap' }}
                          >
                            Save Resolution
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="btn btn-ghost"
                          onClick={() => setResolvingId(c.id)}
                          style={{ fontSize: '11px', padding: '4px 8px' }}
                        >
                          + Record Corrective Action
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* Add Checklist Modal */}
      {isAddChecklistOpen && (
        <div className="modal-backdrop" onClick={() => setIsAddChecklistOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 460 }}>
            <div className="modal-header">
              <h2 style={{ fontSize: '16px' }}>Add Inspection Item & Photo</h2>
              <button className="btn btn-ghost" onClick={() => setIsAddChecklistOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleAddChecklistItem}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                    Inspection Item Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Silt Trap Geotextile Barrier"
                    value={newItem.title}
                    onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                    Site Location / Zone
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. South Drain Discharge Gate"
                    value={newItem.location}
                    onChange={(e) => setNewItem({ ...newItem, location: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                    Inspection Observation Notes
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Silt trap cleaned, zero mud leakage observed."
                    value={newItem.note}
                    onChange={(e) => setNewItem({ ...newItem, note: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: '13px' }}
                  />
                </div>
              </div>
              <div className="modal-actions" style={{ marginTop: 16 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setIsAddChecklistOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Inspection Item</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Complaint Modal */}
      {isAddComplaintOpen && (
        <div className="modal-backdrop" onClick={() => setIsAddComplaintOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 460 }}>
            <div className="modal-header">
              <h2 style={{ fontSize: '16px' }}>Log Community Complaint or Inquiry</h2>
              <button className="btn btn-ghost" onClick={() => setIsAddComplaintOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleAddComplaint}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                    Caller / Source
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Resident (Elmina Green 3)"
                    value={newComplaint.who}
                    onChange={(e) => setNewComplaint({ ...newComplaint, who: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                    Issue Description
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="e.g. Dust blown towards houses during excavation."
                    value={newComplaint.issue}
                    onChange={(e) => setNewComplaint({ ...newComplaint, issue: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                    Corrective Action (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Water bowser deployed to spray access perimeter."
                    value={newComplaint.action}
                    onChange={(e) => setNewComplaint({ ...newComplaint, action: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: '13px' }}
                  />
                </div>
              </div>
              <div className="modal-actions" style={{ marginTop: 16 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setIsAddComplaintOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save to Official Log</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Statutory Monthly Report Modal */}
      {showReportModal && (
        <div className="modal-backdrop" onClick={() => setShowReportModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 640 }}>
            <div className="modal-header">
              <div>
                <h2>Monthly Environmental Monitoring Report</h2>
                <p className="sub">Statutory compliance submission for Department of Environment (JAS) and Client</p>
              </div>
              <button className="btn btn-ghost" onClick={() => setShowReportModal(false)}>✕</button>
            </div>

            <div style={{ padding: '10px 0', fontSize: '13px', lineHeight: 1.5 }}>
              <div style={{ background: '#F8FAFC', padding: 12, borderRadius: 6, marginBottom: 14 }}>
                <div><strong>Project:</strong> {site.name}</div>
                <div><strong>Location:</strong> {site.locationName}</div>
                <div><strong>Reporting Period:</strong> October 2026 (Monthly Audit)</div>
                <div><strong>Prepared By:</strong> On-Site Environmental Officer</div>
              </div>

              <h3 style={{ fontSize: '14px', margin: '10px 0 6px 0', color: '#0F172A' }}>1. Water & Silt Runoff Compliance</h3>
              <div className="table-responsive">
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', marginBottom: 12 }}>
                  <thead>
                    <tr style={{ background: '#F1F5F9', textAlign: 'left' }}>
                      <th style={{ padding: 6 }}>Parameter</th>
                      <th style={{ padding: 6 }}>Site Average</th>
                      <th style={{ padding: 6 }}>Statutory Limit</th>
                      <th style={{ padding: 6 }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td style={{ padding: 6 }}>Turbidity</td><td style={{ padding: 6 }}>18.20 NTU</td><td style={{ padding: 6 }}>&lt; 50.00 NTU</td><td style={{ padding: 6, color: '#059669', fontWeight: 700 }}>Pass</td></tr>
                    <tr><td style={{ padding: 6 }}>Suspended Solids (TSS)</td><td style={{ padding: 6 }}>24.50 mg/L</td><td style={{ padding: 6 }}>&lt; 50.00 mg/L</td><td style={{ padding: 6, color: '#059669', fontWeight: 700 }}>Pass</td></tr>
                    <tr><td style={{ padding: 6 }}>pH Level</td><td style={{ padding: 6 }}>7.40</td><td style={{ padding: 6 }}>6.00 to 9.00</td><td style={{ padding: 6, color: '#059669', fontWeight: 700 }}>Pass</td></tr>
                  </tbody>
                </table>
              </div>

              <h3 style={{ fontSize: '14px', margin: '10px 0 6px 0', color: '#0F172A' }}>2. Boundary Acoustic Compliance (DOE Schedule 6)</h3>
              <div style={{ background: '#ECFDF5', padding: 10, borderRadius: 6, color: '#065F46', fontSize: '12px', marginBottom: 12 }}>
                ✓ Daytime Boundary Sound: <strong>52.40 dBA</strong> (Limit: 60.00 dBA). Zero statutory noise exceedances logged. Diesel generator locked 100% OFF.
              </div>

              <h3 style={{ fontSize: '14px', margin: '10px 0 6px 0', color: '#0F172A' }}>3. Inspection Checklist Summary</h3>
              <div style={{ fontSize: '12px', color: '#475569', marginBottom: 12 }}>
                All 5 daily inspection categories (Silt traps, silt fences, chemical bunding, wheel wash, and waste segregation) verified with timestamped photo evidence.
              </div>

              <h3 style={{ fontSize: '14px', margin: '10px 0 6px 0', color: '#0F172A' }}>4. Community Complaints</h3>
              <div style={{ fontSize: '12px', color: '#475569' }}>
                {complaints.length} community inquiries received; {complaints.filter((c) => c.closed).length} resolved on site within 20 minutes with zero municipal stop-work compound notices.
              </div>
            </div>

            <div className="modal-actions" style={{ marginTop: 16 }}>
              <button className="btn btn-ghost" onClick={() => window.print()}>Print / Save PDF</button>
              <button className="btn btn-primary" onClick={() => setShowReportModal(false)}>Close Summary</button>
            </div>
          </div>
        </div>
      )}
    </Shell>
  );
}
