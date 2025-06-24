use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct SubmitOrderDto {
    pub promotion_id: String,
    pub product_id: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct OrderDto {
    pub id: String,
    pub customer_id: i32,
    pub promotion_id: String,
    pub product_id: String,
    pub status: String,
    pub created_at: i64,
    pub updated_at: i64,
}
