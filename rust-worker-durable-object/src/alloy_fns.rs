use alloy::{
    primitives::{address, Address, U256},
    providers::ProviderBuilder,
    sol,
};

sol! {
    #[sol(rpc)]
    contract ERC20 {
        function balanceOf(address owner) public view returns (uint256);
    }
}

const WETH: Address = address!("0x4200000000000000000000000000000000000006");
const DEFAULT_OWNER: Address = address!("0xE4137238fad21B7840A1D6F30bb4b8eb0507Db7e");

pub async fn fetch_weth_balance(
    owner: Option<Address>,
) -> Result<U256, Box<dyn std::error::Error>> {
    // Initialize the provider (public Reth endpoint).
    let provider = ProviderBuilder::new()
        .connect("https://sepolia.base.org")
        .await?;

    let target = owner.unwrap_or(DEFAULT_OWNER);
    let erc20 = ERC20::new(WETH, provider);
    let ret = erc20.balanceOf(target).call().await?; // Return struct has field _0 for uint256
    Ok(ret._0)
}
