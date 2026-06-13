#[derive(serde::Serialize, Clone)]
pub struct Track{
    pub title : String,
    pub name : String,
    pub album : String,
    pub year : u32,
    pub duration : u32,
    pub image_url : Option<String>,
}