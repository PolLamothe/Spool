import { Folder } from "../structures";
import { FolderHeader } from "../components/FolderHeader";
import { InitialTrackList } from "../components/InitialTrackList";
import { YoutubeTrackList } from "../components/YoutubeTrackList";
import { useFolderTracks } from "../hooks/useFolderTracks";

interface FolderProps {
    folder: Folder;
    onBack: () => void;
    onError: (message: string) => void;
}

function FolderPage({ folder, onBack, onError }: FolderProps) {
    const {
        elements,
        isLoading,
        hasYoutubeResults,
        showDownloadBtn,
        handleLoadYoutube,
        handleReload,
        handleDownload,
        handleActionToggle
    } = useFolderTracks(folder, onError);

    return (
        <div className="folder-detail">
            <FolderHeader 
                folder={folder}
                onBack={onBack}
                onReload={handleReload}
                onLoadYoutube={handleLoadYoutube}
                onDownload={handleDownload}
                isLoading={isLoading}
                itemCount={elements.length}
                showDownloadBtn={showDownloadBtn}
            />

            <div className="folder-main-content">
                {isLoading && (
                    <div className="loading-overlay">
                        <div className="loader"></div>
                        <p>Loading tracks...</p>
                    </div>
                )}
                
                <div className={`track-list-container ${isLoading ? 'dimmed' : ''}`}>
                    {!hasYoutubeResults ? (
                        <InitialTrackList 
                            elements={elements}
                            onToggleAction={handleActionToggle}
                        />
                    ) : (
                        <YoutubeTrackList 
                            elements={elements}
                            onToggleAction={handleActionToggle}
                        />
                    )}
                    
                    {!isLoading && elements.length === 0 && (
                        <div className="empty-tracks">
                            <p>No tracks found in this folder.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default FolderPage;
