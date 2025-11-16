//! Demonstrates reading a contract by fetching the WETH balance of an address.
use alloy::{primitives::address, providers::ProviderBuilder, sol};
use std::error::Error;
 
// Generate the contract bindings for the ERC20 interface.
sol! { 
   // The `rpc` attribute enables contract interaction via the provider.
   #[sol(rpc)] 
   contract ERC20 { 
        function balanceOf(address owner) public view returns (uint256); 
   } 
} 
 
#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
    // Initialize the provider.
    let provider = ProviderBuilder::new().connect("https://reth-ethereum.ithaca.xyz/rpc").await?;
 
    // Instantiate the contract instance.
    let weth = address!("0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2");
    let erc20 = ERC20::new(weth, provider); 
 
    // Fetch the balance of WETH for a given address.
    let owner = address!("0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"); 
    let balance = erc20.balanceOf(owner).call().await?; 
 
    println!("WETH Balance of {owner}: {balance}");
 
    Ok(())
}