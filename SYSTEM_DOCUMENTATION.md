# GreenPulse: Zero-Genset Site Energy Operating System (SiteOS)
**Sime Darby Property University Hackathon 2026 (Planet Track)**

---

## 1. Executive Summary
**GreenPulse** is Malaysia's first **Zero-Genset Site Energy Operating System (SiteOS)** for sustainable township construction. It eliminates disposable, rented 300 to 500 kVA diesel generators on off-grid construction sites by combining:
1. **On-Site Clean Hardware:** Containerized Battery Energy Storage Systems (BESS 261 to 522 kWh) paired with 150 to 300 kWp temporary rooftop solar PV.
2. **Predictive Energy & Surge Orchestration:** Real-time motor startup inrush dampening (absorbing 94 kW crane kicks in 3.8 ms) and weather-predictive load shifting (SolarCast ML).
3. **Statutory ESG & Acoustic Governance:** Automated Department of Environment (DOE Schedule 6) noise compliance auditing (EchoShield AI), water and concrete wash management, and circular formwork tracking.
4. **10-Year Master Township Fleet Redeployment:** Rolling relocatable BESS containers across sequential township development parcels, unlocking RM 9.84 Million in cumulative value with a 14.2-month payback.

---

## 2. The Validated Problem on Active Construction Sites

### A. The Temporary TNB Utility Delay
Permanent Tenaga Nasional Berhad (TNB) electrical substations take 9 to 18 months to commission. Construction framing must commence immediately, forcing greenfield parcels in City of Elmina, Bandar Bukit Raja, and Putra Heights into temporary off-grid power for 12 to 24 months.

### B. Commercial Fuel Shock Post-Subsidy Rationalisation
Commercial construction equipment is strictly excluded from BUDI Madani diesel subsidies (RM 2.10/L). Contractors purchase commercial Euro 5 diesel at **RM 5.17 / litre**, burning 10,000 to 14,000 litres per month (over RM 65,000/month per site in fuel alone).

### C. The Equipment Rental Trap & Crane Inrush
A 50-tonne tower crane hoisting a 2.5-tonne wet concrete bucket draws a momentary inductive surge of 3x to 5x its nominal rating (94 kW for 1.8 seconds). To avoid breaker trips on weak connections, contractors rent oversized 300 to 500 kVA generators at **RM 15,000 to RM 35,000 / month**, which idle at 20% to 30% load for 70% of the day.

### D. The Regulatory & Social Threat
Continuous 82 dBA generator noise triggers residential complaints in multi-phase developments, risking Department of Environment (DOE) Stop-Work Orders under statutory Environmental Noise Limits (Schedule 6: 60 dBA Day, 45 dBA Night).

---

## 3. System Architecture & The 3 Enterprise Roles

