use worker::*;

mod alloy_fns;
use alloy::primitives::U256;

#[event(fetch)]
async fn fetch(_req: Request, _env: Env, _ctx: Context) -> Result<Response> {
    // Call the Alloy helper to get WETH balance for default owner.
    match alloy_fns::fetch_weth_balance(None).await {
        Ok(bal) => {
            // Format balance both raw wei and approximate ether (truncated) for convenience.
            let ether = wei_to_eth_truncated(bal);
            Response::ok(format!("WETH balance (wei): {bal}\nApprox (ETH): {ether}"))
        }
        Err(e) => Response::error(format!("Failed to fetch WETH balance: {e}")),
    }
}

// Simple helper: convert wei (U256) to a truncated decimal string in ETH (18 decimals).
fn wei_to_eth_truncated(wei: U256) -> String {
    // 10^18 as U256
    let base: U256 = U256::from(10u128.pow(18));
    let whole = wei / base;
    let rem = wei % base;
    // Take first 4 decimal digits for brevity.
    let frac = (rem / U256::from(10u128.pow(18 - 4))).to_string();
    format!("{whole}.{frac}")
}
