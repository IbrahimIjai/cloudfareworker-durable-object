# Cloudflare Durable Objects + Alarms (test)

Tiny test project to try Cloudflare Durable Objects and alarms. Includes a demo counter contract and simple chain I/O.

## Folders

- `ts-worker-durable-object` — DO + alarms (Hono + Viem)
- `rust-worker-durable-object` — optional Alloy read (experimental)
- `test-counter-contract` — Foundry `Counter.sol`

## Quick start (TS worker)

```bash
cd ts-worker-durable-object
pnpm i
pnpx wrangler secret put PRIVATE_KEY
pnpm dev
```

Try (dev URL http://127.0.0.1:8787):

- GET /start-scheduler
- GET /status
- GET /test-viem

Chain: Base Sepolia (RPC: https://sepolia.base.org)

MIT
