# Hackathon Build Instructions — Research Before Prototype

## Objective

Build a prototype only after validating the problem against Sime Darby Property's existing systems and workflows.

The prototype should demonstrate a believable business decision, not simply a collection of dashboards.

---

# 1. Research sequence

Follow this order:

### Step 1
Understand the official hackathon brief.

### Step 2
Understand Sime Darby Property's existing sustainability and energy capabilities.

### Step 3
Study uploaded Inta Bina / BESS / solar materials.

### Step 4
Explore IESS Cloud.

### Step 5
Compare existing platforms and commercial EMS/BESS products.

### Step 6
Identify the actual gap.

### Step 7
Define one high-value user decision.

### Step 8
Build the smallest prototype that proves that decision.

---

# 2. The prototype must prove one complete loop

```text
Energy data
    ↓
Forecast
    ↓
Detect opportunity/problem
    ↓
Generate recommendation
    ↓
Explain recommendation
    ↓
Calculate impact
    ↓
Allow user to simulate / approve decision
```

Do not build ten disconnected features.

One convincing end-to-end workflow is better.

---

# 3. Example prototype scenario

Use simulated data if approved real data is unavailable.

Scenario:

A township has:
- Solar PV
- BESS
- Smart meter
- Grid connection
- Building loads

The platform predicts:
- Solar surplus at midday
- Evening demand peak
- BESS has insufficient SOC for the evening peak

The system recommends:
- Charge BESS during solar surplus
- Discharge during evening peak

The interface then shows:

### Before
- Grid consumption
- Peak demand
- Energy cost
- Carbon

### Recommended strategy
- Charge window
- Discharge window
- Expected energy shift

### After
- Projected RM savings
- Projected kWh shifted
- Projected CO2 avoided
- Projected peak reduction

---

# 4. Prototype screens

Recommended screens:

1. Executive / Township Overview
2. Energy Forecast
3. AI Recommendation
4. Recommendation Detail / Why?
5. What-If Simulation
6. Sustainability / Financial Impact

Avoid unnecessary pages.

---

# 5. UI principles

The interface should feel like a professional enterprise energy platform.

Prioritise:
- Clear hierarchy
- Decision-focused information
- Minimal clutter
- Strong charts
- Clear before/after comparison
- Actionable alerts
- Explainable recommendations

Avoid:
- Excessive gradients
- Generic AI chatbot UI
- Fake futuristic graphics
- Too many cards
- Unnecessary animations
- Generic ESG visuals

---

# 6. Technical prototype

Suggested architecture:

```text
Frontend
React / Next.js / TypeScript

        ↓

Backend / API
Node.js / Python

        ↓

Energy Intelligence
Forecasting
Optimisation
Recommendation Engine

        ↓

Database
PostgreSQL

        ↓

Simulated / integrated energy data
```

Use whatever stack the team can implement reliably.

Do not choose technology merely because it sounds advanced.

---

# 7. AI implementation

Minimum credible AI approach:

### Forecasting
Use:
- historical energy patterns
- time-of-day
- day-of-week
- weather / solar assumptions

### Optimisation
Use an optimisation algorithm to determine a reasonable charge/discharge schedule.

### LLM
Use the LLM only to explain the numerical recommendation.

The LLM should NOT invent energy savings.

All RM, kWh and carbon values should come from deterministic calculations or validated models.

---

# 8. Validation questions for Sime Darby Property

Ask stakeholders:

1. How does SDP currently move from energy-monitoring data to operational decisions?
2. Can current systems recommend actions, or mainly monitor/report?
3. Are solar, BESS, EV and building loads analysed together?
4. Who decides which sustainability intervention to prioritise?
5. Can SDP calculate financial impact before investing?
6. Can SDP simulate additional solar/BESS/EV capacity?
7. How granular is the current energy data?
8. How are energy-saving initiatives evaluated after implementation?
9. Is there portfolio-level comparison across townships?
10. What is the biggest pain point: data collection, analysis, decision-making, implementation or reporting?
11. What information is missing from current energy/BESS platforms?
12. What tasks are still done manually?
13. What decisions require spreadsheets?
14. Which decisions are currently based on historical data instead of forecasts?
15. Which energy decision has the highest financial consequence?

---

# 9. Competitor rule

Existing products already cover many individual capabilities.

Examples:
- SolisCloud
- Schneider EcoStruxure
- Honeywell energy / BMS platforms
- Commercial EMS products
- BESS optimisation platforms

Therefore:

DO NOT pitch:

> "AI energy management."

That is too generic.

Instead prove:

> A specific SDP decision problem that existing tools do not adequately solve.

---

# 10. Go / No-Go gate

Before serious development, complete this sentence:

> Sime Darby Property currently __________.
>
> This causes __________.
>
> Existing system __________ already solves __________.
>
> However, it does not adequately solve __________.
>
> Our solution __________ enables __________.
>
> This creates __________ in financial, operational and sustainability value.

If the team cannot fill this with evidence, return to research.

---

# 11. Final project principle

The product should make the judge think:

> "SDP already has data and energy systems. This prototype shows us how to make better decisions with them."

Not:

> "This is another dashboard."

Not:

> "This is just ChatGPT with energy data."

Not:

> "This replaces the BESS platform."

The strongest product is the decision layer between existing infrastructure/data and management action.
