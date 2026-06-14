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
import { TrackRow } from "../components/TrackRow";

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
        hasYoutubeResults || orphanElements.length > 0,
    [hasYoutubeResults, orphanElements]);

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
                        <table className="track-table">
                            <thead>
                                <tr>
                                    <th className="track-num">#</th>
                                    <th className="track-spotify">Track Info</th>
                                    <th className="track-album">Album</th>
                                    <th className="track-duration">Duration</th>
                                </tr>
                            </thead>
                            <tbody>
                                {elements.map((el, index) => (
                                    <TrackRow 
                                        key={index}
                                        el={el}
                                        index={index}
                                        hasYoutubeResults={false}
                                        onToggleAction={handleActionToggle}
                                        getStatusClass={getStatusClass}
                                    />
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <>
                            <table className="track-table">
                                <thead>
                                    <tr>
                                        <th className="track-num">#</th>
                                        <th className="track-spotify">Track Info</th>
                                        <th className="track-youtube">YouTube Result</th>
                                        <th className="track-download">Download</th>
                                        <th className="track-status">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {spotifyElements.map((el) => {
                                        const originalIndex = elements.indexOf(el);
                                        return (
                                            <TrackRow 
                                                key={originalIndex}
                                                el={el}
                                                index={originalIndex}
                                                hasYoutubeResults={true}
                                                onToggleAction={handleActionToggle}
                                                getStatusClass={getStatusClass}
                                            />
                                        );
                                    })}
                                </tbody>
                            </table>

                            {orphanElements.length > 0 && (
                                <div className="orphan-tracks-section" style={{ marginTop: '3rem' }}>
                                    <div className="section-header" style={{ marginBottom: '1rem', padding: '0 1rem' }}>
                                        <h3 style={{ margin: 0, color: '#f23f43', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <span>⚠️</span> Orphan Files
                                        </h3>
                                        <p style={{ margin: '0.25rem 0 0 1.75rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                            These files are in your folder but not in the Spotify playlist.
                                        </p>
                                    </div>
                                    <table className="track-table">
                                        <thead>
                                            <tr>
                                                <th className="track-num">#</th>
                                                <th className="track-spotify">Filename</th>
                                                <th className="track-download">Download</th>
                                                <th className="track-status">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {orphanElements.map((el) => {
                                                const originalIndex = elements.indexOf(el);
                                                return (
                                                    <TrackRow 
                                                        key={originalIndex}
                                                        el={el}
                                                        index={originalIndex}
                                                        hasYoutubeResults={true}
                                                        hideYoutubeColumn={true}
                                                        onToggleAction={handleActionToggle}
                                                        getStatusClass={getStatusClass}
                                                    />
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </>
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
