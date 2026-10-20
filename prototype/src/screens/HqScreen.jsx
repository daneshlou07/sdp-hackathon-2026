import { useMemo, useState } from 'react';
import Shell from '../components/Shell';
import { Bars } from '../components/Charts';
import { FLEET_NEXT } from '../data/sites';
import { DIESEL_RM_PER_L, monthly, fmt } from '../data/model';
import AiCopilotModal from '../components/AiCopilotModal';

const TABS = [
  { id: 'savings', label: 'Executive P&L & Fuel Ticker', icon: '💰' },
  { id: 'calculator', label: 'Pre-Tender Sizing Calculator', icon: '🧮' },
  { id: 'bursa', label: 'Bursa Malaysia CSI Disclosure', icon: '📋' },
  { id: 'portfolio', label: 'Multi-Site Portfolio Ledger', icon: '🗺️' },
  { id: 'roadmap', label: '10-Yr Township Fleet Roadmap', icon: '🚚' },
];

export default function HqScreen({ user, sites = [], onAddSite, onLogout }) {
  const [activeTab, setActiveTab] = useState('savings');
  const [dieselPrice, setDieselPrice] = useState(DIESEL_RM_PER_L);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [showAddSiteModal, setShowAddSiteModal] = useState(false);

  // Transfer approvals state
  const [transfers, setTransfers] = useState({
    putra: 'Pending Approval',
    melati: 'Pending Approval',
    rimbayu: 'Permanent Station',
  });

  // Pre-Tender Sizing Calculator State
  const [calcCranes, setCalcCranes] = useState(2);
  const [calcHoists, setCalcHoists] = useState(2);
  const [calcFloors, setCalcFloors] = useState(32);
  const [calcDuration, setCalcDuration] = useState(24);
  const [copiedClause, setCopiedClause] = useState(false);

  // Form State for Adding New Site
  const [newSite, setNewSite] = useState({
    name: 'City of Elmina - Elmina Ridge Phase 2',
    short: 'Elmina Ridge',
    contractor: 'TCS Construction Sdn Bhd',
    bessKWh: 522,
    bessKW: 400,
    solarKWp: 280,
    rentalAvoided: 8500,
    monthsNoTnb: 24,
  });

  const siteResults = useMemo(() => {
    return sites.map((s) => ({
      site: s,
      m: monthly(s, dieselPrice),
    }));
  }, [sites, dieselPrice]);

  const totals = useMemo(() => {
    return siteResults.reduce(
      (acc, r) => ({
        avoidedL: acc.avoidedL + r.m.avoidedL,
        fuelRM: acc.fuelRM + r.m.fuelRM,
        rentalAvoided: acc.rentalAvoided + (r.site.rentalAvoided || 5000),
        totalRM: acc.totalRM + r.m.totalRM,
        co2t: acc.co2t + r.m.co2t,
        loadKWh: acc.loadKWh + r.m.loadKWh,
      }),
      { avoidedL: 0, fuelRM: 0, rentalAvoided: 0, totalRM: 0, co2t: 0, loadKWh: 0 }
    );
  }, [siteResults]);

  const treesPlanted = Math.round((totals.co2t * 1000) / 145);

  const chartRows = [
    { label: 'May', a: totals.totalRM * 1.05 + 12000, b: totals.totalRM * 0.18 },
    { label: 'Jun', a: totals.totalRM * 1.02 + 15000, b: totals.totalRM * 0.17 },
    { label: 'Jul', a: totals.totalRM * 0.98 + 10000, b: totals.totalRM * 0.16 },
    { label: 'Aug', a: totals.totalRM * 1.04 + 14000, b: totals.totalRM * 0.18 },
    { label: 'Sep', a: totals.totalRM * 1.01 + 11000, b: totals.totalRM * 0.17 },
    { label: 'Oct (MTD)', a: totals.totalRM + 13000, b: totals.totalRM * 0.16 },
  ];

  const pills = [
    { k: 'Portfolio Savings', v: `RM ${fmt(totals.totalRM)}/mo`, tone: 'ok' },
    { k: 'Active Parcels', v: `${sites.length} Sites`, tone: 'ok' },
    { k: 'Diesel Eliminated', v: `${fmt(totals.avoidedL)} L`, tone: 'ok' },
    { k: 'Commercial Diesel', v: `RM ${dieselPrice.toFixed(2)}/L` },
  ];

  // Pre-Tender Sizing Formula
  const estMonthlyFuelL = calcCranes * 7000 + calcHoists * 2500;
  const estMonthlyFuelRM = estMonthlyFuelL * dieselPrice;
  const estAvoidedRentalRM = calcCranes * 15000;
  const estTotalSavingsRM = (estMonthlyFuelRM + estAvoidedRentalRM) * calcDuration;
  const recBessSize = calcCranes > 1 || calcFloors > 25 ? '522 kWh / 400 kW Inverter' : '261 kWh / 200 kW Inverter';
  const recSolarKwp = calcCranes > 1 ? '300 kWp' : '150 kWp';
  const recPaybackMonths = (350000 / (estMonthlyFuelRM + estAvoidedRentalRM - 18000)).toFixed(1);

  const tenderClauseText = `SIME DARBY PROPERTY MANDATORY GREEN TENDER CLAUSE:
Clause 14.8 (Zero-Genset Site Energy Operating System):
The Main Contractor shall deploy an approved Containerized Battery Energy Storage System (minimum ${recBessSize}) paired with temporary rooftop solar PV (minimum ${recSolarKwp}) to supply primary construction machinery power. The use of continuous prime diesel generators is strictly prohibited under the Township Environmental Noise Management Standard (DOE Schedule 6). The Contractor shall integrate telemetry into Sime Darby Property's GreenPulse SiteOS.`;

  const handleCopyClause = () => {
    navigator.clipboard?.writeText(tenderClauseText);
    setCopiedClause(true);
    setTimeout(() => setCopiedClause(false), 3000);
  };

  const handleCreateSite = (e) => {
    e.preventDefault();
    const id = newSite.short.toLowerCase().replace(/\s+/g, '-');
    const siteData = {
      id,
      name: newSite.name,
      short: newSite.short,
      contractor: newSite.contractor,
      kind: 'High-Rise Construction Parcel',
      bessKWh: Number(newSite.bessKWh),
      bessKW: Number(newSite.bessKW),
      solarKWp: Number(newSite.solarKWp),
      soc0: 0.7,
      daysPerMonth: 26,
      monthsNoTnb: Number(newSite.monthsNoTnb),
      monthsElapsed: 1,
      gensetBefore: '2 x 300 kVA (rented)',
      rentalAvoided: Number(newSite.rentalAvoided),
      noiseBase: 53,
      gensetDb: 68,
      equipment: [
        { id: 'crane', name: 'Tower Crane #1', kw: 45, hours: [8, 9, 10, 11, 12, 14, 15, 16, 17] },
        { id: 'hoist', name: 'Passenger Hoist #1', kw: 28, hours: [8, 9, 10, 11, 12, 14, 15, 16, 17] },
        { id: 'office', name: 'Site Office Cabins', kw: 15, hours: [8, 9, 10, 11, 12, 13, 14, 15, 16, 17] },
      ],
    };

    if (onAddSite) {
      onAddSite(siteData);
    }
    setShowAddSiteModal(false);
  };

  const handleApproveTransfer = (siteKey) => {
    setTransfers((prev) => ({
      ...prev,
      [siteKey]: `✓ Logistics Order Approved (${new Date().toLocaleDateString('en-MY')})`,
    }));
  };

  return (
    <Shell
      user={user}
      area="HQ Finance & ESG"
      showSites={false}
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
          <h1>Sime Darby Property: Group Executive Command</h1>
          <p>
            Consolidated Site Power Economics, Pre-Tender Sizing, and 10-Year Master Township Fleet Governance
          </p>
        </div>
        <div className="top-meta" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={() => setShowAddSiteModal(true)}
            style={{
              padding: '6px 14px',
              backgroundColor: '#D71920',
              color: '#FFFFFF',
              borderRadius: '8px',
              border: 'none',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
          >
            <span>+</span> Commission New Township Site
          </button>
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
            <span>⚡</span> Open HQ Strategy AI Copilot
          </button>
          <div className="price-input card" style={{ padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 600 }}>Commercial Diesel:</span>
            <span style={{ fontSize: 12 }}>RM</span>
            <input
              id="diesel-price-input"
              type="number"
              step="0.05"
              min="2.00"
              max="10.00"
              value={dieselPrice}
              onChange={(e) => setDieselPrice(parseFloat(e.target.value) || 0)}
              style={{ width: 70, padding: '3px 6px', borderRadius: 4, border: '1px solid var(--line)', fontWeight: 600, fontSize: 12 }}
            />
            <span style={{ fontSize: 11, color: 'var(--muted)' }}>/ L</span>
          </div>
        </div>
      </div>

      {/* TAB 1: EXECUTIVE P&L & SAVINGS */}
      {activeTab === 'savings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div id="ticker" className="card" style={{ background: '#fffbeb', borderColor: '#fde68a' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 20 }}>⛽</span>
                <div>
                  <b style={{ color: '#92400e' }}>
                    Gazetted Malaysian Commercial Fuel Price (15 – 21 Oct 2026): Euro 5 = RM 5.17 / L | B7 = RM 5.37 / L
                  </b>
                  <p style={{ margin: 0, fontSize: 12, color: '#b45309' }}>
                    Commercial construction is 100% excluded from BUDI Madani subsidies. Savings are calculated at verified market commercial price.
                  </p>
                </div>
              </div>
              <span className="tag near" style={{ background: '#fef3c7', color: '#92400e' }}>
                Un-subsidised Commercial Market
              </span>
            </div>
          </div>

          <section className="grid g4">
            <div className="card kpi hero">
              <div className="label">Total Net Cash Saved (MTD)</div>
              <div className="value num" style={{ color: '#0F766E' }}>RM {fmt(totals.totalRM)}</div>
              <div className="foot num">RM {fmt(totals.fuelRM)} fuel + RM {fmt(totals.rentalAvoided)} rental avoided</div>
            </div>
            <div className="card kpi">
              <div className="label">Total Diesel Eliminated</div>
              <div className="value num">{fmt(totals.avoidedL)}<small> L</small></div>
              <div className="foot num">Across {sites.length} active construction parcels</div>
            </div>
            <div className="card kpi">
              <div className="label">Bursa Scope 1 GHG Avoided</div>
              <div className="value num">{fmt(totals.co2t, 1)}<small> tCO2e</small></div>
              <div className="foot num">2.68 kg CO2e / Litre diesel abated</div>
            </div>
            <div className="card kpi">
              <div className="label">Equivalent Trees Planted</div>
              <div className="value num">{fmt(treesPlanted)}<small> Trees</small></div>
              <div className="foot">Matching Forestry ESG conversion</div>
            </div>
          </section>

          <section className="card">
            <h2>6-Month Temporary Power OpEx Comparison (RM)</h2>
            <p className="sub">Grey: Old Diesel Generator Rental + Fuel Bill. Green: Clean BESS + Solar OpEx.</p>
            <Bars rows={chartRows} height={210} />
            <div className="legend" style={{ marginTop: 10 }}>
              <span><i style={{ background: '#94a3b8' }} />Old Diesel Generator Rental + Fuel Invoices</span>
              <span><i style={{ background: 'var(--green)' }} />GreenPulse Clean Solar + BESS Inverter OpEx</span>
            </div>
          </section>

          <section className="card" style={{ borderLeft: '4px solid #0F766E' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ backgroundColor: '#0F766E', color: '#fff', fontSize: '11px', fontWeight: 800, padding: '2px 6px', borderRadius: 4 }}>
                MACRO AI SENSITIVITY
              </span>
              <span style={{ fontSize: '12px', color: '#0F766E', fontWeight: 700 }}>
                Live Model: RM {dieselPrice.toFixed(2)} / L
              </span>
            </div>
            <h2 style={{ fontSize: '15px', margin: '4px 0 6px 0' }}>Diesel Subsidy Volatility Hedge</h2>
            <p style={{ fontSize: '13px', color: '#475569', margin: '0 0 10px 0' }}>
              GreenPulse completely insulates Sime Darby Property and Tier-1 contractors from national diesel price spikes, converting volatile operational fuel burn into a fixed, reusable capital asset.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, background: '#F8FAFC', padding: 10, borderRadius: 8, border: '1px solid #E2E8F0' }}>
              <div>
                <span style={{ fontSize: '11px', color: '#64748B' }}>Baseline Rate (RM 5.17/L):</span>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>RM 125,128 / month saved</div>
                <div style={{ fontSize: '11px', color: '#0F766E' }}>Full Payback in 14.2 Months</div>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: '#64748B' }}>Escalated Risk (RM 5.80/L):</span>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#059669' }}>RM 136,720 / month saved</div>
                <div style={{ fontSize: '11px', color: '#059669' }}>Accelerated Payback in 12.8 Months</div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* TAB 2: PRE-TENDER SIZING CALCULATOR */}
      {activeTab === 'calculator' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <section className="card" style={{ borderLeft: '4px solid #D71920' }}>
            <h2 style={{ fontSize: '16px', margin: '0 0 4px 0' }}>Pre-Tender BESS Sizing & Contractor Specification Engine</h2>
            <p className="sub" style={{ marginBottom: 14 }}>
              Used by Sime Darby Property Project Directors before issuing main contractor tender packages to determine optimal clean energy storage capacity and green procurement clauses.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 16 }}>
              <div style={{ background: '#F8FAFC', padding: 12, borderRadius: 8, border: '1px solid #E2E8F0' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#64748B' }}>Number of Tower Cranes</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
                  <input
                    type="range"
                    min="1"
                    max="4"
                    value={calcCranes}
                    onChange={(e) => setCalcCranes(Number(e.target.value))}
                    style={{ flex: 1 }}
                  />
                  <b className="num" style={{ fontSize: '16px', color: '#0F172A', minWidth: 30 }}>{calcCranes} TC</b>
                </div>
              </div>

              <div style={{ background: '#F8FAFC', padding: 12, borderRadius: 8, border: '1px solid #E2E8F0' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#64748B' }}>Number of Passenger Hoists</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
                  <input
                    type="range"
                    min="1"
                    max="4"
                    value={calcHoists}
                    onChange={(e) => setCalcHoists(Number(e.target.value))}
                    style={{ flex: 1 }}
                  />
                  <b className="num" style={{ fontSize: '16px', color: '#0F172A', minWidth: 30 }}>{calcHoists} PH</b>
                </div>
              </div>

              <div style={{ background: '#F8FAFC', padding: 12, borderRadius: 8, border: '1px solid #E2E8F0' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#64748B' }}>Building Storeys</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
                  <input
                    type="range"
                    min="12"
                    max="50"
                    value={calcFloors}
                    onChange={(e) => setCalcFloors(Number(e.target.value))}
                    style={{ flex: 1 }}
                  />
                  <b className="num" style={{ fontSize: '16px', color: '#0F172A', minWidth: 30 }}>{calcFloors} Flr</b>
                </div>
              </div>

              <div style={{ background: '#F8FAFC', padding: 12, borderRadius: 8, border: '1px solid #E2E8F0' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#64748B' }}>Construction Duration</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
                  <input
                    type="range"
                    min="12"
                    max="36"
                    value={calcDuration}
                    onChange={(e) => setCalcDuration(Number(e.target.value))}
                    style={{ flex: 1 }}
                  />
                  <b className="num" style={{ fontSize: '16px', color: '#0F172A', minWidth: 30 }}>{calcDuration} Mos</b>
                </div>
              </div>
            </div>

            {/* Calculated Output Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10, marginBottom: 14 }}>
              <div style={{ background: '#F0FDF4', padding: '10px 14px', borderRadius: 8, border: '1px solid #BBF7D0' }}>
                <div style={{ fontSize: '11px', color: '#166534', fontWeight: 600 }}>Recommended Hardware Setup</div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#166534', marginTop: 2 }}>{recBessSize}</div>
                <div style={{ fontSize: '11px', color: '#15803D' }}>+ {recSolarKwp} Temporary Rooftop Solar</div>
              </div>
              <div style={{ background: '#EFF6FF', padding: '10px 14px', borderRadius: 8, border: '1px solid #BFDBFE' }}>
                <div style={{ fontSize: '11px', color: '#1E40AF', fontWeight: 600 }}>Estimated Total Fuel Saved</div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#1E40AF', marginTop: 2 }} className="num">{fmt(estMonthlyFuelL * calcDuration)} Litres</div>
                <div style={{ fontSize: '11px', color: '#2563EB' }}>RM {fmt(estMonthlyFuelRM * calcDuration)} fuel budget</div>
              </div>
              <div style={{ background: '#FEF2F2', padding: '10px 14px', borderRadius: 8, border: '1px solid #FECACA' }}>
                <div style={{ fontSize: '11px', color: '#991B1B', fontWeight: 600 }}>Contractor Project OpEx Savings</div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#991B1B', marginTop: 2 }} className="num">RM {fmt(estTotalSavingsRM)}</div>
                <div style={{ fontSize: '11px', color: '#B91C1C' }}>Capital Payback: {recPaybackMonths} Months</div>
              </div>
            </div>

            {/* Tender Clause Box */}
            <div style={{ background: '#F8FAFC', padding: 12, borderRadius: 8, border: '1px solid #CBD5E1' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A' }}>
                  Official Green Procurement Tender Specification Clause:
                </span>
                <button
                  onClick={handleCopyClause}
                  style={{
                    padding: '4px 10px',
                    backgroundColor: copiedClause ? '#059669' : '#0F766E',
                    color: '#fff',
                    borderRadius: 6,
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {copiedClause ? '✓ Copied to Clipboard!' : '📋 Copy Clause for Tender'}
                </button>
              </div>
              <pre
                style={{
                  fontSize: '12px',
                  color: '#334155',
                  backgroundColor: '#FFFFFF',
                  padding: 10,
                  borderRadius: 6,
                  border: '1px solid #E2E8F0',
                  whiteSpace: 'pre-wrap',
                  margin: 0,
                  fontFamily: 'monospace',
                }}
              >
                {tenderClauseText}
              </pre>
            </div>
          </section>
        </div>
      )}

      {/* TAB 3: BURSA MALAYSIA CSI DISCLOSURE */}
      {activeTab === 'bursa' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <section className="card">
            <h2>Bursa Malaysia Sustainability Reporting Guide (3rd Edition)</h2>
            <p className="sub">
              Construction Sustainability Index (CSI) Framework: Verified Construction Floor Area Carbon Intensity
            </p>
            <table>
              <tbody>
                <tr>
                  <td>Mandatory Disclosure Metric</td>
                  <td><b>Construction Floor Area (CFA) Carbon Intensity</b></td>
                </tr>
                <tr>
                  <td>Conventional 500 kVA Diesel Genset Baseline</td>
                  <td className="num">18.40 kg CO2e / m² CFA</td>
                </tr>
                <tr>
                  <td>GreenPulse Electrified Site Performance</td>
                  <td className="num" style={{ color: '#059669', fontSize: 16 }}><b>4.12 kg CO2e / m² CFA</b></td>
                </tr>
                <tr>
                  <td>Scope 1 Carbon Intensity Decarbonization</td>
                  <td><span className="tag ok">−77.6% Emission Abatement</span></td>
                </tr>
                <tr>
                  <td>Independent Verification Standards</td>
                  <td>Green Building Index (GBI) & CIDB MyCREST Tier 1 Gold</td>
                </tr>
                <tr>
                  <td>Audit Trail Verification</td>
                  <td>100% Telemetry Verified via 4G Industrial IoT Gateway (15-min intervals)</td>
                </tr>
              </tbody>
            </table>
            <p className="note" style={{ marginTop: 12 }}>
              Formatted for direct copy-paste into the <strong>Sime Darby Property Annual Integrated Report (Sustainability Statement)</strong>.
            </p>
          </section>
        </div>
      )}

      {/* TAB 4: MULTI-SITE PORTFOLIO LEDGER */}
      {activeTab === 'portfolio' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <section className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div>
                <h2 style={{ margin: 0 }}>Consolidated Multi-Site Construction Ledger</h2>
                <p className="sub" style={{ margin: '4px 0 0 0' }}>
                  Managing {sites.length} active construction parcels across Sime Darby Property master townships.
                </p>
              </div>
              <button
                onClick={() => setShowAddSiteModal(true)}
                className="btn btn-primary"
                style={{ fontSize: '13px' }}
              >
                + Commission New Site
              </button>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Site & Main Contractor</th>
                  <th>Hardware Setup</th>
                  <th>Monthly Diesel Saved</th>
                  <th>Rental Avoided</th>
                  <th>Net Cash OpEx Saved</th>
                  <th>Scope 1 Abated</th>
                  <th>Payback Timeline</th>
                </tr>
              </thead>
              <tbody>
                {siteResults.map(({ site: s, m }) => (
                  <tr key={s.id}>
                    <td><b>{s.name}</b><br /><small className="src">{s.contractor}</small></td>
                    <td>{s.bessKWh} kWh BESS / {s.bessKW} kW + {s.solarKWp} kWp Solar</td>
                    <td className="num">{fmt(m.avoidedL)} L (RM {fmt(m.fuelRM)})</td>
                    <td className="num">RM {fmt(s.rentalAvoided || 5000)}/mo</td>
                    <td className="num"><b style={{ color: '#0F766E' }}>RM {fmt(m.totalRM)}/mo</b></td>
                    <td className="num">{fmt(m.co2t, 1)} tCO2e/mo</td>
                    <td><span className="tag ok">{s.paybackMonths || 14} Months</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>
      )}

      {/* TAB 5: 10-YEAR TOWNSHIP FLEET ROADMAP */}
      {activeTab === 'roadmap' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <section className="card">
            <h2>Sime Darby Property: 10-Year Master Township Fleet Relocation Roadmap</h2>
            <p className="sub">
              How containerized BESS assets roll over across sequential township phases to eliminate stranded contractor capex.
            </p>
            <table>
              <thead>
                <tr>
                  <th>Asset Unit</th>
                  <th>Capacity</th>
                  <th>Current Project (2026)</th>
                  <th>Current Stage</th>
                  <th>Target Substation Date</th>
                  <th>Next Township Parcel</th>
                  <th>Executive Transfer Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><b>Unit BESS-01</b></td>
                  <td>261 kWh / 200 kW</td>
                  <td>Inta Bina Putra Heights</td>
                  <td>Month 14 of 24 (58%)</td>
                  <td>Dec 2026 (Substation energization)</td>
                  <td><b>{FLEET_NEXT.putra.next}</b> ({FLEET_NEXT.putra.move})</td>
                  <td>
                    {transfers.putra.includes('Approved') ? (
                      <span className="tag ok">{transfers.putra}</span>
                    ) : (
                      <button
                        onClick={() => handleApproveTransfer('putra')}
                        style={{
                          padding: '4px 8px',
                          backgroundColor: '#0F766E',
                          color: '#fff',
                          borderRadius: 6,
                          border: 'none',
                          fontSize: '11px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        Authorize Transfer
                      </button>
                    )}
                  </td>
                </tr>
                <tr>
                  <td><b>Unit BESS-02</b></td>
                  <td>522 kWh / 400 kW</td>
                  <td>Inta Bina Melati</td>
                  <td>Month 8 of 30 (27%)</td>
                  <td>Aug 2027 (Compact sub energization)</td>
                  <td><b>{FLEET_NEXT.melati.next}</b> ({FLEET_NEXT.melati.move})</td>
                  <td>
                    {transfers.melati.includes('Approved') ? (
                      <span className="tag ok">{transfers.melati}</span>
                    ) : (
                      <button
                        onClick={() => handleApproveTransfer('melati')}
                        style={{
                          padding: '4px 8px',
                          backgroundColor: '#0F766E',
                          color: '#fff',
                          borderRadius: 6,
                          border: 'none',
                          fontSize: '11px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        Authorize Transfer
                      </button>
                    )}
                  </td>
                </tr>
                <tr>
                  <td><b>Unit BESS-03</b></td>
                  <td>261 kWh / 260 kW</td>
                  <td>Inta Bina Rimbayu CLQ</td>
                  <td>Proposed Deployment</td>
                  <td>No permanent TNB connection</td>
                  <td><b>{FLEET_NEXT.rimbayu.next}</b></td>
                  <td><span className="tag">Permanent Worker Facility</span></td>
                </tr>
              </tbody>
            </table>

            <div style={{ background: '#F8FAFC', padding: 14, borderRadius: 8, border: '1px solid #E2E8F0', marginTop: 14 }}>
              <h3 style={{ fontSize: '14px', margin: '0 0 6px 0', color: '#0F172A' }}>
                💡 The Strategic Developer Moat: RM 9.84 Million Cumulative Township Value
              </h3>
              <p style={{ fontSize: '13px', color: '#475569', margin: 0, lineHeight: 1.45 }}>
                Standard construction projects last 24 to 36 months before permanent TNB electricity is energized. By treating BESS units as centralized, relocatable Sime Darby Property capital assets, the RM 350k investment is amortized over 3 to 4 sequential parcels, delivering a <strong>14.2-month full cash payback</strong>. Under 1.2 daily cycles, Lithium Iron Phosphate (LFP) chemistry retains over <strong>76% State of Health (SoH) at Year 10</strong>, creating pure recurring profit for the developer.
              </p>
            </div>
          </section>
        </div>
      )}

      {/* MODAL: COMMISSION NEW TOWNSHIP PARCEL */}
      {showAddSiteModal && (
        <div className="modal-backdrop" onClick={() => setShowAddSiteModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 560 }}>
            <div className="modal-header">
              <div>
                <h2>Commission New Township Construction Parcel</h2>
                <p className="sub">Register a new site to initiate GreenPulse IoT energy & acoustic telemetry.</p>
              </div>
              <button className="btn btn-ghost" onClick={() => setShowAddSiteModal(false)}>✕</button>
            </div>

            <form onSubmit={handleCreateSite} style={{ display: 'grid', gap: 12, marginTop: 10 }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Project & Parcel Name</label>
                <input
                  type="text"
                  required
                  value={newSite.name}
                  onChange={(e) => setNewSite({ ...newSite, name: e.target.value })}
                  style={{ width: '100%', padding: '6px 8px', borderRadius: 6, border: '1px solid var(--line)', fontSize: 13, marginTop: 4 }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Short Identifier</label>
                  <input
                    type="text"
                    required
                    value={newSite.short}
                    onChange={(e) => setNewSite({ ...newSite, short: e.target.value })}
                    style={{ width: '100%', padding: '6px 8px', borderRadius: 6, border: '1px solid var(--line)', fontSize: 13, marginTop: 4 }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Awarded Main Contractor</label>
                  <input
                    type="text"
                    required
                    value={newSite.contractor}
                    onChange={(e) => setNewSite({ ...newSite, contractor: e.target.value })}
                    style={{ width: '100%', padding: '6px 8px', borderRadius: 6, border: '1px solid var(--line)', fontSize: 13, marginTop: 4 }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>BESS Capacity (kWh)</label>
                  <select
                    value={newSite.bessKWh}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setNewSite({ ...newSite, bessKWh: val, bessKW: val === 522 ? 400 : 200 });
                    }}
                    style={{ width: '100%', padding: '6px 8px', borderRadius: 6, border: '1px solid var(--line)', fontSize: 13, marginTop: 4 }}
                  >
                    <option value={261}>261 kWh (200 kW)</option>
                    <option value={522}>522 kWh (400 kW)</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Solar PV (kWp)</label>
                  <input
                    type="number"
                    value={newSite.solarKWp}
                    onChange={(e) => setNewSite({ ...newSite, solarKWp: Number(e.target.value) })}
                    style={{ width: '100%', padding: '6px 8px', borderRadius: 6, border: '1px solid var(--line)', fontSize: 13, marginTop: 4 }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Off-Grid Duration</label>
                  <select
                    value={newSite.monthsNoTnb}
                    onChange={(e) => setNewSite({ ...newSite, monthsNoTnb: Number(e.target.value) })}
                    style={{ width: '100%', padding: '6px 8px', borderRadius: 6, border: '1px solid var(--line)', fontSize: 13, marginTop: 4 }}
                  >
                    <option value={18}>18 Months</option>
                    <option value={24}>24 Months</option>
                    <option value={30}>30 Months</option>
                  </select>
                </div>
              </div>

              <div className="modal-actions" style={{ marginTop: 14 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowAddSiteModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Commission Site & Start Telemetry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Modal */}
      <AiCopilotModal isOpen={isAiModalOpen} onClose={() => setIsAiModalOpen(false)} role="hq" />
    </Shell>
  );
}
