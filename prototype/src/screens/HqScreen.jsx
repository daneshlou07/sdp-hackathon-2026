import { useMemo, useState, useEffect } from 'react';
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

  // Auto-update diesel price from Malaysia Ministry of Finance / data.gov.my live feed
  useEffect(() => {
    let isMounted = true;
    async function fetchLatestFuelPrice() {
      try {
        const res = await fetch('https://api.data.gov.my/data-catalogue/?id=fuelprice');
        if (!res.ok) throw new Error('API fetch failed');
        const data = await res.json();
        if (Array.isArray(data)) {
          const levels = data.filter((x) => x.series_type === 'level' && typeof x.diesel === 'number');
          if (levels.length > 0 && isMounted) {
            const latest = levels[levels.length - 1];
            if (latest.diesel > 0) {
              setDieselPrice(latest.diesel);
            }
          }
        }
      } catch (_) {
        // Keeps verified DIESEL_RM_PER_L if offline or network fails
      }
    }
    fetchLatestFuelPrice();
    return () => {
      isMounted = false;
    };
  }, []);

  // Transfer approvals state
  const [transfers, setTransfers] = useState({
    elmina: 'Pending Approval',
    serenia: 'Pending Approval',
    bukitraja: 'Pending Approval',
  });

  // Pre-Tender Sizing Calculator State
  const [calcCranes, setCalcCranes] = useState(2);
  const [calcHoists, setCalcHoists] = useState(2);
  const [calcFloors, setCalcFloors] = useState(32);
  const [calcDuration, setCalcDuration] = useState(24);
  const [copiedClause, setCopiedClause] = useState(false);

  // Form State for Adding New Site
  const [newSite, setNewSite] = useState({
    name: 'KL East - The Ridge Phase 3',
    short: 'KL East Ridge',
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
      onLogout={onLogout}
    >
      {/* Top Header */}
      <div className="top">
        <div>
          <h1>HQ Executive Dashboard</h1>
          <p>
            Monitor savings, site performance, and energy costs across all projects.
          </p>
        </div>
        <div className="top-meta" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>

          <div className="card" style={{ padding: '6px 12px', fontSize: '12.5px', fontWeight: 600, color: '#0F172A' }}>
            Current Diesel Price : RM {dieselPrice.toFixed(2)} / L
          </div>
        </div>
      </div>

      {/* TAB 1: GROUP SAVINGS & P&L */}
      {activeTab === 'savings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Executive KPI Summary */}
          <section className="grid g4">
            <div
              className="card kpi"
              style={{
                border: '1.5px solid #10B981',
                background: 'linear-gradient(180deg, #FFFFFF 0%, #F0FDF4 100%)',
                position: 'relative',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                <span className="label" style={{ fontWeight: 900, color: '#065F46' }}>Monthly Cash Saved</span>

              </div>
              <div className="value num" style={{ color: '#047857', fontSize: '30px', margin: '4px 0 6px' }}>
                RM {fmt(Math.round(totals.totalRM))}
              </div>

            </div>

            <div className="card kpi">
              <div className="label">Diesel Fuel Cut</div>
              <div className="value num" style={{ margin: '4px 0 6px' }}>
                {fmt(Math.round(totals.avoidedL))}<small> Litres / mo</small>
              </div>
              <div className="foot" style={{ fontSize: '12px', color: '#64748B' }}>
                Across {sites.length} active construction sites
              </div>
            </div>

            <div className="card kpi">
              <div className="label">Carbon Reduced</div>
              <div className="value num" style={{ margin: '4px 0 6px' }}>
                {Math.round(totals.co2t)}<small> Tonnes / mo</small>
              </div>

            </div>

            <div className="card kpi">
              <div className="label">Payback Period</div>
              <div className="value num" style={{ color: '#0F766E', margin: '4px 0 6px' }}>
                14<small> Months</small>
              </div>
              <div className="foot" style={{ fontSize: '12px', color: '#64748B' }}>
                Equipment cost fully recovered in just over 1 year
              </div>
            </div>
          </section>

          {/* 6-Month Cost Comparison Graph */}
          <section className="card">
            <h2 style={{ fontSize: '16px', margin: '0 0 4px 0' }}>Monthly Power Costs: Generator vs Solar + Battery</h2>
            <Bars rows={chartRows} height={210} />
            <div className="legend" style={{ marginTop: 10 }}>
              <span><i style={{ background: '#94a3b8' }} />Old Generator Fuel & Rental Invoices</span>
              <span><i style={{ background: 'var(--green)' }} />Clean Solar + Battery Operating Cost</span>
            </div>
          </section>

          {/* Fuel Price Protection & ESG Impact */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 14 }}>
            {/* Card 1: Fuel Price Spike Protection */}
            <div className="card" style={{ borderLeft: '4px solid #059669', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                    Fuel Price Protection
                  </span>

                </div>

                <div style={{ fontSize: '24px', fontWeight: 800, color: '#047857', margin: '6px 0 2px' }}>
                  +RM {fmt(Math.round(totals.avoidedL * (6.0 - dieselPrice)))} / mo
                </div>
                <div style={{ fontSize: '12px', color: '#64748B', marginBottom: 12 }}>
                  Additional savings if market diesel rises from RM {dieselPrice.toFixed(2)} to RM 6.00 / L
                </div>
              </div>

              <div style={{ background: '#F8FAFC', padding: '10px 12px', borderRadius: 8, border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>Current Savings</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>RM {fmt(Math.round(totals.totalRM))}/mo</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>At RM 6.00 / L</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#059669' }}>
                    RM {fmt(Math.round(totals.avoidedL * 6.0 + totals.rentalAvoided))}/mo (12 mo ROI)
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: ESG Impact */}
            <div className="card" style={{ borderLeft: '4px solid #2563EB', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                    Sustainability Impact
                  </span>

                </div>

                <div style={{ fontSize: '24px', fontWeight: 800, color: '#2563EB', margin: '6px 0 2px' }}>
                  -78% Emissions
                </div>
                <div style={{ fontSize: '12px', color: '#64748B', marginBottom: 12 }}>
                  Direct generator exhaust eliminated across all active sites
                </div>
              </div>

              <div style={{ background: '#F8FAFC', padding: '10px 12px', borderRadius: 8, border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>Site Carbon Intensity</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>4.1 kg/m² <span style={{ fontSize: '11px', color: '#059669', fontWeight: 600 }}>(-78% vs baseline)</span></div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>Green Standards</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>GBI Gold & MyCREST</div>
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
                <h2 style={{ margin: 0, fontSize: '16px' }}>Project Savings Overview</h2>
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
            <h2 style={{ fontSize: '16px', margin: '0 0 4px 0' }}>Battery Relocation Plan</h2>


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
                    <td style={{ padding: '10px 8px' }}>City of Elmina</td>
                    <td style={{ padding: '10px 8px' }}>Dec 2026 (Substation on-line)</td>
                    <td style={{ padding: '10px 8px', fontWeight: 600 }}>{FLEET_NEXT.elmina.next}</td>
                    <td style={{ padding: '10px 8px' }}>
                      {transfers.elmina.includes('Approved') ? (
                        <span className="tag ok">{transfers.elmina}</span>
                      ) : (
                        <button
                          onClick={() => handleApproveTransfer('elmina')}
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
                    <td style={{ padding: '10px 8px' }}>Serenia City</td>
                    <td style={{ padding: '10px 8px' }}>Aug 2027 (Compact sub on-line)</td>
                    <td style={{ padding: '10px 8px', fontWeight: 600 }}>{FLEET_NEXT.serenia.next}</td>
                    <td style={{ padding: '10px 8px' }}>
                      {transfers.serenia.includes('Approved') ? (
                        <span className="tag ok">{transfers.serenia}</span>
                      ) : (
                        <button
                          onClick={() => handleApproveTransfer('serenia')}
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
                    <td style={{ padding: '10px 8px' }}>Bandar Bukit Raja</td>
                    <td style={{ padding: '10px 8px' }}>Nov 2027 (Substation energized)</td>
                    <td style={{ padding: '10px 8px', fontWeight: 600 }}>{FLEET_NEXT.bukitraja.next}</td>
                    <td style={{ padding: '10px 8px' }}>
                      {transfers.bukitraja.includes('Approved') ? (
                        <span className="tag ok">{transfers.bukitraja}</span>
                      ) : (
                        <button
                          onClick={() => handleApproveTransfer('bukitraja')}
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
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {/* TAB 3: PRE-TENDER PROJECT CALCULATOR */}
      {activeTab === 'calculator' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Inputs */}
          <div className="card" style={{ padding: '16px 20px' }}>
            <h3 style={{ fontSize: '15px', margin: '0 0 14px 0', color: '#0F172A', fontWeight: 700 }}>
              Project Equipment & Duration
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
              <div style={{ background: '#F8FAFC', padding: '12px 14px', borderRadius: 8, border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>Tower Cranes</span>
                  <span style={{ fontSize: '14px', fontWeight: 800, color: '#0F766E' }}>{calcCranes}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="4"
                  value={calcCranes}
                  onChange={(e) => setCalcCranes(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#0F766E', cursor: 'pointer' }}
                />
              </div>

              <div style={{ background: '#F8FAFC', padding: '12px 14px', borderRadius: 8, border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>Passenger Hoists</span>
                  <span style={{ fontSize: '14px', fontWeight: 800, color: '#0F766E' }}>{calcHoists}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="4"
                  value={calcHoists}
                  onChange={(e) => setCalcHoists(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#0F766E', cursor: 'pointer' }}
                />
              </div>

              <div style={{ background: '#F8FAFC', padding: '12px 14px', borderRadius: 8, border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>Building Height</span>
                  <span style={{ fontSize: '14px', fontWeight: 800, color: '#0F766E' }}>{calcFloors} Floors</span>
                </div>
                <input
                  type="range"
                  min="12"
                  max="50"
                  value={calcFloors}
                  onChange={(e) => setCalcFloors(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#0F766E', cursor: 'pointer' }}
                />
              </div>

              <div style={{ background: '#F8FAFC', padding: '12px 14px', borderRadius: 8, border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>Duration</span>
                  <span style={{ fontSize: '14px', fontWeight: 800, color: '#0F766E' }}>{calcDuration} Months</span>
                </div>
                <input
                  type="range"
                  min="12"
                  max="36"
                  value={calcDuration}
                  onChange={(e) => setCalcDuration(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#0F766E', cursor: 'pointer' }}
                />
              </div>
            </div>
          </div>

          {/* Results */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
            <div className="card" style={{ padding: '16px', borderLeft: '4px solid #059669' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748B' }}>
                Recommended Setup
              </div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: '4px 0 2px' }}>
                {recBessSize}
              </div>
              <div style={{ fontSize: '13px', color: '#059669', fontWeight: 600 }}>
                + {recSolarKwp} Solar
              </div>
            </div>

            <div className="card" style={{ padding: '16px', borderLeft: '4px solid #059669', background: '#F0FDF4' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#065F46' }}>
                Total Estimated Savings
              </div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#047857', margin: '4px 0 2px' }}>
                RM {fmt(Math.round(estTotalSavingsRM))}
              </div>
              <div style={{ fontSize: '13px', color: '#065F46', fontWeight: 600 }}>
                {recPaybackMonths} Months Payback
              </div>
            </div>

            <div className="card" style={{ padding: '16px', borderLeft: '4px solid #0284C7' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748B' }}>
                Diesel Eliminated
              </div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', margin: '4px 0 2px' }}>
                {fmt(Math.round(estMonthlyFuelL * calcDuration))} Litres
              </div>
              <div style={{ fontSize: '13px', color: '#0284C7', fontWeight: 600 }}>
                RM {fmt(Math.round(estMonthlyFuelRM * calcDuration))} Saved
              </div>
            </div>
          </div>

          {/* Tender Clause */}
          <div className="card" style={{ padding: '16px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 10 }}>
              <h3 style={{ fontSize: '15px', margin: 0, color: '#0F172A', fontWeight: 700 }}>
                Contractor Tender Clause
              </h3>

              <button
                onClick={handleCopyClause}
                style={{
                  padding: '6px 14px',
                  backgroundColor: copiedClause ? '#059669' : '#0F172A',
                  color: '#FFFFFF',
                  borderRadius: 6,
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                {copiedClause ? '✓ Copied' : '📋 Copy Clause'}
              </button>
            </div>

            <div
              style={{
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: 8,
                padding: '14px 16px',
                fontSize: '13px',
                color: '#334155',
                lineHeight: 1.6,
              }}
            >
              "The Main Contractor shall deploy a Containerized Battery Energy Storage System (minimum <strong>{recBessSize}</strong>) with rooftop solar PV (minimum <strong>{recSolarKwp}</strong>) for primary site machinery. Continuous diesel generator operation is prohibited under DOE Schedule 6. Telemetry shall connect to Sime Darby Property's GreenPulse system."
            </div>
          </div>
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
