import { InfraiClient } from "./infrai_client.ts";
import { publishProof } from "./shipment_watermark.ts";

const event = { shipmentId: "S-42", kind: "delivered" as const, occurredAt: new Date().toISOString(), proofImage: "uploaded-image-id" };
const result = await publishProof(event, new InfraiClient(), `Shipment ${event.shipmentId} / ${event.occurredAt}`);
console.log(JSON.stringify({ shipmentId: event.shipmentId, processed: result }, null, 2));
