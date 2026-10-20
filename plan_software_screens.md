# GreenPulse: Software Prototype Plan (Final Verification)

## 1. The 3 Real Users and What They Do

| Role | Location | Real Malaysian Site Job | Screen They Access |
| :--- | :--- | :--- | :--- |
| **1. M&E Manager** | On-Site (Putra Heights & Melati) | Manages temporary power, crane and hoist electricity, genset fuel delivery, and daily site power reliability. | **Screen 1: M&E Power & Site Operations** (can switch between sites) |
| **2. Environmental Officer** | On-Site (CIDB registered) | Enforces DOE (Jabatan Alam Sekitar) regulations, logs boundary noise under Schedule 6, monitors smoke or spills, and prepares monthly EMP reports. | **Screen 2: DOE Compliance & Noise Monitoring** (can switch between sites) |
| **3. HQ Finance & Project Director** | HQ (Ara Damansara) | Reviews construction P&L, manages fuel budgets at un-subsidised commercial diesel rates, files Bursa ESG disclosures, and plans equipment relocation. | **Screen 3: HQ Finance, Bursa ESG & Asset Relocation** (all sites consolidated) |

---

## 2. Login Page Flow

* **URL / State:** `/login`
* **Clean layout:** Left panel with Sime Darby Property branding and GreenPulse tagline ("Zero-Genset Site Energy Intelligence"). Right panel with login card.
* **3 Fast-Click Demo Accounts:**
  * `[ 👷 Log in as M&E Manager ]`
  * `[ 🌱 Log in as Environmental Officer ]`
  * `[ 💼 Log in as HQ Finance Director ]`
* **Direct navigation:** Clicking any demo button logs the user in immediately to their dedicated screen without typing.
* **Account Switching Rule:** There is **no in-app account switcher** inside the top bar. To change user, the user must click **"Log Out"** in the sidebar, which returns them to the login page. This prevents accidental cross-role access and mirrors real enterprise security.

---

## 3. Visual Layout & Sidebar Design for Each User

GreenPulse uses an enterprise dashboard shell:
* **Sidebar (Left, 260px wide):** Dark Malaysian Slate (`#0F172A`), Sime Darby Red brand accents (`#D71920`), clean typography, role-specific nav items, real-time status pill, and a clear **Log Out** button at the bottom.
* **Header (Top, 64px high):** Project breadcrumb, current date and Malaysian time (`KL 08:30 AM`), active site indicator, and connection status (`4G Gateway Online`).
* **Main Canvas (Responsive Grid):** Clean slate background (`#F8FAFC`), white cards (`#FFFFFF`), subtle slate borders (`#E2E8F0`), high-contrast text, zero visual clutter.

---

### A. Screen 1: M&E Power & Site Operations (User: M&E Manager)

* **Core Focus:** The M&E Manager tracks two primary things:
  1. **BESS Charge & Discharge:** How much power is charging in from solar (+kW), how much is discharging out to the site (-kW), current stored energy (SoC % and kWh), and remaining runtime.
  2. **Equipment Power Distribution:** Exactly which machine is drawing electricity right now (Tower Crane, Hoist, Site Office, EV Chargers).
  3. **Generator State:** Confirming the backup diesel genset is 100% OFF (0 L fuel used).

#### Sidebar for M&E Manager:
```text
+------------------------------------+
| [SDP LOGO] GreenPulse              |
| SITE OPERATIONS                    |
+------------------------------------+
| SELECT ACTIVE SITE:                |
| (•) Inta Bina Putra Heights (261kWh)|
| ( ) Inta Bina Melati (522kWh)      |
+------------------------------------+
| NAVIGATION                         |
| [🔋] BESS Charge & Discharge Flow  |
| [🏗️] Equipment Power Distribution  |
| [🌧️] Rain Window & Weather Alert   |
| [⚠️] Crane Surge & Alerts (0)      |
+------------------------------------+
| LIVE TELEMETRY                     |
| Genset:    [ 🟢 OFF - 0 L/day ]    |
| BESS SoC:  [ 🔋 78% (203.5 kWh) ]  |
| Charge:    [ ⚡ +84.2 kW (In) ]    |
| Discharge: [ ⚡ -100.0 kW (Out) ]  |
+------------------------------------+
| USER ROLE                          |
| 👷 M&E Manager                     |
| [🚪 Log Out]                       |
+------------------------------------+
```

