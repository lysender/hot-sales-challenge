use clap::Parser;
use config::CliArgs;
use snafu::ErrorCompat;
use std::process;

mod config;
mod dto;
mod error;
mod result;
mod run;
mod token;
mod workers;

// Re-export error types for convenience
pub use error::{Error, Result};

use crate::run::run_command;

fn main() {
    let args = CliArgs::parse();

    if let Err(e) = run_command(args) {
        eprintln!("Application error: {}", e);
        if let Some(bt) = ErrorCompat::backtrace(&e) {
            println!("{}", bt);
        }
        process::exit(1);
    }
}
