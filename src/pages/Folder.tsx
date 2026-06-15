import { useEffect, useState, useMemo } from "react";
import { 
    Folder, 
    DownloadTrackElement, 
    SpotifyTrackElement, 
    OrphanFileElement, 
    YoutubeTrack, 
    LocalTrack,
    DownloadTrackAction, 
    DownloadTrackStatus 
} from "../structures";
import { invoke } from "@tauri-apps/api/core";
import { getSafeName } from "../utils/filename";
import { FolderHeader } from "../components/FolderHeader";
import { InitialTrackList } from "../components/InitialTrackList";
import { YoutubeTrackList } from "../components/YoutubeTrackList";

interface FolderProps {
    folder: Folder;
    onBack: () => void;
    onError: (message: string) => void;
}

function FolderPage({ folder, onBack, onError }: FolderProps) {
    const [elements, setElements] = useState<DownloadTrackElement[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const spotifyElements = useMemo(() => elements.filter(el => el instanceof SpotifyTrackElement) as SpotifyTrackElement[], [elements]);
    const orphanElements = useMemo(() => elements.filter(el => el instanceof OrphanFileElement) as OrphanFileElement[], [elements]);

    const initializeElements = (tracks = folder.tracks, localFiles: LocalTrack[] = []) => {
        const localFileNames = new Set(localFiles.map(f => f.name.toLowerCase()));
        const matchedLocalNames = new Set<string>();

        const spotifyElements = tracks.map(track => {
            const safeName = getSafeName(track.title).toLowerCase();
            const element = new SpotifyTrackElement(track);
            
            if (localFileNames.has(safeName)) {
                element.status = DownloadTrackStatus.Downloaded;
                element.action = DownloadTrackAction.NotDownload;
                matchedLocalNames.add(safeName);
            }
            
            return element;
        });

        const orphanElements = localFiles
            .filter(f => !matchedLocalNames.has(f.name.toLowerCase()))
            .map(f => new OrphanFileElement(f.name));

        setElements([...spotifyElements, ...orphanElements]);
    };

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                if (folder.tracks.length === 0) {
                    await folder.loadTracks();
                }
                const localFiles = await invoke<LocalTrack[]>("list_files", { folderPath: folder.path });
                initializeElements(folder.tracks, localFiles);
            } catch (err) {
                onError(String(err));
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, []);

    const handleLoadYoutube = () => {
        if (spotifyElements.length > 0) {
            setIsLoading(true);
            invoke<YoutubeTrack[]>("get_playlist_youtube_tracks", { tracks: spotifyElements.map(e => e.track) })
                .then((youtubeTracks) => {
                    const updatedElements = elements.map((el) => {
                        if (el instanceof SpotifyTrackElement) {
                            const spotifyIdx = spotifyElements.indexOf(el);
                            el.youtubeTrack = youtubeTracks[spotifyIdx];
                        }
                        return el;
                    });
                    setElements([...updatedElements]);
                }).catch(err => {
                    onError(String(err));
                }).finally(() => {
                    setIsLoading(false);
                })
        }
    };

    const handleReload = () => {
        setIsLoading(true);
        Promise.all([
            folder.loadTracks(),
            invoke<LocalTrack[]>("list_files", { folderPath: folder.path })
        ]).then(([_, localFiles]) => {
            initializeElements(folder.tracks, localFiles);
        }).catch((err) => {
            onError(String(err));
        }).finally(() => {
            setIsLoading(false);
        })
    };

    const handleDownload = async () => {
        const toDownload = spotifyElements.filter(e => e.action === DownloadTrackAction.Download && e.youtubeTrack);
        
        if (toDownload.length === 0) {
            return;
        }

        setIsLoading(true);
        try {
            for (const el of toDownload) {
                await invoke("download_video", { 
                    url: el.youtubeTrack!.url, 
                    folderPath: folder.path 
                });
                el.status = DownloadTrackStatus.Downloaded;
                el.action = DownloadTrackAction.NotDownload;
            }
            setElements([...elements]);
        } catch (err) {
            onError(String(err));
        } finally {
            setIsLoading(false);
        }
    };

    const handleActionToggle = (index: number) => {
        const updatedElements = [...elements];
        const el = updatedElements[index];
        
        if (el instanceof SpotifyTrackElement) {
            el.action = el.action === DownloadTrackAction.Download ? DownloadTrackAction.NotDownload : DownloadTrackAction.Download;
        } else if (el instanceof OrphanFileElement) {
            el.action = el.action === DownloadTrackAction.Delete ? DownloadTrackAction.NotDownload : DownloadTrackAction.Delete;
        }
        
        setElements(updatedElements);
    };

    const getStatusClass = (status: DownloadTrackStatus) => {
        switch (status) {
            case DownloadTrackStatus.Downloaded: return "status-downloaded";
            case DownloadTrackStatus.NotDownloaded: return "status-not-downloaded";
            case DownloadTrackStatus.NotInPlaylist: return "status-not-in-playlist";
            default: return "status-not-downloaded";
        }
    };

    const hasYoutubeResults = useMemo(() => 
        spotifyElements.some(e => e.youtubeTrack), 
    [spotifyElements]);

    const showDownloadBtn = useMemo(() => 
        hasYoutubeResults,
    [hasYoutubeResults]);

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
                            getStatusClass={getStatusClass}
                        />
                    ) : (
                        <YoutubeTrackList 
                            elements={elements}
                            spotifyElements={spotifyElements}
                            orphanElements={orphanElements}
                            onToggleAction={handleActionToggle}
                            getStatusClass={getStatusClass}
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
