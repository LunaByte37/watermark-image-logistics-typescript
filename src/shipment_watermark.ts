import { z } from "zod";
import { InfraiClient } from "./infrai_client.ts";

export const ShipmentEvent = z.object({ shipmentId: z.string().min(1), kind: z.enum(["picked_up", "delivered", "exception"]), occurredAt: z.string().datetime(), proofImage: z.string().optional(), exceptionNote: z.string().optional() });
export type ShipmentEvent = z.infer<typeof ShipmentEvent>;

export function shouldWatermark(event: ShipmentEvent): boolean {
  return event.kind === "delivered" && Boolean(event.proofImage);
}

export async function publishProof(event: ShipmentEvent, client: InfraiClient, watermarkText: string): Promise<unknown> {
  const parsed = ShipmentEvent.parse(event);
  if (!shouldWatermark(parsed)) return { shipmentId: parsed.shipmentId, state: parsed.kind === "exception" ? "exception" : "awaiting_proof" };
  return client.processImage({
    image: parsed.proofImage,
    ops: [{ type: "watermark", text: watermarkText, position: "bottom-right", opacity: 0.72 }]
  });
}
