import { DurableObject } from "cloudflare:workers";
import { Hono } from "hono";
import {
	getCanUpdate,
	getCounter,
	getLastTimestamp,
	handleUpdateCount,
	toggleUpdate,
} from "./viem";

const app = new Hono<{ Bindings: Env }>();

export class CounterScheduler extends DurableObject {
	constructor(ctx: DurableObjectState, env: Env) {
		super(ctx, env);
		// this.initializeSeats();
	}

	async fetch(request: Request): Promise<Response> {
		const url = new URL(request.url);
		if (url.pathname === "/status") {
			const counter = await getCounter();
			const canUpdate = await getCanUpdate();
			const lastTimestamp = await getLastTimestamp();
			const nextAlarm = await this.ctx.storage.getAlarm();

			return new Response(
				JSON.stringify({
					counter,
					canUpdate,
					lastTimestamp,
					nextAlarm: nextAlarm ? new Date(nextAlarm).toISOString() : null,
				}),
				{ headers: { "Content-Type": "application/json" } },
			);
		}
		if (url.pathname === "/toggle" && request.method === "POST") {
			const { canUpdate } = await request.json<{ canUpdate: boolean }>();
			const result = await toggleUpdate(canUpdate, this.env);
			return new Response(
				typeof result === "string" ? result : JSON.stringify(result),
				{
					headers: {
						"Content-Type":
							typeof result === "string" ? "text/plain" : "application/json",
					},
				},
			);
		}
		if (url.pathname === "/manual-update") {
			// await this.handleUpdate();
			return new Response("Manual update triggered");
		}
		if (url.pathname === "/start-scheduler") {
			await this.startScheduler();
			return new Response("Scheduler started");
		}
		return new Response("Not found", { status: 404 });
	}

	async alarm() {
		await this.handleUpdate();
	}

	private async handleUpdate(isRetry = false) {
		console.log("Alarm triggered, attempting to update counter");
		const now = Date.now();
		console.log("Current time:", new Date(now).toISOString());
		const intervalMs = 30 * 1000; // 30 sec
		let nextUpdateTime = now + intervalMs;

		const canUpdate = await getCanUpdate();

		if (!canUpdate) {
			console.log("Updates are disabled. Skipping update.");
			await toggleUpdate(true, this.env);
			await this.ctx.storage.setAlarm(nextUpdateTime);
			return;
		}

		if (isRetry) {
			nextUpdateTime = now + intervalMs;
		}

		const retryCount = (await this.ctx.storage.get<number>("retry_count")) ?? 0;
		if (retryCount >= 5) {
			console.error("Max retries exceeded");
			return;
		}

		try {
			const canUpdate = await getCanUpdate();
			if (!canUpdate) {
				throw new Error("Updates disabled");
			}

			const hash = await handleUpdateCount(this.env);
			await this.ctx.storage.put("retry_count", 0);
			await this.ctx.storage.setAlarm(nextUpdateTime);

			console.log(
				`Counter updated successfully (tx: ${hash}). Next at ${new Date(
					nextUpdateTime,
				)}`,
			);
		} catch (error) {
			console.error("Update failed:", error);
			await this.ctx.storage.put("retry_count", retryCount + 1);
			const retryTime = now + 60 * 1000;
			await this.ctx.storage.setAlarm(retryTime);
			await this.ctx.storage.put("is_retry", true);
		}
	}

	private async startScheduler() {
		const now = Date.now();
		const intervalMs = 10 * 1000; // 10s for testing
		const nextUpdateTime = now + intervalMs;
		await this.ctx.storage.setAlarm(nextUpdateTime);
		await this.ctx.storage.put("retry_count", 0);
		await this.ctx.storage.put("is_retry", false);
		console.log(
			`🚀 Scheduler started. First alarm at ${new Date(
				nextUpdateTime,
			).toISOString()}`,
		);
	}
}

app.get("/", (c) => {
	return c.text("Hello Hono!");
});

app.get("/start-scheduler", async (c) => {
	const id = c.env.CounterScheduler.idFromName("global");
	const obj = c.env.CounterScheduler.get(id);
	return obj.fetch(new Request("http://127.0.0.1:8787/start-scheduler"));
});

app.get("/test-viem", async (c) => {
	// Run reads in parallel
	const [counter, canUpdate, lastTimestamp] = await Promise.all([
		getCounter(),
		getCanUpdate(),
		getLastTimestamp(),
	]);

	// IMPORTANT: Send writes sequentially to avoid nonce collisions
	const updateHash = await handleUpdateCount(c.env);
	const toggleHash = await toggleUpdate(true, c.env);

	return c.json({ counter, canUpdate, lastTimestamp, updateHash, toggleHash });
});

export default app;
