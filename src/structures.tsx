import { invoke } from "@tauri-apps/api/core";

export enum Page{
    Home = "Home",
    Playlists = "My Playlists",
    Settings = "Settings"
}

export interface RustFolder {
    path: string;
    id: string;
    last_synchronized: string | null;
}

export interface ClientConfig{
    client_id : string;
    client_secret : string;
}

export class Folder implements Folder {
     
    path: string;
    id: string;
    last_synchronized: Date;
    song_count : number;
    
    constructor(path: string,id: string,last_synchronized: Date) {
        this.path = path;
        this.id = id;
        this.last_synchronized = last_synchronized;
    }

    static fromRustFolder(f: RustFolder): Folder {
        return new Folder(
            f.path,
            f.id,
            f.last_synchronized ? new Date(f.last_synchronized) : new Date(0)
        );
    }
}
