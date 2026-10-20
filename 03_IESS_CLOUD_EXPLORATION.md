# IESS Cloud — Mandatory System Exploration

## Purpose

IESS Cloud is an actual BESS web application that the project team has been given access to for investigation.

Website:
https://www.iesscloud.com

Credentials are intentionally NOT stored in this file.

Use the credentials supplied separately by the project owner. Never commit credentials to Git, source code, screenshots, documentation or generated files.

## Why this matters

Before designing an energy-management product, inspect what the existing BESS platform already does.

The goal is NOT to replace IESS Cloud.

The key question is:

> Where does existing BESS monitoring capability end, and where would an intelligent multi-asset Energy Management / Energy Orchestration system begin?

---

# 1. Explore the system systematically

Inspect the application and document:

### Dashboard
- What is shown immediately?
- What KPIs are visible?
- What is the current BESS status?
- Is energy flow visible?
- Is state of charge visible?
- Are historical trends available?

### BESS information
Look for:
- State of Charge (SOC)
- Battery voltage
- Battery current
- Battery power
- Charge/discharge power
- Energy capacity
- Available capacity
- Temperature
- Cell information
- Battery health
- Cycle information
- Operating status

### Energy flow
Check whether the system shows:
- Solar → battery
- Solar → load
- Grid → load
- Battery → load
- Grid → battery
- Generator → load
- Other energy flows

### Historical data
Check:
- Time ranges
- Charts
- Export/download options
- Aggregation levels
- Daily/monthly trends
- Comparison functions

### Alarms and faults
Check:
- Active alarms
- Historical alarms
- Severity
- Root-cause information
- Notifications
- Recommended action
- Alarm acknowledgement

### Control capability
Determine whether the platform:
- Only monitors
- Allows manual control
- Allows charge/discharge configuration
- Supports operating schedules
- Provides optimisation
- Provides automated control
- Provides recommendations

Do NOT assume control exists or does not exist. Verify it.

### Multi-site / multi-asset capability
Check whether the platform can:
- Manage multiple BESS units
- Compare sites
- Compare assets
- Aggregate energy data
- Provide portfolio-level insights

### Reporting
Check:
- Energy reports
- Performance reports
- Financial information
- Carbon information
- Automated reports
- Export functions

---

# 2. Document weaknesses carefully

If information is missing, determine WHY.

Possible categories:

1. UI / visualisation issue
2. Data exists but is not displayed
3. Sensor / instrumentation limitation
4. Integration limitation
5. Backend limitation
6. User-permission limitation
7. Data-quality issue
8. Actual missing feature

Do not automatically interpret "not displayed" as "not available".

The project owner has specifically stated that some information is currently not properly displayed and is being fixed.

Therefore distinguish:

> temporarily broken display

from

> permanent product capability gap.

---

# 3. Compare IESS Cloud with the proposed product

Create a comparison with:

| Capability | IESS Cloud | Proposed Platform |
|---|---|---|
| BESS monitoring | **Yes** (Detailed BMS/PCS metrics) | Yes, via integration |
| SOC monitoring | **Yes** | Yes |
| Historical trends | **Yes** (Daily, 31-day, 12-month) | Yes |
| BESS alarms | **Yes** | Possibly |
| BESS control | **Basic** (Demand Control disabled) | Not necessarily |
| Solar monitoring | **No** (BESS-focused) | Via integration |
| Smart-meter data | **No** | Via integration |
| Cross-asset analysis | **No** | Core hypothesis |
| Demand forecasting | **No** | Core hypothesis |
| Solar forecasting | **No** | Core hypothesis |
| Energy optimisation | **No** | Core hypothesis |
| Portfolio comparison | **Yes** (Multi-site overview) | Potential feature |
| What-if simulation | **No** | Potential feature |
| Financial impact | **Basic** (Static Revenue calc) | Core hypothesis |
| Carbon impact | **No** | Core hypothesis |
| Management recommendations | **No** | Core hypothesis |

The table must be updated after actual inspection.

---

# 4. Do not build a clone

Do NOT build:

> "A prettier IESS Cloud."

Do NOT build:

> "IESS Cloud but with AI chatbot."

The differentiator should come from solving a higher-level decision problem.

Potential direction:

IESS Cloud
→ tells operators what the BESS is doing.

Proposed intelligence layer
→ combines BESS + solar + smart meters + EV + load + tariffs + sustainability data and helps decision-makers understand what should happen next and why.

This is only a hypothesis until validated.

---

# 5. Questions to answer after exploration

1. What does IESS Cloud already solve extremely well?
   **Real-time monitoring of BESS hardware telemetry (PCS, BMS), tracking SOC, current, voltage, and historical charge/discharge data.**
2. What information does it expose?
   **Device status, alarms, energy flow from BESS perspective, historical trends (days/months), and a basic "Revenue" calculation.**
3. What information does it not expose?
   **Solar generation forecasting, building load demand curves, and carbon impact metrics.**
4. What decisions can a user make from it?
   **Whether the battery is healthy, whether it charged/discharged successfully yesterday, and if there are hardware faults needing O&M.**
5. What decisions still require manual analysis?
   **Determining the optimal time to charge/discharge tomorrow based on predicted weather (solar) and predicted building load.**
6. Does it forecast future energy conditions?
   **No. It is entirely retrospective and real-time.**
7. Does it optimise across multiple energy assets?
   **No. It monitors BESS silos.**
8. Does it calculate RM impact?
   **Yes, but statically based on past actions, not simulating future strategies.**
9. Does it calculate carbon impact?
   **No.**
10. Does it simulate future investments?
   **No.**
11. Does it compare multiple sites?
   **Yes, it has a Multi-Site Overview and Revenue Ranking.**
12. Does it combine BESS data with solar, EV and building-load data?
   **No. It focuses exclusively on BESS operation.**
13. Is it an operational BESS tool or a broader energy-management system?
   **It is strictly an operational tool for managing BESS hardware.**

The final product should emerge from the answers, not from assumptions.

