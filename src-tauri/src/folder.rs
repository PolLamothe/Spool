use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Folder{
    pub path : String,
    pub id : String,
    pub last_synchronized : Option<DateTime<Utc>>
}