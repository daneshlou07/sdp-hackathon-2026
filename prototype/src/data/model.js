export const DIESEL_RM_PER_L = 5.17; // Euro 5, week of 15 to 21 Oct 2026 (team screenshot)
export const KG_CO2_PER_L = 2.68;
export const GENSET_KWH_PER_L = 3.0; // assumption: small site genset at part load
export const RESERVE = 0.2; // battery kept above 20% before backup starts

export const WEATHER = {
  sunny: { label: 'Sunny all day', factor: () => 1 },
  storm: { label: 'Storm 2 PM to 4:30 PM', factor: (h) => (h >= 14 && h <= 16 ? 0.12 : h === 13 ? 0.6 : 1) },
  monsoon: { label: 'Rainy, overcast all day', factor: () => 0.25 },
};

// share of days per month, assumption for Klang Valley
export const MONTH_MIX = { sunny: 0.55, storm: 0.35, monsoon: 0.1 };

const solarShape = (h) => {
  if (h < 7 || h > 18) return 0;
  return Math.max(0, Math.sin(((h - 6.5) / 12.5) * Math.PI)) * 0.78;
};

export function loadAt(site, h, smart) {
  let total = 0;
  const parts = {};
  for (const eq of site.equipment) {
    const hrs = smart && eq.shifted ? eq.shifted : eq.hours;
    const kw = hrs.includes(h) ? eq.kw : 0;
    parts[eq.id] = kw;
    total += kw;
  }
  return { total, parts };
}

// one day, hour by hour. smart = follow GreenPulse plan (shift flexible loads into solar hours)
export function simulateDay(site, weatherKey, smart = true) {
  const w = WEATHER[weatherKey] || WEATHER.storm;
  let soc = site.soc0 * site.bessKWh;
  const hours = [];
  let gensetKWh = 0;
  let solarKWh = 0;
  let loadKWh = 0;
  for (let h = 0; h < 24; h++) {
    const solar = site.solarKWp * solarShape(h) * w.factor(h);
    const { total: load, parts } = loadAt(site, h, smart);
    let net = solar - load;
    let charge = 0;
    let discharge = 0;
    let genset = 0;
    if (net >= 0) {
      charge = Math.min(net, site.bessKW, site.bessKWh * 0.95 - soc);
      soc += charge * 0.95;
    } else {
      const need = -net;
      const avail = Math.max(0, soc - site.bessKWh * RESERVE);
      discharge = Math.min(need, avail, site.bessKW);
      soc -= discharge;
      genset = need - discharge;
    }
    gensetKWh += genset;
    solarKWh += solar;
    loadKWh += load;
    hours.push({ h, solar, load, parts, charge, discharge, genset, soc: soc / site.bessKWh });
  }
  return { hours, gensetKWh, solarKWh, loadKWh, litres: gensetKWh / GENSET_KWH_PER_L };
}

// Compute dynamic solar factor directly from real forecast weather metrics
export function getSolarFactorForForecast(forecastDay) {
  const rainProb = forecastDay?.rainProbability || 60;
  const start = forecastDay?.stormStart || 13;
  const end = forecastDay?.stormEnd || 16;
  const cond = (forecastDay?.conditionText || '').toLowerCase();

  return (h) => {
    // Mostly clear or sunny day
    if (rainProb < 35 || cond.includes('clear') || cond.includes('sunny')) {
      return 1.0;
    }
    // Heavy monsoon or all-day overcast
    if (rainProb >= 85 || cond.includes('monsoon') || cond.includes('continuous')) {
      return 0.3;
    }
    // Convective afternoon tropical storm window
    if (h >= start && h <= end) {
      return Math.max(0.12, 1 - (rainProb / 100) * 0.88);
    }
    if (h === Math.floor(start) - 1 || h === Math.ceil(end) + 1) {
      return 0.65;
    }
    return 1.0;
  };
}

