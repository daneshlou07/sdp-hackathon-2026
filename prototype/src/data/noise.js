// DOE Planning Guidelines for Environmental Noise Limits and Control, Schedule 6
// (construction next to existing residential). L90 limits used for the live check.
export const DOE_LIMITS = [
  { from: 7, to: 19, label: 'Day 7 AM to 7 PM', l90: 60, l10: 75, lmax: 90 },
  { from: 19, to: 22, label: 'Evening 7 PM to 10 PM', l90: 55, l10: 70, lmax: 85 },
  { from: 22, to: 31, label: 'Night 10 PM to 7 AM', l90: 45, l10: null, lmax: null, note: 'Home limits apply, no noisy work' },
];

export const limitAt = (h) => DOE_LIMITS.find((l) => (h >= l.from && h < l.to) || (h + 24 >= l.from && h + 24 < l.to));

const logSum = (...db) => 10 * Math.log10(db.reduce((s, d) => s + 10 ** (d / 10), 0));

// boundary L90 estimate per hour. genset runs = boundary hears it.
export function noiseDay(site, dayHours, withGensetBaseline = false) {
  return dayHours.map((x) => {
    const working = x.load > 40 ? 4 : 0;
    const base = site.noiseBase + working - (x.h < 7 || x.h >= 22 ? 8 : 0);
    const gensetOn = withGensetBaseline ? x.load > 0 : x.genset > 0;
    const level = gensetOn ? logSum(base, site.gensetDb - (x.h < 7 || x.h >= 22 ? 0 : 0)) : base;
    return { h: x.h, db: Math.round(level * 10) / 10, gensetOn };
  });
}

export function status(db, limit) {
  if (db > limit) return 'over';
  if (db > limit - 3) return 'near';
  return 'ok';
}

// 30 days of daily peak L90 margin, seeded so it is stable between reloads
export function history(site, days = 30) {
  let seed = site.id.length * 97;
  const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
  return Array.from({ length: days }, (_, i) => ({ day: i + 1, db: Math.round((site.noiseBase + 3 + rnd() * 4) * 10) / 10 }));
}

export const SEED_COMPLAINTS = [
  { id: 1, date: '2026-10-02', site: 'elmina', who: 'Resident, Elmina Green 3', issue: 'Hoist noise before 8 AM', action: 'Hoist start moved to 8 AM', closed: true },
];
