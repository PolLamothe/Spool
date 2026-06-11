import { useEffect, useState } from "react";
import AddFolder from "../components/AddFolder";
import FolderPreview from "../components/FolderPreview";
import { Folder } from "../structures";
import { invoke } from "@tauri-apps/api/core";

async function getFolders() : Promise<Folder[]>{
    const config_paths : string[] = await invoke("get_config_paths");
    return config_paths.map(path => new Folder(path));
}

function Folders(){
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const [folders,setFolders] = useState<Folder[]>([]);

    function refreshFolders(){
        getFolders().then(setFolders);
    }

    useEffect(()=>{
        refreshFolders();
    },[])

    return (
        <div>
            <h1>Folders</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                Manage your music library folders.
            </p>
            <button 
                className="primary-btn" 
                onClick={() => setIsModalOpen(true)}
            >
                Add a folder
            </button>

            <div className="folder-list">
                {folders.map((folder, index) => (
                    <FolderPreview key={index} folder={folder} onDelete={()=>refreshFolders()}/>
                ))}
            </div>

            {isModalOpen && (
                <AddFolder 
                    onClose={() => setIsModalOpen(false)} 
                    onAdded={() => {
                        refreshFolders();
                    }}
                />
            )}
        </div>
    );
}

export default Folders;