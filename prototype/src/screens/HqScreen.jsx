import { useMemo, useState } from 'react';
import Shell from '../components/Shell';
import { Bars } from '../components/Charts';
import { FLEET_NEXT } from '../data/sites';
import { DIESEL_RM_PER_L, monthly, fmt } from '../data/model';

const TABS = [
  { id: 'savings', label: 'Group Savings & P&L', icon: '💰' },
  { id: 'portfolio', label: 'Site Portfolio & Assets', icon: '🗺️' },
  { id: 'calculator', label: 'Pre-Tender Calculator', icon: '🧮' },
];

export default function HqScreen({ user, sites = [], onAddSite, onLogout }) {
  const [activeTab, setActiveTab] = useState('savings');
  const [dieselPrice, setDieselPrice] = useState(DIESEL_RM_PER_L);
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
    { k: 'Portfolio Savings', v: `RM ${fmt(totals.totalRM, 2)}/mo`, tone: 'ok' },
    { k: 'Active Parcels', v: `${sites.length} Sites`, tone: 'ok' },
    { k: 'Diesel Eliminated', v: `${fmt(totals.avoidedL, 2)} L`, tone: 'ok' },
    { k: 'Commercial Diesel', v: `RM ${dieselPrice.toFixed(2)}/L` },
  ];

  // Pre-Tender Sizing Calculation
  const estMonthlyFuelL = calcCranes * 7000 + calcHoists * 2500;
  const estMonthlyFuelRM = estMonthlyFuelL * dieselPrice;
  const estAvoidedRentalRM = calcCranes * 15000;
  const estTotalSavingsRM = (estMonthlyFuelRM + estAvoidedRentalRM) * calcDuration;
  const recBessSize = calcCranes > 1 || calcFloors > 25 ? '522 kWh / 400 kW Inverter' : '261 kWh / 200 kW Inverter';
  const recSolarKwp = calcCranes > 1 ? '300 kWp' : '150 kWp';
  const recPaybackMonths = (350000 / (estMonthlyFuelRM + estAvoidedRentalRM - 18000)).toFixed(1);

  const tenderClauseText = `SIME DARBY PROPERTY GREEN TENDER SPECIFICATION:
Clause 14.8 (Clean Site Power Mandate):
The Main Contractor shall deploy a Containerized Battery Energy Storage System (minimum ${recBessSize}) with rooftop solar PV (minimum ${recSolarKwp}) for primary site machinery. Continuous diesel generator operation is prohibited under DOE Schedule 6. Telemetry shall connect to Sime Darby Property's GreenPulse system.`;

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
      [siteKey]: `✓ Logistics Approved (${new Date().toLocaleDateString('en-MY')})`,
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
          <h1>HQ Executive Dashboard</h1>
          <p>
            Group cost savings, active site performance, and project energy planning
          </p>
        </div>
        <div className="top-meta" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
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
            }}
          >
            <span>+</span> Add New Project
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
              style={{ width: 65, padding: '3px 6px', borderRadius: 4, border: '1px solid var(--line)', fontWeight: 600, fontSize: 12 }}
            />
            <span style={{ fontSize: 11, color: 'var(--muted)' }}>/ L</span>
          </div>
        </div>
      </div>

      {/* TAB 1: GROUP SAVINGS & P&L */}
      {activeTab === 'savings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Executive KPI Summary */}
          <section className="grid g4">
            <div className="card kpi hero">
              <div className="label">Monthly Cash Saved</div>
              <div className="value num" style={{ color: '#0F766E' }}>
                RM {fmt(totals.totalRM, 2)}
              </div>
              <div className="foot num">RM {fmt(totals.fuelRM, 2)} fuel + RM {fmt(totals.rentalAvoided, 2)} generator rentals avoided</div>
            </div>

            <div className="card kpi">
              <div className="label">Diesel Eliminated</div>
              <div className="value num">
                {fmt(totals.avoidedL, 2)}<small> L / mo</small>
              </div>
              <div className="foot num">Across {sites.length} active construction sites</div>
            </div>

            <div className="card kpi">
              <div className="label">Carbon Abated (Scope 1)</div>
              <div className="value num">
                {fmt(totals.co2t, 2)}<small> tCO2e / mo</small>
              </div>
              <div className="foot num">Direct generator exhaust eliminated</div>
            </div>

            <div className="card kpi">
              <div className="label">Average Site Payback</div>
              <div className="value num" style={{ color: '#0F766E' }}>
                14<small> Months</small>
              </div>
              <div className="foot num">Full capital equipment payback</div>
            </div>
          </section>

          {/* 6-Month Cost Comparison Graph */}
          <section className="card">
            <h2 style={{ fontSize: '16px', margin: '0 0 4px 0' }}>Monthly Power Costs: Generator vs Solar + Battery</h2>
            <p className="sub" style={{ margin: '0 0 12px 0', fontSize: '12px' }}>
              Comparing old rental diesel generator expenses against clean solar and battery operating costs.
            </p>
            <Bars rows={chartRows} height={210} />
            <div className="legend" style={{ marginTop: 10 }}>
              <span><i style={{ background: '#94a3b8' }} />Old Generator Fuel & Rental Invoices</span>
              <span><i style={{ background: 'var(--green)' }} />Clean Solar + Battery Operating Cost</span>
            </div>
          </section>

          {/* Diesel Price Sensitivity & Bursa ESG Box */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 14 }}>
            <div className="card" style={{ borderLeft: '4px solid #0F766E' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                  Commercial Diesel Price Impact
                </span>
                <span style={{ fontSize: '12px', color: '#0F766E', fontWeight: 700 }}>
                  Current: RM {dieselPrice.toFixed(2)} / L
                </span>
              </div>
              <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 10px 0' }}>
                Commercial construction has no fuel subsidies. Solar and battery power locks in zero fuel cost regardless of market diesel price hikes.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, background: '#F8FAFC', padding: 10, borderRadius: 6, border: '1px solid #E2E8F0' }}>
                <div>
                  <span style={{ fontSize: '11px', color: '#64748B' }}>At Current RM {dieselPrice.toFixed(2)}/L:</span>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>RM {fmt(totals.totalRM, 2)}/mo</div>
                  <div style={{ fontSize: '11px', color: '#0F766E' }}>Payback in 14 Months</div>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: '#64748B' }}>If Diesel Hits RM 6.00/L:</span>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#059669' }}>
                    RM {fmt(totals.avoidedL * 6.0 + totals.rentalAvoided, 2)}/mo
                  </div>
                  <div style={{ fontSize: '11px', color: '#059669' }}>Payback in 12 Months</div>
                </div>
              </div>
            </div>

            <div className="card" style={{ borderLeft: '4px solid #2563EB' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', display: 'block', marginBottom: 6 }}>
                Bursa Malaysia Annual Report Data (Scope 1)
              </span>
              <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 10px 0' }}>
                Verified metrics ready to copy into the Sime Darby Property Annual Integrated Report.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: 4 }}>
                  <span>Direct Scope 1 Emission Reduction</span>
                  <b style={{ color: '#059669' }}>-77.6% Cut</b>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: 4 }}>
                  <span>Construction Carbon Intensity</span>
                  <b style={{ color: '#059669' }}>4.12 kg CO2e / m2 (vs 18.40 baseline)</b>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Green Certification Compliance</span>
                  <b>GBI Gold & CIDB MyCREST Verified</b>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SITE PORTFOLIO & ASSET DEPLOYMENT */}
      {activeTab === 'portfolio' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Sites Performance Table */}
          <section className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 10 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '16px' }}>Active Projects & Cost Savings</h2>
                <p className="sub" style={{ margin: '2px 0 0 0', fontSize: '12px' }}>
                  Financial and fuel performance across {sites.length} Sime Darby Property construction parcels.
                </p>
              </div>
              <button
                onClick={() => setShowAddSiteModal(true)}
                className="btn btn-primary"
                style={{ fontSize: '12px', padding: '6px 12px' }}
              >
                + Add New Project
              </button>
            </div>

            <div className="table-responsive">
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '1px solid #E2E8F0', color: '#64748B' }}>
                    <th style={{ padding: '8px' }}>Project Site</th>
                    <th style={{ padding: '8px' }}>Battery & Solar Setup</th>
                    <th style={{ padding: '8px' }}>Diesel Saved</th>
                    <th style={{ padding: '8px' }}>Generator Rental Saved</th>
                    <th style={{ padding: '8px' }}>Monthly Net Savings</th>
                    <th style={{ padding: '8px' }}>Carbon Cut</th>
                    <th style={{ padding: '8px' }}>Payback</th>
                  </tr>
                </thead>
                <tbody>
                  {siteResults.map(({ site: s, m }) => (
                    <tr key={s.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '10px 8px', fontWeight: 600, color: '#0F172A' }}>
                        {s.name}
                        <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 400 }}>{s.contractor}</div>
                      </td>
                      <td style={{ padding: '10px 8px' }}>
                        {s.bessKWh} kWh ({s.bessKW} kW) + {s.solarKWp} kWp Solar
                      </td>
                      <td style={{ padding: '10px 8px', fontWeight: 600 }}>
                        {fmt(m.avoidedL, 2)} L
                      </td>
                      <td style={{ padding: '10px 8px' }}>
                        RM {fmt(s.rentalAvoided || 5000, 2)}/mo
                      </td>
                      <td style={{ padding: '10px 8px', fontWeight: 700, color: '#0F766E' }}>
                        RM {fmt(m.totalRM, 2)}/mo
                      </td>
                      <td style={{ padding: '10px 8px' }}>
                        {fmt(m.co2t, 2)} tCO2e
                      </td>
                      <td style={{ padding: '10px 8px' }}>
                        <span className="tag ok">{s.paybackMonths || 14} Months</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* BESS Fleet Asset Relocation Roadmap */}
          <section className="card">
            <h2 style={{ fontSize: '16px', margin: '0 0 4px 0' }}>Battery Redeployment Schedule</h2>
            <p className="sub" style={{ margin: '0 0 12px 0', fontSize: '12px' }}>
              When a site gets permanent TNB power, the battery container moves to the next project parcel.
            </p>

            <div className="table-responsive">
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '1px solid #E2E8F0', color: '#64748B' }}>
                    <th style={{ padding: '8px' }}>Battery Unit</th>
                    <th style={{ padding: '8px' }}>Capacity</th>
                    <th style={{ padding: '8px' }}>Current Project</th>
                    <th style={{ padding: '8px' }}>TNB Energization Target</th>
                    <th style={{ padding: '8px' }}>Next Planned Project</th>
                    <th style={{ padding: '8px' }}>Transfer Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '10px 8px', fontWeight: 700 }}>Unit BESS-01</td>
                    <td style={{ padding: '10px 8px' }}>261 kWh / 200 kW</td>
                    <td style={{ padding: '10px 8px' }}>Putra Heights Development</td>
                    <td style={{ padding: '10px 8px' }}>Dec 2026 (Substation on-line)</td>
                    <td style={{ padding: '10px 8px', fontWeight: 600 }}>{FLEET_NEXT.putra.next}</td>
                    <td style={{ padding: '10px 8px' }}>
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
                          Authorize Move
                        </button>
                      )}
                    </td>
                  </tr>

                  <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '10px 8px', fontWeight: 700 }}>Unit BESS-02</td>
                    <td style={{ padding: '10px 8px' }}>522 kWh / 400 kW</td>
                    <td style={{ padding: '10px 8px' }}>Melati Development</td>
                    <td style={{ padding: '10px 8px' }}>Aug 2027 (Compact sub on-line)</td>
                    <td style={{ padding: '10px 8px', fontWeight: 600 }}>{FLEET_NEXT.melati.next}</td>
                    <td style={{ padding: '10px 8px' }}>
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
                          Authorize Move
                        </button>
                      )}
                    </td>
                  </tr>

                  <tr>
                    <td style={{ padding: '10px 8px', fontWeight: 700 }}>Unit BESS-03</td>
                    <td style={{ padding: '10px 8px' }}>261 kWh / 260 kW</td>
                    <td style={{ padding: '10px 8px' }}>Bandar Rimbayu CLQ</td>
                    <td style={{ padding: '10px 8px' }}>Permanent Off-Grid Site</td>
                    <td style={{ padding: '10px 8px', fontWeight: 600 }}>{FLEET_NEXT.rimbayu.next}</td>
                    <td style={{ padding: '10px 8px' }}>
                      <span className="tag">Permanent Station</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {/* TAB 3: PRE-TENDER PROJECT CALCULATOR */}
      {activeTab === 'calculator' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <section className="card" style={{ borderLeft: '4px solid #D71920' }}>
            <h2 style={{ fontSize: '16px', margin: '0 0 4px 0' }}>Pre-Tender Project Sizing</h2>
            <p className="sub" style={{ margin: '0 0 14px 0', fontSize: '12px' }}>
              Estimate battery size and cost savings before issuing contractor tender packages.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 16 }}>
              <div style={{ background: '#F8FAFC', padding: 12, borderRadius: 8, border: '1px solid #E2E8F0' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#64748B' }}>Tower Cranes</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
                  <input
                    type="range"
                    min="1"
                    max="4"
                    value={calcCranes}
                    onChange={(e) => setCalcCranes(Number(e.target.value))}
                    style={{ flex: 1 }}
                  />
                  <b className="num" style={{ fontSize: '15px', color: '#0F172A', minWidth: 40 }}>{calcCranes} Cranes</b>
                </div>
              </div>

              <div style={{ background: '#F8FAFC', padding: 12, borderRadius: 8, border: '1px solid #E2E8F0' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#64748B' }}>Passenger Hoists</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
                  <input
                    type="range"
                    min="1"
                    max="4"
                    value={calcHoists}
                    onChange={(e) => setCalcHoists(Number(e.target.value))}
                    style={{ flex: 1 }}
                  />
                  <b className="num" style={{ fontSize: '15px', color: '#0F172A', minWidth: 40 }}>{calcHoists} Hoists</b>
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
                  <b className="num" style={{ fontSize: '15px', color: '#0F172A', minWidth: 40 }}>{calcFloors} Floors</b>
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
                  <b className="num" style={{ fontSize: '15px', color: '#0F172A', minWidth: 40 }}>{calcDuration} Months</b>
                </div>
              </div>
            </div>

            {/* Calculated Output Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10, marginBottom: 14 }}>
              <div style={{ background: '#F0FDF4', padding: '10px 14px', borderRadius: 8, border: '1px solid #BBF7D0' }}>
                <div style={{ fontSize: '11px', color: '#166534', fontWeight: 600 }}>Recommended Setup</div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#166534', marginTop: 2 }}>{recBessSize}</div>
                <div style={{ fontSize: '11px', color: '#15803D' }}>+ {recSolarKwp} Rooftop Solar</div>
              </div>

              <div style={{ background: '#EFF6FF', padding: '10px 14px', borderRadius: 8, border: '1px solid #BFDBFE' }}>
                <div style={{ fontSize: '11px', color: '#1E40AF', fontWeight: 600 }}>Estimated Diesel Eliminated</div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#1E40AF', marginTop: 2 }} className="num">
                  {fmt(estMonthlyFuelL * calcDuration, 2)} Litres
                </div>
                <div style={{ fontSize: '11px', color: '#2563EB' }}>RM {fmt(estMonthlyFuelRM * calcDuration, 2)} fuel budget</div>
              </div>

              <div style={{ background: '#FEF2F2', padding: '10px 14px', borderRadius: 8, border: '1px solid #FECACA' }}>
                <div style={{ fontSize: '11px', color: '#991B1B', fontWeight: 600 }}>Total Estimated Savings</div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#991B1B', marginTop: 2 }} className="num">
                  RM {fmt(estTotalSavingsRM, 2)}
                </div>
                <div style={{ fontSize: '11px', color: '#B91C1C' }}>Capital Payback: {recPaybackMonths} Months</div>
              </div>
            </div>

            {/* Tender Clause Box */}
            <div style={{ background: '#F8FAFC', padding: 12, borderRadius: 8, border: '1px solid #CBD5E1' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, flexWrap: 'wrap', gap: 8 }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A' }}>
                  Contractor Tender Clause (Copy and paste into tender documents):
                </span>
                <button
                  onClick={handleCopyClause}
                  style={{
                    padding: '4px 10px',
                    backgroundColor: copiedClause ? '#059669' : '#0F766E',
                    color: '#fff',
                    borderRadius: 6,
                    border: 'none',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {copiedClause ? '✓ Copied to Clipboard!' : '📋 Copy Tender Clause'}
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

      {/* MODAL: COMMISSION NEW TOWNSHIP PARCEL */}
      {showAddSiteModal && (
        <div className="modal-backdrop" onClick={() => setShowAddSiteModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 540 }}>
            <div className="modal-header">
              <div>
                <h2 style={{ fontSize: '16px' }}>Add New Project Site</h2>
                <p className="sub" style={{ margin: '2px 0 0 0', fontSize: '12px' }}>
                  Register a new Sime Darby Property site for clean solar and battery monitoring.
                </p>
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
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Main Contractor</label>
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
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Battery Capacity</label>
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
                  Save Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Shell>
  );
}
