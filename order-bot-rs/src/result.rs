use std::{collections::HashMap, sync::Mutex};

pub struct StatusMap {
    statuses: Mutex<HashMap<u16, i32>>,
}

impl StatusMap {
    pub fn new() -> Self {
        Self {
            statuses: Mutex::new(HashMap::new()),
        }
    }

    pub fn add(&self, status: u16) {
        {
            let mut statuses = self.statuses.lock().unwrap();
            statuses.entry(status).and_modify(|x| *x += 1).or_insert(1);
        }
    }

    pub fn entries(&self) -> HashMap<u16, i32> {
        let entries: HashMap<u16, i32>;
        {
            let statuses = self.statuses.lock().unwrap();
            entries = HashMap::from(statuses.clone());
        }
        entries
    }
}