To eliminate interface clutter and prevent cognitive overload for non-software construction personnel, GreenPulse organizes every role into **dedicated, focused sidebar tabs**:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ GREENPULSE SITE OPERATING SYSTEM (SiteOS)                                              │
├────────────────────────┬───────────────────────────────┬───────────────────────────────┤
│ ROLE 1: M&E MANAGER    │ ROLE 2: ENVIRONMENTAL OFFICER │ ROLE 3: HQ FINANCE DIRECTOR   │
│ (Site Operations)      │ (Statutory Governance)        │ (Township Portfolio Asset)    │
├────────────────────────┼───────────────────────────────┼───────────────────────────────┤
│ Tab 1: Battery & Flow  │ Tab 1: Boundary Sound & DOE   │ Tab 1: P&L & Fuel Ticker      │
│ Tab 2: Crane Buffer    │ Tab 2: EchoShield AI Filter   │ Tab 2: Pre-Tender Calculator  │
│ Tab 3: Weather & Plan  │ Tab 3: Water & Concrete Wash  │ Tab 3: Bursa CSI Disclosure   │
│ Tab 4: Worker CLQ      │ Tab 4: Circular Formwork      │ Tab 4: Portfolio Ledger       │
│                        │ [Export Monthly EMP Report]   │ Tab 5: 10-Yr Fleet Roadmap    │
└────────────────────────┴───────────────────────────────┴───────────────────────────────┘
```

---

## 4. Role 1: Site M&E Power Command (`/me`)
* **Target User:** Mechanical & Electrical Engineer / Site Power Manager on site.
* **Tab 1: Battery & Power Flow (⚡):**
  * Live Single-Line Diagram: Solar Inflow (+84 kW), BESS Discharge (-100 kW), Stored Energy (88% SoC), Standby Genset (100% OFF).
  * **Active Field Control:** Generator ATS Dry-Contact Interlock button (toggles physical lockout relay to prohibit engine cranking during residential quiet hours).
  * **TNB Midnight Pre-Charge Target Slider:** Sets overnight off-peak grid charging target (70% to 100% at RM 0.28/kWh).
* **Tab 2: Heavy Machinery & Crane Buffer (🏗️):**
  * SurgeGuard Inrush Buffer: Tracks sub-millisecond (3.8 ms) absorption of 94 kW crane motor start kick with +106 kW headroom (< 1.2% voltage deviation).
  * Live Circuit Breakdown: Tower Crane (45 kW), Passenger Hoist (28 kW), Site Office (12 kW), EV Forklifts (15 kW).
  * **Active Circuit Connection Modal (`[ + Connect Machine Circuit ]`):** Allows site engineers to register new subcontractor machines with breaker ratings and shedding priorities (P0 Critical, P1 Standard, P2 Sheddable).
* **Tab 3: Weather Shift & Hourly Plan (🌧️):**
  * Simulated Time-of-Day Slider (00:00 to 23:00) paired with MET Malaysia Doppler radar tracking.
  * SolarCast ML irradiance curve holding 65% battery reserve ahead of 14:00 convective storm windows.
* **Tab 4: Worker CLQ Microgrid (Act 446) (🏠):**
  * Solves off-grid Centralised Labour Quarters living conditions (100–300 workers) at Inta Bina Rimbayu CLQ.
  * Guarantees 24/7 fan ventilation and lighting, eliminating midnight generator shutoffs and electrical fire hazards.
  * **Statutory Act 446 Audit Button:** Generates digital verification certificate for Department of Labour (JTK) inspections.

---

## 5. Role 2: Environmental & Safety Shield (`/eo`)
* **Target User:** CIDB-Registered Environmental Officer (EO) and Safety & Health Officer.
* **Tab 1: Boundary Sound & DOE Limits (🔊):**
  * Live West Boundary Sound Meter: 54.1 dBA (safely below DOE Schedule 6 limit of 60 dBA Day / 45 dBA Night).
  * Acoustic Attenuation Benchmark: -27.9 dBA noise drop (88% perceived loudness reduction) vs baseline 82 dBA genset.
  * **Active Threshold Calibration & SMS Dispatch:** Slider adjusts early warning threshold (50 to 60 dBA); 1-click button dispatches automated warning SMS to site foreman.
* **Tab 2: EchoShield False-Alarm Filter (🛡️):**
  * Edge ML Acoustic Source Separation: Decomposes 71.4 dBA boundary sound spikes, proving 78% of acoustic energy was an external 16-tonne diesel dump truck on the public road while true site noise remained 54.1 dBA. Filters false DOE stop-work notices.
  * Community Feedback & Inquiry Log (EMP Section 8) with interactive submission form.
* **Tab 3: Water, Silt & Concrete Wash (🌊):**
  * ESCP Sediment Basin Turbidity: 18 NTU (safely below 50 NTU Class IIB JPS limit).
  * Concrete Washout Neutralization: Monitors ready-mix chute wash bay pH at 7.4 neutral.
* **Tab 4: Circular Timber & Concrete (♻️):**
  * 4-Stage Timber Formwork Lifecycle: Tracks formwork across 4 passes (structural beams -> carpark floor protection -> worker bedframes -> woodchip recycling).
  * **Active Circular Transfer Ledger & Modal (`[ + Record Material Transfer ]`):** Logs daily formwork and scrap concrete diversions, calculating real-time avoided RORO bin disposal fees.
* **Header Quick-Action:** 1-Click modal generating official, printable Monthly DOE Environmental Management Plan (EMP) summary for Jabatan Alam Sekitar.

---

## 6. Role 3: HQ Finance & Township Moat (`/hq`)
* **Target User:** Chief Financial Officer, Township Project Directors, and Sustainability Leads at Sime Darby Property HQ.
* **Tab 1: Executive P&L & Fuel Ticker (💰):**
  * Live Gazetted Commercial Diesel Ticker (**RM 5.17 / L** Euro 5) with sensitivity testing slider (testing RM 5.80 / L).
  * Dual Cash Savings Scorecard: **RM 125,128 / month saved per parcel** (RM 95,128 fuel + RM 30,000 cancelled rental).
  * 6-Month Comparison Bar Chart: RM 750,768 in net cash saved during the structural framing phase.
* **Tab 2: Pre-Tender Sizing Calculator (🧮):**
  * Interactive engineering sliders: Tower Cranes (1 to 4), Passenger Hoists, Floors, and Off-Grid Duration.
  * Calculates recommended BESS and solar sizing, payback months, and provides a 1-click **`[ Copy Clause for Tender ]`** button for green procurement specifications.
* **Tab 3: Bursa Malaysia CSI Disclosure (📋):**
  * Construction Sustainability Index (CSI) table: Carbon intensity of **4.12 kg CO2e / m² CFA** vs 18.40 baseline (-77.6% Scope 1 decarbonization), formatted for the Annual Integrated Report.
* **Tab 4: Multi-Site Portfolio Ledger (🗺️):**
  * Consolidated multi-site tracking across Putra Heights P196, Melati, and Rimbayu CLQ.
  * **Commission New Site Modal (`[ + Commission Project Site ]`):** Registers new township developments (e.g. Elmina Ridge, Bandar Bukit Raja) that dynamically propagate across all site engineer apps.
* **Tab 5: 10-Year Township Fleet Roadmap (🚚):**
  * Centralized developer asset rollover model: Container BESS moves sequentially from Putra Heights (Month 1-24) to Elmina West (Month 25-48) to Bandar Bukit Raja (Month 49-78).
  * **Interactive Transfer Approvals:** Executive action buttons to authorize asset relocations.
  * Financial Outcome: Full capital payback in **14.2 months** and **RM 9.84 Million** in cumulative 10-year township value.

---

## 7. The 3-Tier AI Engine Summary

| AI Tier | Technology | Concrete Problem Solved |
| :--- | :--- | :--- |
| **Tier 1: SolarCast ML** | Physics-informed LSTM + MET Malaysia radar | Predicts afternoon cloud cliffs, pre-charging BESS to 65% SoC before storm windows. |
| **Tier 2: DispatchOpt MPC** | Model Predictive Control (MILP) | Absorbs 94 kW inductive crane kicks in 3.8ms, preventing breaker trips and diesel auto-starts. |
| **Tier 3: EchoShield AI** | Edge acoustic source separation | Distinguishes 54.1 dBA site noise from 71.4 dBA external road traffic, filtering false DOE violations. |
| **Tier 4: SiteOps Copilot** | Role-conditioned Generative AI | Natural language simulation for crane headroom, DOE EMP justification text, and Bursa ESG disclosures. |

---

## 8. Verified Malaysian Data Grounding

* **Commercial Diesel Rate:** RM 5.17 / L (Euro 5) and RM 5.37 / L (B7) gazetted weekly benchmark.
* **Diesel Density & Factor:** 2.68 kg CO2e / litre diesel combustion (IPCC / UK DEFRA).
* **Generator Rental Baseline:** RM 15,000 (300 kVA) to RM 30,000 (500 kVA) per month (Antbuildz / Genset Rental Malaysia market rates).
* **DOE Noise Limit:** 60 dBA daytime residential boundary limit ($L_{90}$) under DOE Environmental Noise Planning Guidelines (Schedule 6).
* **Construction Carbon Intensity:** 4.12 kg CO2e / m² Construction Floor Area (CFA) with GreenPulse vs 18.40 kg baseline.
