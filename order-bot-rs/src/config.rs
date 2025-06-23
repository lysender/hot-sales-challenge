use clap::Parser;
use serde::Deserialize;
use snafu::{ResultExt, ensure};
use std::{fs, path::PathBuf};

use crate::Result;
use crate::error::{ConfigFileSnafu, ConfigParseSnafu, ConfigSnafu};

#[derive(Debug, Clone, Deserialize)]
pub struct Config {
    pub api_url: String,
    pub promotion_id: String,
    pub product_id: String,
    pub jwt_secret: String,
}

impl Config {
    pub fn build(filename: &PathBuf) -> Result<Self> {
        let toml_string = fs::read_to_string(filename).context(ConfigFileSnafu)?;
        let config: Config = toml::from_str(toml_string.as_str()).context(ConfigParseSnafu)?;

        // Validate config values
        ensure!(
            config.api_url.len() > 0,
            ConfigSnafu {
                msg: "API URL is required.".to_string()
            }
        );

        ensure!(
            config.promotion_id.len() > 0,
            ConfigSnafu {
                msg: "Promotion ID is required.".to_string()
            }
        );

        ensure!(
            config.product_id.len() > 0,
            ConfigSnafu {
                msg: "Product ID is required.".to_string()
            }
        );

        ensure!(
            config.jwt_secret.len() > 0,
            ConfigSnafu {
                msg: "JWT secret is required.".to_string()
            }
        );

        Ok(config)
    }
}

#[derive(Parser, Debug)]
#[command(author, version, about, long_about = None)]
pub struct CliArgs {
    #[arg(short, long, value_name = "config.toml")]
    pub config: PathBuf,
}
