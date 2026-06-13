import { useEffect, useState, useRef } from "react";
import AddFolder from "../components/AddFolder";
import FolderPreview from "../components/FolderPreview";
import { ClientConfig, RustFolder,Folder } from "../structures";
import { invoke } from "@tauri-apps/api/core";
import { showError } from "../utils/notifications";

async function getFolders() : Promise<Folder[]>{
    try {
        const rawFolders = await invoke<RustFolder[]>("get_folders");

        const results = await Promise.allSettled(rawFolders.map(f =>
            Folder.fromRustFolder(f)
        ));

        const folders: Folder[] = [];
        let hasError = false;
        let lastErrorMessage = "";

        results.forEach(result => {
            if (result.status === "fulfilled") {
                folders.push(result.value);
            } else {
                hasError = true;
                lastErrorMessage = result.reason?.message || String(result.reason);
            }
        });

        if (hasError) {
            showError("Certains dossiers n'ont pas pu être chargés : " + lastErrorMessage);
        }

        return folders;
    } catch (error) {
        showError("Erreur lors de la récupération des dossiers : " + error);
        return [];
    }
}

function Folders(){
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [folders,setFolders] = useState<Folder[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    function refreshFolders(){
        if (isLoading) return;
        setIsLoading(true);

        getFolders()
            .then(setFolders)
            .finally(() => {
                setIsLoading(false);
            });
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

            {isLoading ? (
                <div className="loader-container">
                    <div className="spinner"></div>
                    <p>Loading folders...</p>
                </div>
            ) : (
                <div className="folder-list">
                    {folders.map((folder, index) => (
                        <FolderPreview key={index} folder={folder} onDelete={()=>refreshFolders()}/>
                    ))}
                    {folders.length === 0 && (
                        <p style={{ color: 'var(--text-muted)', gridColumn: '1/-1', textAlign: 'center', marginTop: '2rem' }}>
                            No folders added yet.
                        </p>
                    )}
                </div>
            )}

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