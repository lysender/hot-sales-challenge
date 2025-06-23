use chrono::{Duration, Utc};
use jsonwebtoken::{EncodingKey, Header, encode};
use serde::{Deserialize, Serialize};

use crate::{Result, error::WhateverSnafu};
#[derive(Debug, Deserialize, Serialize)]
struct Claims {
    sub: String,
    exp: usize,
}

// Duration in seconds
const EXP_DURATION: i64 = 60 * 60 * 24; // 1 day 

pub fn create_token(subject: String, secret: &str) -> Result<String> {
    let exp = Utc::now() + Duration::seconds(EXP_DURATION);

    let claims = Claims {
        sub: subject,
        exp: exp.timestamp() as usize,
    };

    let Ok(token) = encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(secret.as_bytes()),
    ) else {
        return WhateverSnafu {
            msg: "Error creating JWT token".to_string(),
        }
        .fail();
    };

    Ok(token)
}
