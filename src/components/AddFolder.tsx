import { useEffect, useState } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { invoke } from "@tauri-apps/api/core";
import PlaylistsPreview from "./PlaylistsPreview";
import { RustPlaylist } from "../structures";
import { showError } from "../utils/notifications";

interface AddFolderProps {
    onClose: () => void;
    onAdded?: () => void;
}

function AddFolder({ onClose, onAdded }: AddFolderProps) {
    const [path, setPath] = useState("");
    const [selectedPlaylistId, setSelectedPlaylistId] = useState("");
    const [playlists,setPlaylists] = useState<RustPlaylist[]>([]);
    const [isLoadingPlaylists, setIsLoadingPlaylists] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(()=>{
        setIsLoadingPlaylists(true);
        invoke<RustPlaylist[]>("get_user_playlists").then((playlists : RustPlaylist[])=>{
            setPlaylists(playlists.map((playlist : RustPlaylist)=>{
                playlist.id = playlist.id.split(":")[2]
                return playlist;
            }));
        }).catch(error=>{
            showError(error);
        }).finally(() => {
            setIsLoadingPlaylists(false);
        });
    },[]);

    const selectFolder = async () => {
        try {
            const selected = await open({
                directory: true,
                multiple: false,
                title: "Select Folder to Add"
            });
            if (selected) {
                setPath(selected as string);
            }
        } catch (error) {
            console.error("Failed to open dialog:", error);
        }
    };

    const handleAdd = async () => {
        if (!path || !selectedPlaylistId) return;
        setIsSubmitting(true);
        try {
            await invoke("add_folder", { path, id: selectedPlaylistId });
            if (onAdded) onAdded();
            onClose();
        } catch (error) {
            console.error("Failed to add path:", error);
            alert("Error adding path: " + error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
                <h2>Add Folder</h2>

                <div className="input-group">
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Select Spotify Playlist</label>
                    {isLoadingPlaylists ? (
                        <div className="loader-container" style={{ padding: '1rem' }}>
                            <div className="spinner" style={{ width: '24px', height: '24px' }}></div>
                            <p style={{ fontSize: '0.8rem' }}>Loading playlists...</p>
                        </div>
                    ) : (
                        <PlaylistsPreview 
                            playlists={playlists} 
                            selectedId={selectedPlaylistId}
                            onSelect={setSelectedPlaylistId}
                        />
                    )}
                </div>

                <div className="input-group">
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Local Folder Path</label>
                    <div className="input-row">
                        <input
                            type="text"
                            value={path}
                            readOnly
                            placeholder="No folder selected"
                            onClick={selectFolder}
                        />
                        <button className="primary-btn" onClick={selectFolder}>
                            Browse
                        </button>
                    </div>
                </div>
                <div className="modal-actions">
                    <button className="secondary-btn" onClick={onClose} disabled={isSubmitting}>
                        Cancel
                    </button>
                    <button 
                        className="primary-btn" 
                        onClick={handleAdd} 
                        disabled={!path || !selectedPlaylistId || isSubmitting}
                    >
                        {isSubmitting ? "Adding..." : "Add Folder"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AddFolder;
