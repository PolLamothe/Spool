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
    const [localFiles, setLocalFiles] = useState<LocalTrack[]>([]);

    const spotifyElements = useMemo(() => elements.filter(el => el instanceof SpotifyTrackElement) as SpotifyTrackElement[], [elements]);
    const orphanElements = useMemo(() => elements.filter(el => el instanceof OrphanFileElement) as OrphanFileElement[], [elements]);

    const initializeElements = (
        tracks = folder.tracks, 
        files = localFiles, 
        youtubeTracks?: (YoutubeTrack | undefined)[]
    ) => {
        const localFileNames = new Set(files.map(f => f.name.toLowerCase()));
        const matchedLocalNames = new Set<string>();

        // Check if we have YouTube results loaded (either passed now or existing)
        const hasYoutube = youtubeTracks !== undefined || elements.some(el => el instanceof SpotifyTrackElement && el.youtubeTrack);

        const spotifyElements = tracks.map((track, idx) => {
            const element = new SpotifyTrackElement(track);
            
            // Find if there's already a YouTube track assigned to this Spotify track
            const existingElement = elements.find(
                (el): el is SpotifyTrackElement => 
                    el instanceof SpotifyTrackElement && 
                    el.track.title === track.title && 
                    el.track.name === track.name
            );
            const ytTrack = youtubeTracks ? youtubeTracks[idx] : existingElement?.youtubeTrack;
            
            if (ytTrack) {
                element.youtubeTrack = ytTrack;
            }

            const spotifySafeName = getSafeName(track.title).toLowerCase();
            const ytSafeName = ytTrack ? getSafeName(ytTrack.title).toLowerCase() : "";

            let isDownloaded = false;
            if (localFileNames.has(spotifySafeName)) {
                isDownloaded = true;
                matchedLocalNames.add(spotifySafeName);
            }
            if (ytSafeName && localFileNames.has(ytSafeName)) {
                isDownloaded = true;
                matchedLocalNames.add(ytSafeName.toLocaleLowerCase());
            }

            if (isDownloaded) {
                element.status = DownloadTrackStatus.Downloaded;
                element.action = DownloadTrackAction.NotDownload;
            } else {
                element.status = DownloadTrackStatus.NotDownloaded;
                element.action = DownloadTrackAction.Download;
            }
            
            return element;
        });

        // Orphans are only populated and shown if YouTube tracks have been loaded
        const orphanElements = hasYoutube
            ? files
                .filter(f => !matchedLocalNames.has(f.name.toLowerCase()))
                .map(f => new OrphanFileElement(f.name))
            : [];

        setElements([...spotifyElements, ...orphanElements]);
    };

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                if (folder.tracks.length === 0) {
                    await folder.loadTracks();
                }
                const files = await invoke<LocalTrack[]>("list_files", { folderPath: folder.path });
                setLocalFiles(files);
                initializeElements(folder.tracks, files);
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
                    initializeElements(folder.tracks, localFiles, youtubeTracks);
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
        ]).then(([_, files]) => {
            setLocalFiles(files);
            initializeElements(folder.tracks, files);
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
            }
            const files = await invoke<LocalTrack[]>("list_files", { folderPath: folder.path });
            setLocalFiles(files);
            const currentYoutubeTracks = spotifyElements.map(e => e.youtubeTrack);
            initializeElements(folder.tracks, files, currentYoutubeTracks);
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
