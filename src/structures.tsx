export enum Page{
    Home = "Home",
    Playlists = "My Playlists",
    Settings = "Settings"
}

export class Folder{
    path : string;

    constructor(path: string){
        this.path = path;
    }
}