// Bundled entry for determinism-smoke.mjs: the real simulation plus the scenario.
import * as core from '../../src/core.ts';
import { runScenario } from './determinism-scenario.mjs';

const determinism = runScenario(core);
export default determinism;