#### Visual Screen Layout for M&E Manager:
```text
+--------------------------------------------------------------------------------------------------------+
| TOP HEADER: Putra Heights Site 1 | Weather: 31°C (Rain Window: 2 PM - 4:30 PM) | 4G Online | [Log Out] |
+--------------------------------------------------------------------------------------------------------+
| ROW 1: 3 PRIMARY METRIC CARDS                                                                          |
| +-----------------------------------+ +--------------------------------+ +---------------------------+ |
| | 1. BESS CHARGE & DISCHARGE        | | 2. EQUIPMENT DISTRIBUTION      | | 3. DIESEL GENSET (BACKUP) | |
| | 78% SoC (203.5 / 261 kWh)         | | 100.0 kW Total Distributed     | | 🟢 100% OFF (STANDBY)     | |
| | • Charging (Solar In): +84.2 kW   | | • 4 Active Machinery Circuits  | | • Diesel Burnt Today: 0 L | |
| | • Discharging (Site Out):-100.0 kW| | • Peak Crane Surge: 94 kW      | | • Auto-start avoided: 100%| |
| | • Net Flow: -15.8 kW (6.4h left)  | | • Inverter Status: 32°C Optimal| | • Fuel Spillage Risk: 0   | |
| +-----------------------------------+ +--------------------------------+ +---------------------------+ |
+--------------------------------------------------------------------------------------------------------+
| ROW 2: DETAILED EQUIPMENT POWER DISTRIBUTION (WHERE THE POWER GOES)                                    |
| +----------------------------------------------------------------------------------------------------+ |
| | ACTIVE MACHINERY POWER DISTRIBUTION BREAKDOWN                                                      | |
| |                                                                                                    | |
| | 🏗️ 1. TOWER CRANE (Liebherr 85 EC-B)       45.0 kW  (45% of load)  [====================       ]   | |
| |    Status: Active concrete hoisting | Motor surge buffer: Absorbed 94 kW kick without voltage dip  | |
| |                                                                                                    | |
| | 🛗 2. PASSENGER & MATERIAL HOIST           28.0 kW  (28% of load)  [============               ]   | |
| |    Status: Ascending Level 14 | Smooth variable frequency drive power supply                       | |
| |                                                                                                    | |
| | 🏢 3. SITE OFFICE & WORKER CABINS          12.0 kW  (12% of load)  [=====                      ]   | |
| |    Status: Air conditioning, site computers, lighting, and testing instruments                     | |
| |                                                                                                    | |
| | 🚜 4. EV FORKLIFT CHARGING BAYS            15.0 kW  (15% of load)  [======                     ]   | |
| |    Status: 2x Hangcha EV electric forklifts charging on clean battery power                        | |
| +----------------------------------------------------------------------------------------------------+ |
+--------------------------------------------------------------------------------------------------------+
| ROW 3: DISPATCH INTELLIGENCE & WEATHER RAIN WINDOW                                                     |
| +--------------------------------------------------+ +-----------------------------------------------+ |
| | 🌧️ WEATHER & SOLAR CHARGING IMPACT               | | 💡 OPERATING RECOMMENDATION                   | |
| | • MET Malaysia: Afternoon storm at 2:00 PM.      | | • BESS reaches 95% charge by 1:15 PM.         | |
| | • Solar charge will pause during 2-4 PM rain.    | | • Battery buffer (6.4h) carries crane lifts   | |
| | • Battery storage has plenty of energy to cover. | |   all afternoon without starting generator.   | |
| +--------------------------------------------------+ +-----------------------------------------------+ |
+--------------------------------------------------------------------------------------------------------+
```

---

### B. Screen 2: DOE Compliance & Noise Monitoring (User: Environmental Officer)

