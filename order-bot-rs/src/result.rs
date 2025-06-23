use std::collections::HashMap;
use tokio::sync::Mutex;

pub struct StatusMap {
    statuses: Mutex<HashMap<u16, i32>>,
}

impl StatusMap {
    pub fn new() -> Self {
        Self {
            statuses: Mutex::new(HashMap::new()),
        }
    }

    pub async fn add(&self, status: u16) {
        {
            let mut statuses = self.statuses.lock().await;
            statuses.entry(status).and_modify(|x| *x += 1).or_insert(1);
        }
    }

    pub async fn entries(&self) -> HashMap<u16, i32> {
        let entries: HashMap<u16, i32>;
        {
            let statuses = self.statuses.lock().await;
            entries = HashMap::from(statuses.clone());
        }
        entries
    }
}
