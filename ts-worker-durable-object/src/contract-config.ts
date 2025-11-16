export const CONTRACT_ADDRESS = "0xff9e977a9280bb888e36b9b233fb2e0d6d0aed6b";

export const COUNTER_ABI = [
	{ type: "constructor", inputs: [], stateMutability: "nonpayable" },
	{
		type: "function",
		name: "admin",
		inputs: [],
		outputs: [{ name: "", type: "address", internalType: "address" }],
		stateMutability: "view",
	},
	{
		type: "function",
		name: "canUpdate",
		inputs: [],
		outputs: [{ name: "", type: "bool", internalType: "bool" }],
		stateMutability: "view",
	},
	{
		type: "function",
		name: "countToTimestamp",
		inputs: [{ name: "", type: "uint256", internalType: "uint256" }],
		outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "function",
		name: "counter",
		inputs: [],
		outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
		stateMutability: "view",
	},
	{
		type: "function",
		name: "toggleUpdate",
		inputs: [{ name: "_canUpdate", type: "bool", internalType: "bool" }],
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "function",
		name: "updateCount",
		inputs: [],
		outputs: [],
		stateMutability: "nonpayable",
	},
	{
		type: "event",
		name: "CounterUpdated",
		inputs: [
			{
				name: "newCounter",
				type: "uint256",
				indexed: true,
				internalType: "uint256",
			},
			{
				name: "timestamp",
				type: "uint256",
				indexed: false,
				internalType: "uint256",
			},
		],
		anonymous: false,
	},
] as const;


export const RPC_URL = "https://sepolia.base.org";