#### Sidebar for Environmental Officer:
```text
+------------------------------------+
| [SDP LOGO] GreenPulse              |
| ENVIRONMENTAL COMPLIANCE           |
+------------------------------------+
| SELECT ACTIVE SITE:                |
| (•) Inta Bina Putra Heights (Parcel 1)|
| ( ) Inta Bina Melati (Parcel B)    |
+------------------------------------+
| NAVIGATION                         |
| [🔊] Boundary Noise (Schedule 6)   |
| [💨] Clean Air & Dark Smoke        |
| [📈] 30-Day Noise History          |
| [📄] Monthly EMP Reports           |
+------------------------------------+
| DOE COMPLIANCE STATUS              |
| Noise: [ 🟢 58.2 dBA (Limit: 60) ] |
| Smoke: [ 🟢 Ringlemann 0 ]         |
| Audit: [ 🟢 100% Compliant ]       |
+------------------------------------+
| USER ROLE                          |
| 🌱 Environmental Officer           |
| [🚪 Log Out]                       |
+------------------------------------+
```

#### Visual Screen Layout for Environmental Officer:
```text
+--------------------------------------------------------------------------------------------------------+
| TOP HEADER: Environmental Compliance | Site: Putra Heights | DOE Schedule 6 Regulated | [Log Out]      |
+--------------------------------------------------------------------------------------------------------+
| ROW 1: COMPLIANCE STATUS BANNER                                                                        |
| [ 🟢 100% DOE COMPLIANT - ZERO STOP-WORK NOTICES - ZERO NOISE EXCEEDANCES IN LAST 30 DAYS ]            |
+--------------------------------------------------------------------------------------------------------+
| ROW 2: 3 ACOUSTIC & AIR QUALITY CARDS                                                                  |
| +-----------------------------------+ +--------------------------------+ +---------------------------+ |
| | BOUNDARY NOISE (LIVE METER)       | | DIESEL GENSET VS BESS NOISE    | | CLEAN AIR & SMOKE REG.    | |
| | 58.2 dBA [🟢 UNDER LIMIT]         | | Baseline Genset: 82.0 dBA      | | Ringlemann Chart: 0       | |
| | Day Limit: 60 dBA L90 (Schedule 6)| | GreenPulse BESS: 54.1 dBA      | | Dark Smoke: 0 minutes     | |
| | Sensor: West Residential Boundary | | Net Reduction: -27.9 dBA (88%) | | Diesel Fuel Spills: 0 L   | |
| +-----------------------------------+ +--------------------------------+ +---------------------------+ |
+--------------------------------------------------------------------------------------------------------+
| ROW 3: SPLIT VIEW (2 COLUMNS)                                                                          |
| LEFT COLUMN (60%): 30-DAY NOISE HISTORY CHART        | RIGHT COLUMN (40%): 1-CLICK EMP REPORT EXPORT   |
| +--------------------------------------------------+ | +---------------------------------------------+ |
| | SOUND LEVEL TREND VS DOE SCHEDULE 6 LIMIT (dBA)  | | | 📄 MONTHLY DOE COMPLIANCE EXPORT            | |
| | 70 dBA | - - - - - - - - - - - - - - - - - - -   | | | Sime Darby Property EMP Monthly Log         | |
| | 60 dBA | ------------------------- (DOE LIMIT)   | | | Period: October 2026                        | |
| | 50 dBA | ~~~/\~~~~~~/\~~~~~/\~~~~~~~~~ (BESS AVG)| | | Noise Exceedance Events: 0                 | |
| | 40 dBA |_________________________________________| | | Diesel Genset Operating Hours: 0            | |
| |         Day 1         Day 15         Day 30      | | | Total Diesel Run Hours Eliminated: 720 hrs  | |
| |                                                  | | |                                             | |
| | Verified: Zero exceedances over 60 dBA L90.      | | | [ 📥 EXPORT MONTHLY DOE EMP SUMMARY (PDF) ] | |
| +--------------------------------------------------+ | +---------------------------------------------+ |
+--------------------------------------------------------------------------------------------------------+
```

---

