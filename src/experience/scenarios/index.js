import { EXPLORE_SCENARIO } from './explore';
import { EDUCATION_SCENARIO } from './education';
import { BUSINESS_SCENARIO } from './business';
import { SENSORS_SCENARIO } from './sensors';

/** Ordered scenario list for the experience picker. */
export const SCENARIO_LIST = [
  EXPLORE_SCENARIO,
  EDUCATION_SCENARIO,
  BUSINESS_SCENARIO,
  SENSORS_SCENARIO,
];

export const SCENARIOS_BY_ID = Object.fromEntries(
  SCENARIO_LIST.map((scenario) => [scenario.id, scenario]),
);

export const DEFAULT_SCENARIO_ID = EXPLORE_SCENARIO.id;

export function getScenario(id) {
  return SCENARIOS_BY_ID[id] || SCENARIOS_BY_ID[DEFAULT_SCENARIO_ID];
}
