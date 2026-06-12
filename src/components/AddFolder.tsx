import { useState } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { invoke } from "@tauri-apps/api/core";

interface AddFolderProps {
    onClose: () => void;
    onAdded?: () => void;
}

function AddFolder({ onClose, onAdded }: AddFolderProps) {
    const [path, setPath] = useState("");
    const [id, setId] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

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
        if (!path || !id) return;
        setIsSubmitting(true);
        try {
            await invoke("add_folder", { path, id });
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
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h2>Add Folder</h2>

                <div className="input-group">
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Folder ID (Unique Name)</label>
                    <input
                        type="text"
                        value={id}
                        onChange={(e) => setId(e.target.value)}
                        placeholder="e.g. MyMusicLibrary"
                        style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
                    />
                </div>

                <div className="input-group">
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Folder Path</label>
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
                        disabled={!path || !id || isSubmitting}
                    >
                        {isSubmitting ? "Adding..." : "Add Folder"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AddFolder;
