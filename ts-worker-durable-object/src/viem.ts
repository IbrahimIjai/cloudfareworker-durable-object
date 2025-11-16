import { createPublicClient, createWalletClient, http } from "viem";
import { baseSepolia } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import { getContract } from "viem";
import { CONTRACT_ADDRESS, COUNTER_ABI, RPC_URL } from "./contract-config";

export const createViemPublicClient = () =>
	createPublicClient({
		chain: baseSepolia,
		transport: http(RPC_URL),
		cacheTime: 10_000,
	});

export function createViemWalletClient(env: Env) {
	const account = privateKeyToAccount(`0x${env.PRIVATE_KEY}` as `0x${string}`);
	return createWalletClient({
		account,
		chain: baseSepolia,
		transport: http(env.RPC_URL),
	});
}

export function createPublicCounterContract() {
	const publicClient = createViemPublicClient();
	return getContract({
		address: CONTRACT_ADDRESS as `0x${string}`,
		abi: COUNTER_ABI,
		client: publicClient,
	});
}

export function createWalletCounterContract(env: Env) {
	const walletClient = createViemWalletClient(env);
	return getContract({
		address: CONTRACT_ADDRESS as `0x${string}`,
		abi: COUNTER_ABI,
		client: walletClient,
	});
}

// Helper functions to read contract state

export async function getCounter(): Promise<number> {
	return createPublicCounterContract()
		.read.counter()
		.then((value) => Number(value))
		.catch((err) => {
			console.error("getCounter: failed to read counter", err);
			throw err;
		});
}

export async function getCanUpdate(): Promise<boolean> {
	return createPublicCounterContract()
		.read.canUpdate()
		.then((value) => Boolean(value))
		.catch((err) => {
			console.error("getCanUpdate: failed to read canUpdate", err);
			throw err;
		});
}

export async function getLastTimestamp(): Promise<number> {
	const counter = await getCounter();

	if (counter === 0) {
		return 0;
	}

	return createPublicCounterContract()
		.read.countToTimestamp([BigInt(counter)])
		.then((value) => Number(value))
		.catch((err) => {
			console.error("getLastTimestamp: failed to read countToTimestamp", err);
			throw err;
		});
}

// Helper functions to write contract state

export async function toggleUpdate(
	canUpdate: boolean,
	env: Env,
): Promise<string> {
	const contract = createWalletCounterContract(env);
	const hash = await contract.write
		.toggleUpdate([canUpdate])
		.then((res) => res)
		.catch((err) => {
			console.error("toggleUpdate: failed to send transaction", err);
			throw err;
		});
	return hash;
}


export async function handleUpdateCount(
	env: Env,
): Promise<string> {
	const contract = createWalletCounterContract(env);
	const hash = await contract.write
		.updateCount()
		.then((res) => {
            console.log("update count: transaction sent", res);
            return res;
        })
		.catch((err) => {
			console.error("update count: failed to send transaction", err);
			throw err;
		});
	return hash;
}
