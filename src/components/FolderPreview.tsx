import { Folder } from "../structures";
import { invoke } from "@tauri-apps/api/core";
import { useState } from "react";

interface FolderPreviewProps {
    folder: Folder;
    onDelete: () => void;
}

function FolderPreview({ folder, onDelete }: FolderPreviewProps){
    const [isDeleting, setIsDeleting] = useState(false);

    async function deleteFolder(){
        if (isDeleting) return;
        setIsDeleting(true);
        try {
            await invoke("remove_folder", { path: folder.path, id: folder.id });
            onDelete();
        } catch (error) {
            console.error("Failed to delete folder:", error);
            alert("Failed to delete folder: " + error);
        } finally {
            setIsDeleting(false);
        }
    }

    return (
        <div className="folder-card" style={{ opacity: isDeleting ? 0.6 : 1, pointerEvents: isDeleting ? 'none' : 'auto' }}>
            <div className="folder-icon">
                {folder.playlist?.image_url ? (
                    <img 
                        src={folder.playlist.image_url} 
                        alt={folder.playlist.name} 
                        style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} 
                    />
                ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                    </svg>
                )}
            </div>
            <div className="folder-info">
                <p className="folder-path">{folder.path}</p>
                <p className="folder-meta">{folder.playlist?.name || folder.id}</p>
                <p className="folder-meta">Last updated: {folder.last_synchronized.getTime() === 0 ? "Never" : folder.last_synchronized.toLocaleString()}</p>
            </div>
            <button className="delete-btn" title="Remove folder" onClick={deleteFolder} disabled={isDeleting}>
                {isDeleting ? (
                    <div className="spinner" style={{ width: '14px', height: '14px', borderWeight: '2px', marginBottom: 0 }}></div>
                ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                )}
            </button>
        </div>
    );
}

export default FolderPreview;