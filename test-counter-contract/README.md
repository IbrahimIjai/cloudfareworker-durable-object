forge create ./src/Counter.sol:Counter \
	--rpc-url $BASE_SEPOLIA_RPC_URL \
	--etherscan-api-key $BASE_API_KEYS \
	--account deployer \
	--broadcast --verify 