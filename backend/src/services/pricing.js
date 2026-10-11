// All values in paise (integers). Tweak freely.
const BASE_VALUE = {
  phone: 25000,
  laptop: 80000,
  tablet: 40000,
  battery: 5000,
  charger: 3000,
  headphones: 6000,
  keyboard: 4000,
  mouse: 2500,
  printer: 30000,
  monitor: 35000,
  cable: 1000,
  other: 2000,
};
// percent multipliers, integer math only
const CONDITION_PCT = { WORKING: 100, DAMAGED: 60, DEAD: 30 };

const CATEGORIES = Object.keys(BASE_VALUE);
const CONDITIONS = Object.keys(CONDITION_PCT);

function estimateValue(category, condition) {
  const base = BASE_VALUE[category] ?? BASE_VALUE.other;
  const pct = CONDITION_PCT[condition] ?? CONDITION_PCT.DEAD;
  return Math.round((base * pct) / 100);
}

module.exports = { CATEGORIES, CONDITIONS, estimateValue };
