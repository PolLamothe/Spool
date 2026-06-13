use serde::{Deserialize,Serialize};

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Playlist{
    pub id : String,
    pub name : String,
    pub image_url : Option<String>
}