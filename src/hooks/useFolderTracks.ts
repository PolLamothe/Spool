import { useEffect, useState, useMemo, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import { 
    Folder, 
    DownloadTrackElement, 
    SpotifyTrackElement, 
    OrphanFileElement, 
    YoutubeTrack, 
    LocalTrack,
    Track,
    DownloadTrackAction, 
    DownloadTrackStatus 
} from "../structures";
import { getSafeName } from "../utils/filename";

/**
 * Pure helper function to map Spotify tracks, local files, and YouTube matches
 * into a single unified list of DownloadTrackElement objects for display and action.
 */
function buildTrackElements(
    tracks: Track[],
    localFiles: LocalTrack[],
    existingElements: DownloadTrackElement[],
    youtubeTracks?: (YoutubeTrack | undefined)[]
): DownloadTrackElement[] {
    const localFileNames = new Set(localFiles.map(f => f.name.toLowerCase()));
    const matchedLocalNames = new Set<string>();

    // Determine if YouTube results are already loaded in state or passed now
    const hasYoutube = youtubeTracks !== undefined || existingElements.some(
        el => el instanceof SpotifyTrackElement && el.youtubeTrack
    );

    const spotifyElements = tracks.map((track, idx) => {
        const element = new SpotifyTrackElement(track);
        
        // Find if there's already a YouTube track assigned to this Spotify track
        const existingElement = existingElements.find(
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
            matchedLocalNames.add(ytSafeName.toLowerCase());
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

    // Orphan files are only populated and shown if YouTube tracks have been loaded
    const orphanElements = hasYoutube
        ? localFiles
            .filter(f => !matchedLocalNames.has(f.name.toLowerCase()))
            .map(f => new OrphanFileElement(f.name))
        : [];

    return [...spotifyElements, ...orphanElements];
}

/**
 * Custom hook to manage tracks state, loading status, YouTube lookups, reloads,
 * file downloading, and user preference action toggles for a given Folder.
 */
export function useFolderTracks(folder: Folder, onError: (message: string) => void) {
    const [elements, setElements] = useState<DownloadTrackElement[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [localFiles, setLocalFiles] = useState<LocalTrack[]>([]);

    const spotifyElements = useMemo(() => 
        elements.filter((el): el is SpotifyTrackElement => el instanceof SpotifyTrackElement),
        [elements]
    );

    const hasYoutubeResults = useMemo(() => 
        spotifyElements.some(e => e.youtubeTrack), 
        [spotifyElements]
    );

    const showDownloadBtn = useMemo(() => 
        hasYoutubeResults,
        [hasYoutubeResults]
    );

    // Initial data fetch
    useEffect(() => {
        let isMounted = true;
        const loadData = async () => {
            setIsLoading(true);
            try {
                if (folder.tracks.length === 0) {
                    await folder.loadTracks();
                }
                const files = await invoke<LocalTrack[]>("list_files", { folderPath: folder.path });
                if (isMounted) {
                    setLocalFiles(files);
                    setElements(prev => buildTrackElements(folder.tracks, files, prev));
                }
            } catch (err) {
                if (isMounted) {
                    onError(String(err));
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };
        loadData();
        return () => {
            isMounted = false;
        };
    }, [folder, onError]);

    const handleLoadYoutube = useCallback(() => {
        if (spotifyElements.length > 0) {
            setIsLoading(true);
            invoke<YoutubeTrack[]>("get_playlist_youtube_tracks", { 
                tracks: spotifyElements.map(e => e.track) 
            })
            .then((youtubeTracks) => {
                setElements(prev => buildTrackElements(folder.tracks, localFiles, prev, youtubeTracks));
            })
            .catch(err => {
                onError(String(err));
            })
            .finally(() => {
                setIsLoading(false);
            });
        }
    }, [folder.tracks, localFiles, spotifyElements, onError]);

    const handleReload = useCallback(() => {
        setIsLoading(true);
        Promise.all([
            folder.loadTracks(),
            invoke<LocalTrack[]>("list_files", { folderPath: folder.path })
        ])
        .then(([_, files]) => {
            setLocalFiles(files);
            setElements(prev => buildTrackElements(folder.tracks, files, prev));
        })
        .catch((err) => {
            onError(String(err));
        })
        .finally(() => {
            setIsLoading(false);
        });
    }, [folder, onError]);

    const handleDownload = useCallback(async () => {
        const toDownload = spotifyElements.filter(
            e => e.action === DownloadTrackAction.Download && e.youtubeTrack
        );
        
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
            setElements(prev => buildTrackElements(folder.tracks, files, prev, currentYoutubeTracks));
        } catch (err) {
            onError(String(err));
        } finally {
            setIsLoading(false);
        }
    }, [folder, spotifyElements, onError]);

    const handleActionToggle = useCallback((index: number) => {
        setElements(prev => {
            const updatedElements = [...prev];
            const el = updatedElements[index];
            
            if (el instanceof SpotifyTrackElement) {
                el.action = el.action === DownloadTrackAction.Download 
                    ? DownloadTrackAction.NotDownload 
                    : DownloadTrackAction.Download;
            } else if (el instanceof OrphanFileElement) {
                el.action = el.action === DownloadTrackAction.Delete 
                    ? DownloadTrackAction.NotDownload 
                    : DownloadTrackAction.Delete;
            }
            return updatedElements;
        });
    }, []);

    return {
        elements,
        isLoading,
        hasYoutubeResults,
        showDownloadBtn,
        handleLoadYoutube,
        handleReload,
        handleDownload,
        handleActionToggle
    };
}
