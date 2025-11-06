/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.
*/

/**
 * Central export for all mock handlers
 * Import this in your test setup to enable MSW
 */

import { authHandlers } from './auth';
import { courseHandlers } from './courses';

export const handlers = [
  ...authHandlers,
  ...courseHandlers,
];

export default handlers;
