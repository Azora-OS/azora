import pino from 'pino';

// Keep logger simple for tests and environments; avoid transport options that require extra
// dependencies to keep unit tests portable.
export const logger = pino();
