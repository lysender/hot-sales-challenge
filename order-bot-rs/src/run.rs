use rand::Rng;
use snafu::ResultExt;
use std::sync::Arc;
use std::time::Duration;
use std::time::Instant;
use ureq::Agent;
use ureq::http::StatusCode;

use crate::Result;
use crate::config::CliArgs;
use crate::config::Config;
use crate::dto::SubmitOrderDto;
use crate::error::HttpClientSnafu;
use crate::error::HttpResponseTextSnafu;
use crate::result::StatusMap;
use crate::token::create_token;
use crate::workers::ThreadPool;

const USER_AGENT: &str = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36";
const JSON_CONTENT_TYPE: &str = "application/json";

pub fn run_command(args: CliArgs) -> Result<()> {
    let config = Config::build(&args.config)?;
    let total_orders = config.total_orders;
    let req_config = Agent::config_builder()
        .timeout_global(Some(Duration::from_secs(5)))
        .http_status_as_error(false)
        .build();

    let client: Agent = req_config.into();
    let status_map = Arc::new(StatusMap::new());
    let ts = Instant::now();

    let _ = place_orders(Arc::new(config), client, status_map.clone())?;

    let duration = ts.elapsed();
    println!("Duration: {}", format_duration(&duration));

    let entries = status_map.entries();
    for (k, v) in entries.iter() {
        println!("Status: {}, count: {}", k, v);
    }

    // Print RPS
    let seconds = duration.as_secs();
    if seconds > 0 {
        let rps = (total_orders as u64 * 2) / seconds;
        println!("RPS: {}", rps);
    }

    Ok(())
}

fn place_orders(config: Arc<Config>, client: Agent, status_map: Arc<StatusMap>) -> Result<()> {
    let pool = ThreadPool::new(config.workers as usize);

    for i in 0..config.total_orders {
        let customer_id = 10000 + i as i32;
        let config_copy = config.clone();
        let client_copy = client.clone();
        let status_map_copy = status_map.clone();
        pool.execute(move || handle_order(config_copy, client_copy, status_map_copy, customer_id));

        // Introduce chaos
        let num = rand::rng().random_range(0..config.total_orders) + 1;
        let customer_id = 10000 + num as i32;
        let config_copy = config.clone();
        let client_copy = client.clone();
        let status_map_copy = status_map.clone();
        pool.execute(move || handle_order(config_copy, client_copy, status_map_copy, customer_id));
    }

    Ok(())
}

fn handle_order(config: Arc<Config>, client: Agent, status_map: Arc<StatusMap>, customer_id: i32) {
    let result = place_order(config, client, customer_id);
    match result {
        Ok(status) => {
            status_map.add(status.into());
        }
        Err(e) => {
            println!("{}", e);
        }
    }
}

fn place_order(config: Arc<Config>, client: Agent, customer_id: i32) -> Result<StatusCode> {
    let token = create_token(customer_id.to_string(), &config.jwt_secret)?;
    let url = format!("{}/orders/placeOrderSimple", &config.api_url);

    let payload = SubmitOrderDto {
        promotion_id: config.promotion_id.clone(),
        product_id: config.product_id.clone(),
    };

    let mut response = client
        .post(url)
        .header("User-Agent", USER_AGENT)
        .header("Content-Type", JSON_CONTENT_TYPE)
        .header("Authorization", &format!("Bearer {}", token))
        .send_json(&payload)
        .context(HttpClientSnafu)?;

    let status = response.status();

    // Read body then discard it
    let _ = response
        .body_mut()
        .read_to_string()
        .context(HttpResponseTextSnafu)?;

    Ok(status)
}

fn format_duration(duration: &Duration) -> String {
    let micros = duration.as_micros();
    if micros < 10_000 {
        return format!("{}µs", micros);
    }
    let millis = duration.as_millis();
    if millis < 10_000 {
        return format!("{}ms", millis);
    }
    let seconds = duration.as_secs();
    format!("{}s", seconds)
}
