import { strict as assert } from "node:assert";
import { shouldWatermark, ShipmentEvent } from "./shipment_watermark.ts";

const delivered = ShipmentEvent.parse({ shipmentId: "S-42", kind: "delivered", occurredAt: "2026-01-01T10:00:00.000Z", proofImage: "img_123" });
const exception = ShipmentEvent.parse({ shipmentId: "S-43", kind: "exception", occurredAt: "2026-01-01T10:00:00.000Z", exceptionNote: "Wet carton" });
assert.equal(shouldWatermark(delivered), true);
assert.equal(shouldWatermark(exception), false);
console.log("shipment watermark decision: pass");
