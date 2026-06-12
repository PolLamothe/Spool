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

export class Folder implements Folder {
     
    path: string;
    id: string;
    last_synchronized: Date;
    
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