### C. Screen 3: HQ Finance, Bursa ESG & Relocation (User: HQ Finance Director)

* **Financial Reality:** Contractors never buy gensets; they rent them (RM 15,000 to RM 35,000 / month per unit from suppliers like Antbuildz or UPR) and pay un-subsidised commercial diesel (RM 5.17 / L). GreenPulse eliminates **both** the fuel bill and the massive equipment rental fees.

#### Sidebar for HQ Finance Director:
```text
+------------------------------------+
| [SDP LOGO] GreenPulse              |
| HQ PORTFOLIO & FINANCE             |
+------------------------------------+
| SCOPE:                             |
| 🏢 All Sime Darby Property Sites   |
| (Putra Heights + Melati Portfolio) |
+------------------------------------+
| NAVIGATION                         |
| [💰] Cash Savings & Rental OpEx    |
| [🌿] Bursa Malaysia CSI Metrics    |
| [🔄] BESS Relocation Roadmap       |
| [⛽] Malaysian Diesel Price Ticker  |
+------------------------------------+
| PORTFOLIO TOTALS (MTD)             |
| Total Saved: [ 🟢 RM 125,128 ]     |
| Scope 1 GHG: [ 🌿 -49.3 t CO2e ]   |
+------------------------------------+
| USER ROLE                          |
| 💼 HQ Finance Director             |
| [🚪 Log Out]                       |
+------------------------------------+
```

#### Visual Screen Layout for HQ Finance Director:
```text
+--------------------------------------------------------------------------------------------------------+
| TOP HEADER: HQ Executive Financial & ESG Dashboard | Currency: MYR (RM) | Group View | [Log Out]       |
+--------------------------------------------------------------------------------------------------------+
| ROW 1: LIVE MALAYSIAN COMMERCIAL FUEL TICKER & RENTAL BENCHMARK                                        |
| +----------------------------------------------------------------------------------------------------+ |
| | ⛽ COMMERCIAL DIESEL (15 - 21 OCT 2026): Euro 5 = RM 5.17 / L | B7 = RM 5.37 / L                   | |
| | Note: Commercial construction excluded from BUDI Madani subsidy (RM 2.10/L). Savings computed @ RM 5.17 |
| | 🚜 GENSET RENTAL ELIMINATED: Saved RM 30,000 / month in cancelled 300 kVA monthly equipment rentals   |
| +----------------------------------------------------------------------------------------------------+ |
+--------------------------------------------------------------------------------------------------------+
| ROW 2: 4 FINANCIAL & ESG EXECUTIVE METRICS                                                             |
| +-------------------+ +--------------------+ +--------------------+ +--------------------------------+ |
| | DIESEL ELIMINATED | | TOTAL CASH SAVED   | | BURSA SCOPE 1 GHG  | | EQUIVALENT TREES PLANTED       | |
| | 18,400 Litres     | | RM 125,128 / mo    | | 49.3 Tonnes CO2e   | | 338 Mature Trees               | |
| | Fuel: RM 95,128   | | Fuel + Rental Saved| | Litres x 2.68 kg   | | Real IESS ESG formula          | |
| | Rental: RM 30,000 | | Rapid 14-mo Payback| | Zero black smoke   | | Official Forestry Conversion   | |
| +-------------------+ +--------------------+ +--------------------+ +--------------------------------+ |
+--------------------------------------------------------------------------------------------------------+
| ROW 3: SPLIT VIEW (2 COLUMNS)                                                                          |
| LEFT COLUMN (55%): 6-MONTH OPEX COMPARISON           | RIGHT COLUMN (45%): BURSA CSI METRICS TABLE    |
| +--------------------------------------------------+ | +---------------------------------------------+ |
| | MONTHLY SITE POWER OPEX (RM)                     | | | BURSA MALAYSIA SUSTAINABILITY DISCLOSURE   | |
| | RM 150k | [Fuel + Rental] [Fuel + Rental]        | | | • Metric: Construction Carbon Intensity     | |
| | RM 100k |                                        | | | • Baseline Diesel: 18.40 kg CO2e / m2 CFA   | |
| |  RM 25k |              [BESS OpEx]   [BESS OpEx] | | | • GreenPulse:      4.12 kg CO2e / m2 CFA   | |
| |    RM 0 |________________________________________| | | • Reduction:       -77.6% Decarbonization   | |
| |           May   Jun   Jul   Aug   Sep   Oct      | | | • Compliant with: Bursa Sustainability Guide| |
| +--------------------------------------------------+ | +---------------------------------------------+ |
+--------------------------------------------------------------------------------------------------------+
| ROW 4: BESS FLEET RELOCATION & TOWNSHIP LIFECYCLE ROADMAP                                              |
| +----------------------------------------------------------------------------------------------------+ |
| | UNIT       | CAPACITY | CURRENT PARCEL  | PROJECT STATUS | TNB CONNECTION | NEXT PLANNED PARCEL    | |
| | BESS-01    | 261 kWh  | Putra Heights   | Month 14 of 24 | Dec 2026       | Elmina West Parcel 3   | |
| | BESS-02    | 522 kWh  | Melati Parcel B | Month 8 of 30  | Aug 2027       | Bandar Bukit Raja Ph 2 | |
| | Insight: Modular containers redeploy across 3 to 4 sequential projects, achieving 14-month payback.| |
+--------------------------------------------------------------------------------------------------------+
```

