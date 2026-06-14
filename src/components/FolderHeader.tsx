import { Folder } from "../structures";

interface FolderHeaderProps {
    folder: Folder;
    onBack: () => void;
    onReload: () => void;
    onLoadYoutube: () => void;
    onDownload: () => void;
    isLoading: boolean;
    itemCount: number;
    showDownloadBtn: boolean;
}

/**
 * Sub-component for the folder header
 */
export function FolderHeader({ 
    folder, 
    onBack, 
    onReload, 
    onLoadYoutube, 
    onDownload, 
    isLoading, 
    itemCount, 
    showDownloadBtn 
}: FolderHeaderProps) {
    return (
        <header className="folder-detail-header">
            <button className="back-btn" onClick={onBack}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="19" y1="12" x2="5" y2="12"></line>
                    <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
                Back to folders
            </button>
            <div className="folder-header-content">
                {folder.playlist?.image_url && (
                    <img src={folder.playlist.image_url} alt={folder.playlist.name} className="folder-large-image" />
                )}
                <div className="folder-header-text">
                    <h1>{folder.playlist?.name || "Unnamed Folder"}</h1>
                    <p className="folder-path-large">{folder.path}</p>
                    <div className="folder-stats-row">
                        <p className="folder-stats">{itemCount} items</p>
                        <div className="folder-actions">
                            <button className="secondary-btn" onClick={onReload} disabled={isLoading}>
                                {isLoading ? "Reloading..." : "Reload"}
                            </button>
                            <button className="primary-btn load-youtube-btn" onClick={onLoadYoutube} disabled={isLoading || itemCount === 0}>
                                {isLoading ? "Loading..." : "Load YouTube Tracks"}
                            </button>
                            {showDownloadBtn && (
                                <button className="primary-btn download-btn" onClick={onDownload} disabled={isLoading}>
                                    Download/Synchronize
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
