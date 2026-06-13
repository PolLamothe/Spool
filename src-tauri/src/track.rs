#[derive(serde::Serialize, Clone)]
pub struct Track{
    pub title : String,
    pub name : String,
    pub year : u32,
    pub duration : u32,
}