---

## 4. Software Architecture & Implementation

* **Framework:** React + Vite (running on port 5173 / fast local dev).
* **Styling:** Premium Vanilla CSS.
  * Sime Darby Corporate Red: `#D71920`
  * Malaysian Slate Dark Header & Sidebar: `#0F172A`
  * Eco Emerald Success: `#0D9488`
  * Clean Card Background: `#FFFFFF` and `#F8FAFC`
  * High-contrast, zero-slop typographic hierarchy (Inter / system fonts, no weird AI gradients).
* **File Structure:**
  ```text
  prototype/
  ├── package.json
  ├── index.html
  ├── vite.config.js
  ├── src/
  │   ├── main.jsx
  │   ├── App.jsx
  │   ├── index.css
  │   ├── data/
  │   │   ├── accounts.js         # M&E Manager, Environmental Officer, HQ Finance
  │   │   ├── siteData.js         # Putra Heights & Melati live telemetries
  │   │   ├── doeLimits.js        # Schedule 6 dBA limits and historical noise
  │   │   └── fleetData.js        # BESS relocation schedule and Bursa ESG numbers
  │   ├── components/
  │   │   ├── Sidebar.jsx         # Role-specific sidebar with nav, site picker & logout
  │   │   ├── Header.jsx          # Breadcrumbs, live KL time, 4G Gateway status
  │   │   └── ModalExport.jsx     # Printable DOE EMP Compliance Report modal
  │   └── screens/
  │       ├── LoginPage.jsx       # 3 fast demo cards
  │       ├── Screen1MeOperations.jsx
  │       ├── Screen2EoCompliance.jsx
  │       └── Screen3HqFinance.jsx
  ```

---

## 5. Verification Checklist

1. **Build Validation:** Run `npm run build` with zero errors or bundle warnings.
2. **Lint Validation:** Code clean with zero syntax or unused variable warnings.
3. **Role Authentication Test:**
   * Log in as M&E Manager -> lands on Screen 1 (M&E Operations). Sidebar shows site switcher, power telemetry, and M&E Manager role.
   * Click "Log Out" -> returns cleanly to `/login`.
   * Log in as Environmental Officer -> lands on Screen 2 (DOE Compliance). Sidebar shows Schedule 6 noise navigation, 58.2 dBA status, and Environmental Officer role.
   * Click "Log Out" -> returns cleanly to `/login`.
   * Log in as HQ Finance Director -> lands on Screen 3 (HQ Finance & Relocation). Sidebar shows portfolio scope, fuel ticker, and HQ Finance Director role.
4. **Number Consistency:** All calculated numbers match formulas ($Litres \times RM\ 5.17 = RM\ Saved$; $Litres \times 2.68\ kg = CO_2e$).

