import { invoke } from "@tauri-apps/api/core";
import { info } from "@tauri-apps/plugin-log";

export enum Page{
    Home = "Home",
    Playlists = "My Playlists",
    Settings = "Settings"
}

export interface RustFolder {
    path: string;
    id: string;
    lastSynchronized: string | null;
}

export interface RustPlaylist{
    id : string,
    name : string,
    image_url : string | null
}

export interface ClientConfig{
    clientId : string;
    clientSecret : string;
}

export interface Track{
    title : string,
    name : string,
    album : string,
    year : number,
    duration : number,
}

export class Folder implements Folder {
     
    path: string;
    id: string;
    last_synchronized: Date;
    tracks : Track[];
    playlist : RustPlaylist | null = null;
    
    constructor(path: string, id: string, last_synchronized: Date) {
        this.path = path;
        this.id = id;
        this.last_synchronized = last_synchronized;
        this.tracks = [];
    }

    async loadTracks(): Promise<void> {
        try {
            const tracks = await invoke<Track[]>("get_playlist_tracks", {
                playlistId: this.id
            });
            
            this.tracks = tracks;
            info(`Retrieved ${tracks.length} tracks for folder ${this.id}`);
        } catch (error) {
            throw new Error(`Erreur pour le dossier ${this.id} : ${error}`);
        }
    }

    async loadPlaylist() : Promise<void>{
        try{
            const playlist = await invoke<RustPlaylist>("get_playlist",{
                playlistId: this.id
            })
            this.playlist = playlist;
        }catch(error){
            throw new Error(`Erreur lors du chargement de la playlist ${this.id} : ${error}`);
        }
    }

    static async fromRustFolder(f: RustFolder): Promise<Folder> {
        const folder = new Folder(
            f.path,
            f.id,
            f.lastSynchronized ? new Date(f.lastSynchronized) : new Date(0)
        );
        await folder.loadTracks();
        await folder.loadPlaylist()
        return folder;
    }
}
