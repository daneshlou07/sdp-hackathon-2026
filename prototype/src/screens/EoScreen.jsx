import { useState, useMemo } from 'react';
import Shell from '../components/Shell';
import { LineLimit } from '../components/Charts';
import { SITES } from '../data/sites';
import { limitAt, noiseDay, status } from '../data/noise';
import imgSiltTrap from '../assets/silt_trap.jpg';
import imgWheelWash from '../assets/wheel_wash.jpg';
import imgSiltFence from '../assets/silt_fence.jpg';
import imgFuelBund from '../assets/fuel_bund.jpg';

const TABS = [
  { id: 'water', label: 'Rain & Silt Runoff', icon: '🌧️' },
  { id: 'noise', label: 'Noise & Dust Limits', icon: '🔊' },
  { id: 'checklist', label: 'Daily Inspection & Photos', icon: '📋' },
  { id: 'complaints', label: 'Complaints & Actions', icon: '📢' },
];

export const SAMPLE_PHOTOS = [
  { name: 'silt_trap_north.jpg', label: 'Silt Trap', url: imgSiltTrap },
  { name: 'wheel_wash_exit.jpg', label: 'Wheel Wash', url: imgWheelWash },
  { name: 'silt_fence_slope.jpg', label: 'Silt Fence', url: imgSiltFence },
  { name: 'fuel_bund_secure.jpg', label: 'Chemical Bund', url: imgFuelBund },
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
    photoUrl: imgSiltTrap,
  },
  {
    id: 2,
    title: 'Silt Fences & Geotextile Barriers',
    location: 'Slope Area (Near Public Road)',
    status: 'pass',
    note: 'Silt fences upright, tightly staked with no tears.',
    photoName: 'silt_fence_slope.jpg',
    photoTime: 'Today 08:45 AM',
    photoUrl: imgSiltFence,
  },
  {
    id: 3,
    title: 'Chemical & Diesel Storage Bunding',
    location: 'Machinery Yard',
    status: 'pass',
    note: 'Double containment bunding dry and sealed. Zero fuel spills.',
    photoName: 'fuel_bund_secure.jpg',
    photoTime: 'Today 09:10 AM',
    photoUrl: imgFuelBund,
  },
  {
    id: 4,
    title: 'Wheel Wash Bay & Road Cleanliness',
    location: 'Main Site Exit Gate',
    status: 'pass',
    note: 'High-pressure wash bay running. Water sprayed on access road.',
    photoName: 'wheel_wash_exit.jpg',
    photoTime: 'Today 09:30 AM',
    photoUrl: imgWheelWash,
  },
  {
    id: 5,
    title: 'Solid Waste Segregation',
    location: 'Sub-contractor Work Zone',
    status: 'pass',
    note: 'Scrap timber and metal sorted in bins. Zero open burning.',
    photoName: 'waste_segregation.jpg',
    photoTime: 'Today 09:45 AM',
    photoUrl: imgFuelBund,
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
  const [viewingPhotoItem, setViewingPhotoItem] = useState(null);
  const [newItem, setNewItem] = useState({
    title: '',
    location: '',
    note: '',
    photoName: '',
    photoUrl: null,
  });
  const [isAddComplaintOpen, setIsAddComplaintOpen] = useState(false);
  const [newComplaint, setNewComplaint] = useState({ who: '', issue: '', action: '' });
  const [resolvingId, setResolvingId] = useState(null);
  const [resolveText, setResolveText] = useState('');

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setNewItem((prev) => ({
          ...prev,
          photoUrl: event.target.result,
          photoName: file.name,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

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

  const toggleChecklistStatus = (id) => {
    setChecklist(
      checklist.map((item) =>
        item.id === id ? { ...item, status: item.status === 'pass' ? 'action' : 'pass' } : item
      )
    );
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
      photoName: newItem.photoName || ('site_photo_' + Date.now().toString().slice(-4) + '.jpg'),
      photoTime: 'Today ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      photoUrl: newItem.photoUrl || null,
    };
    setChecklist([item, ...checklist]);
    setNewItem({ title: '', location: '', note: '', photoName: '', photoUrl: null });
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
    setComplaints(
      complaints.map((c) =>
        c.id === id ? { ...c, action: resolveText, closed: true } : c
      )
    );
    setResolvingId(null);
    setResolveText('');
  };

  return (
    <Shell
      user={user}
      area="Environmental Management"
      siteId={siteId}
      onSite={setSiteId}
      showSites
      sites={sites}
      tabs={TABS}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onLogout={onLogout}
    >
      {/* Top Header */}
      <div className="top">
        <div>
          <h1>{site.name}: Environmental Monitoring</h1>

        </div>
        <div className="top-meta">
          <button id="open-emp-modal" className="btn btn-primary" onClick={() => setShowReportModal(true)}>
            📋 Export Monthly Report
          </button>
        </div>
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
              <div className="foot">Within limit (50 NTU)</div>
            </div>

            <div className="card kpi">
              <div className="label">Discharge Water pH</div>
              <div className="value num" style={{ color: '#059669' }}>
                7.40<small> pH</small>
              </div>
              <div className="foot">Within range (6.0–9.0)</div>
            </div>

            <div className="card kpi">
              <div className="label">Total Suspended Solids (TSS)</div>
              <div className="value num" style={{ color: '#059669' }}>
                24.50<small> mg/L</small>
              </div>
              <div className="foot">Within limit (50 mg/L)</div>
            </div>
          </section>

          {/* Heavy Rain Warning Card */}
          <div className="card" style={{ borderLeft: '4px solid #0284C7', background: '#F0F9FF' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '15px', color: '#0369A1' }}>
                  ⛈️ Heavy Rain Warning: Rain Expected 13:30 to 16:30
                </h3>
              </div>
            </div>
          </div>

          {/* Silt Traps & Drainage Status Table */}
          <section className="card">
            <h2 style={{ fontSize: '16px', margin: '0 0 12px 0' }}>Drainage & Silt Trap Monitoring Points</h2>
            <div className="table-responsive">
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '1px solid #E2E8F0', color: '#64748B' }}>
                    <th style={{ padding: '8px' }}>Monitoring Point</th>
                    <th style={{ padding: '8px' }}>Turbidity</th>
                    <th style={{ padding: '8px' }}>TSS</th>
                    <th style={{ padding: '8px' }}>pH</th>
                    <th style={{ padding: '8px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {DRAINAGE_POINTS.map((dp) => (
                    <tr key={dp.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '10px 8px', fontWeight: 600, color: '#0F172A' }}>{dp.name}</td>
                      <td style={{ padding: '10px 8px', fontWeight: 700, color: '#059669' }}>{dp.turbidity.toFixed(2)} NTU</td>
                      <td style={{ padding: '10px 8px' }}>{dp.tss.toFixed(2)} mg/L</td>
                      <td style={{ padding: '10px 8px' }}>{dp.ph.toFixed(2)}</td>
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
              <div className="label">Boundary Noise</div>
              <div className="value num" style={{ color: noiseTone === 'ok' ? '#059669' : '#D97706' }}>
                {currentNoise.toFixed(2)}<small> dBA</small>
              </div>
              <div className="foot">Below the 60 dBA limit</div>
            </div>

            <div className="card kpi">
              <div className="label">Dust Level (PM10)</div>
              <div className="value num" style={{ color: '#059669' }}>
                22.50<small> µg/m³</small>
              </div>
              <div className="foot">Within limit (150 µg/m³)</div>
            </div>

            <div className="card kpi">
              <div className="label">Diesel Generator</div>
              <div className="value num" style={{ color: '#059669' }}>
                100% OFF
              </div>
              <div className="foot">No smoke or engine noise</div>
            </div>
          </section>

          {/* Warning Trigger Calibration */}
          <div className="card" style={{ borderLeft: '4px solid #0F766E' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, flexWrap: 'wrap', gap: 10 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '14px', color: '#0F172A' }}>Noise Limit Alert</h3>
                <p className="sub" style={{ margin: '2px 0 0 0', fontSize: '12px' }}>
                  Alerts site supervisors when noise levels approach the legal limit.

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
                📱 Send Alert
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
              <span><i style={{ background: 'var(--green)' }} />Battery and solar power</span>
              <span><i style={{ background: '#94a3b8' }} />Diesel Generator Baseline</span>
              <span><i style={{ background: 'var(--danger)', height: 2 }} />Legal Noise Limit</span>
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
                <h2 style={{ margin: 0, fontSize: '16px' }}>Daily Environmental Checklist</h2>
                <p className="sub" style={{ margin: '2px 0 0 0', fontSize: '12px' }}>
                  Daily inspection records for DOE (JAS) and client audits.                </p>
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1, minWidth: 260 }}>
                    {/* Clickable Photo Thumbnail */}
                    {item.photoUrl && (
                      <div
                        onClick={() => setViewingPhotoItem(item)}
                        style={{
                          width: 58,
                          height: 58,
                          borderRadius: 8,
                          overflow: 'hidden',
                          cursor: 'pointer',
                          position: 'relative',
                          flexShrink: 0,
                          border: '1.5px solid #CBD5E1',
                          boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                          transition: 'transform 0.15s ease, border-color 0.15s ease',
                        }}
                        title="Click to view full photo evidence"
                      >
                        <img
                          src={item.photoUrl}
                          alt={item.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <div
                          style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            background: 'rgba(15, 23, 42, 0.75)',
                            color: '#FFFFFF',
                            fontSize: '9px',
                            textAlign: 'center',
                            padding: '1px 0',
                            fontWeight: 700,
                            letterSpacing: '0.02em',
                          }}
                        >
                          🔍 View
                        </div>
                      </div>
                    )}

                    <div>
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
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <button
                      type="button"
                      onClick={() => setViewingPhotoItem(item)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        fontSize: '12px',
                        color: '#0284C7',
                        background: '#E0F2FE',
                        padding: '6px 10px',
                        borderRadius: 6,
                        border: '1px solid #BAE6FD',
                        cursor: 'pointer',
                        fontWeight: 600,
                        transition: 'background 0.15s ease',
                      }}
                      title="Click to preview inspection photo"
                    >
                      <span>📷</span>
                      <span style={{ fontWeight: 600 }}>{item.photoName}</span>
                      <span style={{ fontSize: '10px', color: '#0369A1' }}>({item.photoTime})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleChecklistStatus(item.id)}
                      style={{
                        padding: '6px 12px',
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
                <h2 style={{ margin: 0, fontSize: '16px' }}>Community Feedback & Actions</h2>
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
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <h2 style={{ fontSize: '16px' }}>Add Inspection Item & Photo Evidence</h2>
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
                    rows={2}
                    placeholder="e.g. Silt trap cleaned, zero mud leakage observed."
                    value={newItem.note}
                    onChange={(e) => setNewItem({ ...newItem, note: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: '13px' }}
                  />
                </div>

                {/* Photo Upload from Device Only */}
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A', display: 'block', marginBottom: 6 }}>
                    📸 Inspection Photo Evidence
                  </label>

                  {/* File Upload Button */}
                  <div style={{ marginBottom: 12 }}>
                    <label
                      htmlFor="checklist-photo-upload"
                      style={{
                        padding: '8px 16px',
                        background: '#0F172A',
                        color: '#FFFFFF',
                        borderRadius: 6,
                        fontSize: '12.5px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        transition: 'background 0.15s ease',
                      }}
                    >
                      📁 Upload Photo from Device
                    </label>
                    <input
                      id="checklist-photo-upload"
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={handlePhotoUpload}
                    />
                    <span style={{ fontSize: '11px', color: '#64748B', marginLeft: 10 }}>
                      Supports JPG, PNG, or mobile capture
                    </span>
                  </div>

                  {/* Active Photo Preview */}
                  {newItem.photoUrl ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: 8 }}>
                      <img
                        src={newItem.photoUrl}
                        alt="Preview"
                        style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 6, border: '1px solid #94A3B8' }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {newItem.photoName}
                        </div>
                        <div style={{ fontSize: '11px', color: '#16A34A', fontWeight: 600, marginTop: 2 }}>
                          ✓ Attached & ready to submit
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setNewItem({ ...newItem, photoUrl: null, photoName: '' })}
                        style={{ border: 'none', background: '#FEE2E2', color: '#DC2626', padding: '4px 10px', borderRadius: 6, fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div style={{ padding: '14px', border: '1.5px dashed #CBD5E1', borderRadius: 8, textAlign: 'center', background: '#F8FAFC' }}>
                      <div style={{ fontSize: '20px', marginBottom: 2 }}>📷</div>
                      <div style={{ fontSize: '12px', color: '#64748B' }}>No photo attached yet. Click above to upload an image from your device.</div>
                    </div>
                  )}
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
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 680, padding: 24 }}>
            <div className="modal-header">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0F172A' }}>Monthly Environmental Monitoring Report</h2>
                  <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: 999, backgroundColor: '#DCFCE7', color: '#15803D' }}>
                    JAS / DOE COMPLIANT
                  </span>
                </div>
                <p className="sub" style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>
                  Statutory compliance submission for Department of Environment (JAS) and Client
                </p>
              </div>
              <button className="btn btn-ghost" onClick={() => setShowReportModal(false)}>✕</button>
            </div>

            <div style={{ padding: '8px 0', fontSize: '13px', lineHeight: 1.5 }}>
              <div style={{ background: '#F8FAFC', padding: '14px 16px', borderRadius: 8, border: '1px solid #E2E8F0', marginBottom: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px', fontSize: '12.5px' }}>
                <div><span style={{ color: '#64748B' }}>Project:</span> <strong style={{ color: '#0F172A' }}>{site.name}</strong></div>
                <div><span style={{ color: '#64748B' }}>Location:</span> <strong style={{ color: '#0F172A' }}>{site.locationName}</strong></div>
                <div><span style={{ color: '#64748B' }}>Reporting Period:</span> <strong style={{ color: '#0F172A' }}>October 2026 (Monthly Audit)</strong></div>
                <div><span style={{ color: '#64748B' }}>Prepared By:</span> <strong style={{ color: '#0F172A' }}>On-Site Environmental Officer</strong></div>
              </div>

              <h3 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 8px 0', color: '#0F172A' }}>1. Water & Silt Runoff Compliance</h3>
              <div style={{ border: '1px solid #E2E8F0', borderRadius: 8, overflow: 'hidden', marginBottom: 16 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                  <thead>
                    <tr style={{ background: '#F1F5F9', textAlign: 'left', borderBottom: '1px solid #E2E8F0' }}>
                      <th style={{ padding: '8px 12px', fontWeight: 700, color: '#475569' }}>Parameter</th>
                      <th style={{ padding: '8px 12px', fontWeight: 700, color: '#475569' }}>Site Average</th>
                      <th style={{ padding: '8px 12px', fontWeight: 700, color: '#475569' }}>Statutory Limit</th>
                      <th style={{ padding: '8px 12px', fontWeight: 700, color: '#475569' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '8px 12px', fontWeight: 600 }}>Turbidity</td>
                      <td style={{ padding: '8px 12px' }}>18.20 NTU</td>
                      <td style={{ padding: '8px 12px', color: '#64748B' }}>&lt; 50.00 NTU</td>
                      <td style={{ padding: '8px 12px' }}>
                        <span style={{ background: '#DCFCE7', color: '#15803D', padding: '2px 8px', borderRadius: 999, fontWeight: 700, fontSize: '11px' }}>✓ Pass</span>
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '8px 12px', fontWeight: 600 }}>Suspended Solids (TSS)</td>
                      <td style={{ padding: '8px 12px' }}>24.50 mg/L</td>
                      <td style={{ padding: '8px 12px', color: '#64748B' }}>&lt; 50.00 mg/L</td>
                      <td style={{ padding: '8px 12px' }}>
                        <span style={{ background: '#DCFCE7', color: '#15803D', padding: '2px 8px', borderRadius: 999, fontWeight: 700, fontSize: '11px' }}>✓ Pass</span>
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '8px 12px', fontWeight: 600 }}>pH Level</td>
                      <td style={{ padding: '8px 12px' }}>7.40</td>
                      <td style={{ padding: '8px 12px', color: '#64748B' }}>6.00 to 9.00</td>
                      <td style={{ padding: '8px 12px' }}>
                        <span style={{ background: '#DCFCE7', color: '#15803D', padding: '2px 8px', borderRadius: 999, fontWeight: 700, fontSize: '11px' }}>✓ Pass</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 8px 0', color: '#0F172A' }}>2. Boundary Acoustic Compliance (DOE Schedule 6)</h3>
              <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', padding: '10px 14px', borderRadius: 8, color: '#166534', fontSize: '12.5px', marginBottom: 16 }}>
                ✓ Daytime Boundary Sound: <strong>52.40 dBA</strong> (Limit: 60.00 dBA). Zero statutory noise exceedances logged. Diesel generator locked 100% OFF.
              </div>

              <h3 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 6px 0', color: '#0F172A' }}>3. Inspection Checklist Summary</h3>
              <div style={{ fontSize: '12.5px', color: '#334155', background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '10px 14px', borderRadius: 8, marginBottom: 16 }}>
                All 5 daily inspection categories (Silt traps, silt fences, chemical bunding, wheel wash, and waste segregation) verified with timestamped photo evidence.
              </div>

              <h3 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 6px 0', color: '#0F172A' }}>4. Community Complaints</h3>
              <div style={{ fontSize: '12.5px', color: '#334155', background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '10px 14px', borderRadius: 8 }}>
                {complaints.length} community inquiries received; {complaints.filter((c) => c.closed).length} resolved on site within 20 minutes with zero municipal stop-work compound notices.
              </div>
            </div>

            <div className="modal-actions" style={{ marginTop: 20 }}>
              <button className="btn btn-ghost" onClick={() => window.print()}>🖨️ Print / Save PDF</button>
              <button className="btn btn-primary" onClick={() => setShowReportModal(false)}>Close Summary</button>
            </div>
          </div>
        </div>
      )}

      {/* Photo Inspection Lightbox Modal */}
      {viewingPhotoItem && (
        <div className="modal-backdrop" onClick={() => setViewingPhotoItem(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 620, padding: 20 }}>
            <div className="modal-header" style={{ marginBottom: 12 }}>
              <div>
                <h2 style={{ fontSize: '16px', margin: 0, color: '#0F172A' }}>
                  {viewingPhotoItem.title}
                </h2>
                <div style={{ fontSize: '12px', color: '#64748B', marginTop: 2 }}>
                  Location: <strong>{viewingPhotoItem.location}</strong> • Captured: {viewingPhotoItem.photoTime}
                </div>
              </div>
              <button className="btn btn-ghost" onClick={() => setViewingPhotoItem(null)}>✕</button>
            </div>

            {/* Photo Preview Container */}
            <div style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid #E2E8F0', marginBottom: 14, background: '#0F172A' }}>
              <img
                src={viewingPhotoItem.photoUrl || imgSiltTrap}
                alt={viewingPhotoItem.title}
                style={{ width: '100%', maxHeight: '420px', objectFit: 'contain', display: 'block', margin: '0 auto' }}
              />
            </div>

            {/* Metadata & Status */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC', padding: '10px 14px', borderRadius: 8, border: '1px solid #E2E8F0', flexWrap: 'wrap', gap: 8 }}>
              <div style={{ fontSize: '12px', color: '#334155', flex: 1, minWidth: 200 }}>
                <strong>Observation:</strong> {viewingPhotoItem.note}
              </div>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '3px 10px',
                  borderRadius: 999,
                  backgroundColor: viewingPhotoItem.status === 'pass' ? '#ECFDF5' : '#FEF2F2',
                  color: viewingPhotoItem.status === 'pass' ? '#059669' : '#DC2626',
                  whiteSpace: 'nowrap',
                }}
              >
                {viewingPhotoItem.status === 'pass' ? '✓ Compliant with DOE' : '⚠️ Action Needed'}
              </span>
            </div>

            <div className="modal-actions" style={{ marginTop: 14 }}>
              <button className="btn btn-primary" onClick={() => setViewingPhotoItem(null)}>
                Close Photo Evidence
              </button>
            </div>
          </div>
        </div>
      )}
    </Shell>
  );
}
