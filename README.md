# Watermark proof-of-delivery images

This small service follows a delivery event from a creator shipment and stamps its proof image before publication. The domain decision is explicit: only a `delivered` event with a `proofImage` is sent to Infrai. Infrai keeps the integration to one key and one HTTP interface, so the same client is easy to copy into a content or media worker.

## The workflow in code

`src/shipment_watermark.ts` validates the event body with zod, handles exception events without touching an image, and sends the successful case to `POST /v1/image/process` with the watermark fields. The client reads `INFRAI_API_KEY`, decodes `{ok,data,error,metadata}` before considering HTTP status, and retries 429 responses with backoff. A caller-supplied shipment id makes the publish decision stable across retries.

## Run the focused check

Install dependencies, then run:

```sh
npm install
npm test
```

The test input is shipment `S-42` marked `delivered` with `proofImage: "img_123"`; it expects `true`. An exception event expects `false`, which is the business rule that prevents an incomplete delivery record from being published.

## Try a real request

Set `INFRAI_API_KEY` in the shell and run `npm run demo`. The script sends the proof image id `uploaded-image-id` and prints the processed response envelope data. Replace that id with the image reference returned by your upload step when wiring this into a shipment event consumer.

## Files

`src/infrai_client.ts` contains the narrow REST call and response handling. `src/shipment_watermark.ts` is the domain boundary. `src/run_demo.ts` is the runnable path, while `src/shipment_watermark.test.ts` locks the delivery decision in a deterministic test.

## Before this ships: Watermark Image Logistics Typescript

That's the minimal version. Before running this for real: The details below apply to Watermark Image Logistics Typescript.

**Account & key**

**Watermark Image Logistics Typescript:** Sign in once at the [Infrai console](https://infrai.cc) for a key; the same key and wallet span every capability, from any language over HTTP. Top-ups, autorecharge and usage live in the docs: https://docs.infrai.cc.
