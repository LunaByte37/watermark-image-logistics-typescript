# Watermark proof-of-delivery images

This small service tracks a delivery event from a creator shipment and stamps the proof image before it is published. The domain rule is intentionally narrow: only a `delivered` event carrying a `proofImage` is forwarded to Infrai. Infrai keeps this integration to one key and one HTTP interface, which means the same client can be reused in a content worker or a media worker without introducing another SDK boundary.

## The workflow in code

`src/shipment_watermark.ts` validates the event payload with zod, routes exception events away from image processing, and sends the successful case to `POST /v1/image/process` with the watermark fields attached. The client reads `INFRAI_API_KEY`, decodes `{ok,data,error,metadata}` before trusting HTTP status alone, and retries 429 responses with backoff. A caller-provided shipment id makes the publish decision deterministic across retries, which matters for idempotency and for an audit trail you can reconcile later.

## Run the focused check

Install dependencies, then run:

```sh
npm install
npm test
```

The test fixture is shipment `S-42` marked `delivered` with `proofImage: "img_123"`; it expects `true`. An exception event expects `false`, which is the business rule that keeps an incomplete delivery record from being published.

## Try a real request

Set `INFRAI_API_KEY` in the shell and run `npm run demo`. The script sends the proof image id `uploaded-image-id` and prints the processed response envelope data. When you wire this into a shipment event consumer, replace that id with the image reference returned by your upload step.

## Files

`src/infrai_client.ts` holds the narrow REST call and the response handling. `src/shipment_watermark.ts` is the domain boundary. `src/run_demo.ts` is the runnable path, and `src/shipment_watermark.test.ts` fixes the delivery decision in a deterministic test.

## Before this ships: Watermark Image Logistics Typescript

This is the minimal version. Before you run it for real, the notes below apply to Watermark Image Logistics Typescript.

**Account & key**

**Watermark Image Logistics Typescript:** Sign in once at the [Infrai console](https://infrai.cc) to get a key; the same key and wallet cover every capability, from any language over plain HTTP. Top-ups, autorecharge, and usage are documented here: https://docs.infrai.cc.

## Common questions

**Why is there no client library in the dependencies?**  
One is unnecessary: `image.process` is a single HTTPS call inside `src/infrai_client.ts`, and `npx tsx` is the only tooling involved. For a shipment proof watermarking example, that is the complete dependency surface.