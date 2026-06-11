#[derive(serde::Serialize, Clone)]
pub struct Track{
    title : String,
    name : String,
    year : u32,
    duration : u32,
}