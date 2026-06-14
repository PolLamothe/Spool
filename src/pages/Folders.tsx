import { useEffect, useState } from "react";
import AddFolder from "../components/AddFolder";
import FolderPreview from "../components/FolderPreview";
import { RustFolder,Folder } from "../structures";
import { invoke } from "@tauri-apps/api/core";
import { showError } from "../utils/notifications";

async function getFolders(existingFolders: Folder[] = []) : Promise<Folder[]>{
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
                const folder = result.value;
                // Preserve tracks if folder already existed
                const existing = existingFolders.find(ef => ef.id === folder.id);
                if (existing && existing.tracks.length > 0) {
                    folder.tracks = existing.tracks;
                }
                folders.push(folder);
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

function Folders({ folders, setFolders, onSelectFolder }: { folders: Folder[], setFolders: (folders: Folder[]) => void, onSelectFolder: (folder: Folder) => void }){
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    function refreshFolders(){
        if (isLoading) return;
        setIsLoading(true);

        getFolders(folders)
            .then(setFolders)
            .finally(() => {
                setIsLoading(false);
            });
    }

    useEffect(()=>{
        if (folders.length === 0) {
            refreshFolders();
        }
    },[])

    return (
        <div className="scrollable-page">
            <h1>Folders</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                Manage your music library folders.
            </p>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                <button 
                    className="primary-btn" 
                    onClick={() => setIsModalOpen(true)}
                >
                    Add a folder
                </button>
                <button 
                    className="secondary-btn" 
                    onClick={() => refreshFolders()}
                    disabled={isLoading}
                >
                    {isLoading ? "Reloading..." : "Reload"}
                </button>
            </div>

            {isLoading ? (
                <div className="loader-container">
                    <div className="spinner"></div>
                    <p>Loading folders...</p>
                </div>
            ) : (
                <div className="folder-list">
                    {folders.map((folder, index) => (
                        <FolderPreview 
                            key={index} 
                            folder={folder} 
                            onDelete={() => refreshFolders()} 
                            onUpdate={() => refreshFolders()}
                            onClick={() => onSelectFolder(folder)}
                        />
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