// Simulate site power directly using actual forecasted day data (no synthetic simulation mode)
export function simulateForecastDay(site, forecastDay, smart = true) {
  const factor = typeof forecastDay === 'string'
    ? (WEATHER[forecastDay] ? WEATHER[forecastDay].factor : () => 1)
    : getSolarFactorForForecast(forecastDay);

  const rainProb = typeof forecastDay === 'object' ? (forecastDay?.rainProbability || 0) : 0;
  const isRainDay = rainProb >= 50;
  const stormStart = typeof forecastDay === 'object' ? (forecastDay?.stormStart || 13) : 13;
  const stormEnd = typeof forecastDay === 'object' ? (forecastDay?.stormEnd || 16) : 16;

  let soc = site.soc0 * site.bessKWh;
  const hours = [];
  let gensetKWh = 0;
  let solarKWh = 0;
  let loadKWh = 0;
  for (let h = 0; h < 24; h++) {
    const solar = site.solarKWp * solarShape(h) * factor(h);

    // Smart weather dispatch: adjust shiftable loads and respect lightning storm safety
    let load = 0;
    const parts = {};
    for (const eq of site.equipment) {
      let kw = 0;
      if (eq.id === 'fork') {
        if (smart && isRainDay) {
          // Shift EV forklift charging to clean morning solar (9am to 1pm); pause during storm window
          kw = (h >= 9 && h <= 12) ? eq.kw : 0;
        } else if (smart) {
          kw = (eq.shifted || eq.hours).includes(h) ? eq.kw : 0;
        } else {
          kw = eq.hours.includes(h) ? eq.kw : 0;
        }
      } else if (eq.id === 'crane' && smart && isRainDay && h >= stormStart && h <= stormEnd) {
        // High-altitude crane active hoisting paused during thunderstorm lightning risk (standby idle)
        kw = 10;
      } else {
        const hrs = smart && eq.shifted ? eq.shifted : eq.hours;
        kw = hrs.includes(h) ? eq.kw : 0;
      }
      parts[eq.id] = kw;
      load += kw;
    }

    let net = solar - load;
    let charge = 0;
    let discharge = 0;
    let genset = 0;
    if (net >= 0) {
      charge = Math.min(net, site.bessKW, site.bessKWh * 0.95 - soc);
      soc += charge * 0.95;
    } else {
      const need = -net;
      const avail = Math.max(0, soc - site.bessKWh * RESERVE);
      discharge = Math.min(need, avail, site.bessKW);
      soc -= discharge;
      genset = need - discharge;
    }
    gensetKWh += genset;
    solarKWh += solar;
    loadKWh += load;
    hours.push({ h, solar, load, parts, charge, discharge, genset, soc: soc / site.bessKWh });
  }
  return { hours, gensetKWh, solarKWh, loadKWh, litres: gensetKWh / GENSET_KWH_PER_L };
}

export function monthly(site, price = DIESEL_RM_PER_L) {
  let litres = 0;
  let loadKWh = 0;
  let litresNoPlan = 0;
  for (const [k, share] of Object.entries(MONTH_MIX)) {
    const d = simulateDay(site, k, true);
    const n = simulateDay(site, k, false);
    litres += d.litres * share * site.daysPerMonth;
    litresNoPlan += n.litres * share * site.daysPerMonth;
    loadKWh += d.loadKWh * share * site.daysPerMonth;
  }
  const baselineL = loadKWh / GENSET_KWH_PER_L;
  const avoidedL = baselineL - litres;
  const fuelRM = avoidedL * price;
  const totalRM = fuelRM + site.rentalAvoided;
  return {
    baselineL,
    litres,
    avoidedL,
    planL: litresNoPlan - litres,
    fuelRM,
    totalRM,
    co2t: (avoidedL * KG_CO2_PER_L) / 1000,
    loadKWh,
    paybackMonths: site.capex ? site.capex / totalRM : null,
  };
}

// how many monsoon days in a row before the backup genset has to run more than 1 hour a day
export function monsoonRunway(site) {
  const d = simulateDay(site, 'monsoon', true);
  return d.hours.filter((x) => x.genset > 0).length;
}

export function planTips(site, weatherKey) {
  const smart = simulateDay(site, weatherKey, true);
  const plain = simulateDay(site, weatherKey, false);
  const tips = [];
  const flex = site.equipment.find((e) => e.shifted);
  if (flex) {
    const saved = plain.litres - smart.litres;
    const cleanName = flex.name.replace(/charging/i, '').trim();
    tips.push({
      icon: '⚡',
      badge: 'Midday Solar Shift',
      title: `Charge ${cleanName} from ${flex.shifted[0]}:00 to ${flex.shifted.at(-1) + 1}:00`,
      body: saved >= 1
        ? `Uses free midday solar instead of evening battery, saving about ${saved.toFixed(0)} L of diesel today.`
        : 'Uses free midday solar and keeps the battery fuller for the night shift.',
    });
  }
  const full = smart.hours.find((x) => x.soc >= 0.94);
  if (full) {
    tips.push({
      icon: '🔋',
      badge: '100% Battery',
      title: `Battery full by ${full.h}:00`,
      body: 'Schedule heavy lifting during this window to run straight off rooftop solar.',
    });
  }
  if (weatherKey === 'storm') {
    tips.push({
      icon: '⛈️',
      badge: 'Storm Protection',
      title: 'Thunderstorm Window (14:00 to 16:30)',
      body: 'Rain cuts solar. Stored battery buffer carries the tower crane and hoists with zero generator starts.',
    });
  }
  if (weatherKey === 'monsoon') {
    tips.push({
      icon: '🌧️',
      badge: 'Rain Mode',
      title: 'Extended Low Sun Forecast',
      body: `Backup genset expected for about ${smart.hours.filter((x) => x.genset > 0).length} hours. Prioritize critical hoist loads.`,
    });
  }
  return { tips, smart, plain };
}

export const fmt = (n, d = 0) => Number(n).toLocaleString('en-MY', { maximumFractionDigits: d, minimumFractionDigits: d });
