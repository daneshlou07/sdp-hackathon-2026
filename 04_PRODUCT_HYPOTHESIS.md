# Proposed Product — Energy Decision Intelligence Layer

## Status

IMPORTANT:

This is a PRODUCT HYPOTHESIS, not a confirmed Sime Darby Property requirement.

Do not describe this as an official SDP system or confirmed SDP pain point until validated.

---

# 1. Core concept

### Working name

Township Energy Intelligence Platform

Alternative names can be explored later.

### One-sentence concept

> A township-scale energy decision-intelligence layer that turns existing energy and sustainability data into predictive, prioritised actions and links each action to financial, energy and carbon outcomes.

---

# 2. Core principle

We are NOT building the energy infrastructure.

We are NOT replacing:
- Solar inverter platforms
- IESS Cloud
- BESS EMS
- Smart meters
- BMS
- ESG reporting systems

We are building the intelligence layer above existing systems.

Concept:

```text
Solar
BESS
Smart meters
EV
Grid
Building loads
Existing platforms
        ↓
Data Integration
        ↓
Energy Intelligence
        ↓
Forecasting
Anomaly Detection
Optimisation
Recommendations
Scenario Simulation
        ↓
Business Impact
RM Saved
kWh Shifted
CO2 Avoided
Peak Demand Reduced
Renewable Utilisation
```

---

# 3. Example decision

Suppose the system predicts:

- High solar generation from 12 PM–3 PM
- High building demand from 6 PM–9 PM
- BESS SOC is 42%
- Evening peak demand is likely to be expensive

The system could recommend:

> Charge the BESS during the predicted solar surplus and discharge during the evening peak.

The important part is not the recommendation alone.

The system should explain:

- Why this action is recommended
- When it should happen
- Expected energy impact
- Expected RM impact
- Expected carbon impact
- Expected peak-demand impact

---

# 4. User journey

```text
Manager opens platform
        ↓
Sees township energy health
        ↓
System forecasts tomorrow
        ↓
System detects opportunity
        ↓
AI explains recommendation
        ↓
Manager sees projected impact
        ↓
Manager can run a "What If?" simulation
        ↓
Manager makes a decision
```

---

# 5. Potential MVP

## Module 1 — Township Energy Overview

Show:
- Current consumption
- Renewable generation
- BESS SOC
- Grid consumption
- Energy cost
- Carbon
- Alerts
- Energy health score

## Module 2 — Forecast

Forecast:
- Load
- Solar generation
- BESS SOC
- Peak demand
- Energy cost

## Module 3 — AI Energy Recommendation

Example:

> Tomorrow's solar generation is expected to peak between 12 PM and 3 PM, while demand is expected to peak between 6 PM and 9 PM. Charging the BESS during the solar surplus and discharging during the evening peak could reduce grid consumption during the high-demand period.

Show projected:
- RM saved
- kWh shifted
- CO2 avoided
- Peak reduction
- Renewable utilisation

## Module 4 — What-If Simulation

Examples:
- Add 500 kWh BESS
- Add 100 kWp solar
- Increase EV demand by 30%
- Cloudy-weather scenario
- Higher energy tariff
- Lower battery availability

The output should quantify the consequence.

---

# 6. AI architecture

Do not use an LLM for everything.

### Machine learning / statistics
Use for:
- Demand forecasting
- Solar forecasting
- Anomaly detection
- Pattern detection

### Optimisation algorithm
Use for:
- BESS scheduling
- Peak shaving
- Load shifting
- Energy allocation

### LLM
Use for:
- Explaining recommendations
- Answering "why?"
- Summarising technical results
- Translating technical decisions into management language

Example:

User:
> Why did you recommend this?

AI:

> Solar output is expected to be high around midday while demand is expected to peak in the evening. The recommended schedule stores surplus renewable energy earlier and uses it later, reducing expected grid consumption during the peak period.

---

# 7. Potential data model

### Energy

```text
timestamp
site_id
load_kwh
grid_kwh
solar_kwh
battery_charge_kwh
battery_discharge_kwh
battery_soc
```

### Assets

```text
asset_id
asset_type
capacity
location
status
```

### Environment

```text
solar_irradiance
temperature
weather_condition
```

### Financial

```text
tariff
energy_price
demand_charge
diesel_price
```

### Carbon

```text
grid_emission_factor
diesel_emission_factor
```

---

# 8. Important data rule

If real SDP data is unavailable:

Use realistic SYNTHETIC DATA for the prototype.

Clearly label it as:

> Demonstration / simulated data based on realistic operating assumptions.

Never claim synthetic numbers are actual Sime Darby Property measurements.

---

# 9. KPIs

Potential metrics:

- RM saved
- kWh reduced
- kWh shifted
- Peak demand reduction
- CO2 avoided
- Diesel avoided
- Renewable utilisation
- BESS utilisation
- Solar self-consumption
- Energy cost reduction
- Payback
- ROI
- Forecast accuracy

Only display a KPI if the prototype has a defensible method for calculating it.

---

# 10. Main differentiation hypothesis

Do not compete on:

> "We have AI."

Compete on:

> "We connect existing energy data to decisions and quantify the business consequence of those decisions."

The product must demonstrate a clear transition:

```text
DATA
↓
INSIGHT
↓
RECOMMENDATION
↓
SIMULATED ACTION
↓
MEASURABLE IMPACT
```
