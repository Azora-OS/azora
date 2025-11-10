"use strict";
/**
 * @azora/telemetry
 * Component usage analytics for Azora OS
 *
 * Ubuntu principle: "What gets measured gets improved"
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.withTelemetry = exports.useErrorTelemetry = exports.useRenderTelemetry = exports.useInteractionTelemetry = exports.useComponentTelemetry = exports.getTelemetry = exports.initTelemetry = exports.TelemetryClient = void 0;
// Export client
var client_1 = require("./client");
Object.defineProperty(exports, "TelemetryClient", { enumerable: true, get: function () { return client_1.TelemetryClient; } });
Object.defineProperty(exports, "initTelemetry", { enumerable: true, get: function () { return client_1.initTelemetry; } });
Object.defineProperty(exports, "getTelemetry", { enumerable: true, get: function () { return client_1.getTelemetry; } });
// Export hooks
var hooks_1 = require("./hooks");
Object.defineProperty(exports, "useComponentTelemetry", { enumerable: true, get: function () { return hooks_1.useComponentTelemetry; } });
Object.defineProperty(exports, "useInteractionTelemetry", { enumerable: true, get: function () { return hooks_1.useInteractionTelemetry; } });
Object.defineProperty(exports, "useRenderTelemetry", { enumerable: true, get: function () { return hooks_1.useRenderTelemetry; } });
Object.defineProperty(exports, "useErrorTelemetry", { enumerable: true, get: function () { return hooks_1.useErrorTelemetry; } });
Object.defineProperty(exports, "withTelemetry", { enumerable: true, get: function () { return hooks_1.withTelemetry; } });
