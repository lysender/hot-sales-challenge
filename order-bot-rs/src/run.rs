use rand::Rng;
use reqwest::Client;
use reqwest::StatusCode;
use snafu::ResultExt;
use std::sync::Arc;
use std::time::Instant;
use tokio::time::Duration;

use crate::Result;
use crate::config::CliArgs;
use crate::config::Config;
use crate::dto::SubmitOrderDto;
use crate::error::HttpClientSnafu;
use crate::error::JsonSerializeSnafu;
use crate::result::StatusMap;
use crate::token::create_token;

const USER_AGENT: &str = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36";
const JSON_CONTENT_TYPE: &str = "application/json";

pub async fn run_command(args: CliArgs) -> Result<()> {
    let config = Config::build(&args.config)?;
    let client = Client::builder()
        .timeout(Duration::from_secs(5))
        .build()
        .unwrap();

    let _ = place_orders_simple(Arc::new(config), client).await?;
    Ok(())
}

async fn place_orders_simple(config: Arc<Config>, client: Client) -> Result<()> {
    let ts = Instant::now();

    let status_map = Arc::new(StatusMap::new());
    let mut handles = vec![];
    let start = 10000;
    let end = 50000;

    let max = 1000;
    let size = 10; // concurrent users
    let batch_size = max / size;

    for i in 0..batch_size {
        let config_copy = config.clone();
        let client_copy = client.clone();
        let status_map_copy = status_map.clone();
        let handle = tokio::spawn(async move {
            place_orders_simple_batch(config_copy, client_copy, status_map_copy, size, i * size)
                .await
        });

        handles.push(handle);
    }

    for handle in handles {
        let _ = handle.await.unwrap()?;
    }

    let duration = ts.elapsed();
    println!("Duration: {}", format_duration(duration));
    let entries = status_map.entries().await;
    for (k, v) in entries.iter() {
        println!("Status: {}, count: {}", k, v);
    }

    Ok(())
}

async fn place_orders_simple_batch(
    config: Arc<Config>,
    client: Client,
    status_map: Arc<StatusMap>,
    size: i32,
    start: i32,
) -> Result<()> {
    let mut handles = vec![];

    for i in 0..size {
        // Regular request
        let config_copy = config.clone();
        let client_copy = client.clone();
        let id = i + start;
        let handle =
            tokio::spawn(async move { place_order_simple(config_copy, client_copy, id).await });

        handles.push(handle);

        // Add a random customer_id to introduce chaos
        let random_id = rand::rng().random_range(0..=size) + start;

        let config_copy = config.clone();
        let client_copy = client.clone();
        let handle =
            tokio::spawn(
                async move { place_order_simple(config_copy, client_copy, random_id).await },
            );
        handles.push(handle);
    }

    for handle in handles {
        let status_code = handle.await.unwrap()?;
        status_map.add(status_code.into()).await;
    }

    Ok(())
}

async fn place_order_simple(
    config: Arc<Config>,
    client: Client,
    customer_id: i32,
) -> Result<StatusCode> {
    let token = create_token(customer_id.to_string(), &config.jwt_secret)?;
    let url = format!("{}/orders/placeOrderSimple", &config.api_url);

    let payload = SubmitOrderDto {
        promotion_id: config.promotion_id.clone(),
        product_id: config.product_id.clone(),
    };

    let post_body = serde_json::to_string(&payload).context(JsonSerializeSnafu)?;

    let response = client
        .post(url)
        .header(reqwest::header::USER_AGENT, USER_AGENT)
        .header(reqwest::header::CONTENT_TYPE, JSON_CONTENT_TYPE)
        .body(post_body)
        .bearer_auth(&token)
        .send()
        .await
        .context(HttpClientSnafu {
            msg: "Unable to place order, try again later.".to_string(),
        })?;

    let status = response.status();
    // if !status.is_success() {
    //     let text = response.text().await.unwrap();
    //     println!("{}", text);
    // }

    Ok(status)
}

fn format_duration(duration: Duration) -> String {
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
