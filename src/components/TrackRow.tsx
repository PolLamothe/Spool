import { 
    DownloadTrackElement, 
    SpotifyTrackElement, 
    OrphanFileElement, 
    DownloadTrackAction, 
    DownloadTrackStatus 
} from "../structures";

interface TrackRowProps {
    el: DownloadTrackElement;
    index: number;
    hasYoutubeResults: boolean;
    onToggleAction: (index: number) => void;
    getStatusClass: (status: DownloadTrackStatus) => string;
    hideYoutubeColumn?: boolean;
}

/**
 * Sub-component for a single track row
 */
export function TrackRow({ 
    el, 
    index, 
    hasYoutubeResults, 
    onToggleAction,
    getStatusClass,
    hideYoutubeColumn = false
}: TrackRowProps) {
    const isSpotify = el instanceof SpotifyTrackElement;
    const isOrphan = el instanceof OrphanFileElement;

    return (
        <tr className="track-row">
            <td className="track-num">{index + 1}</td>
            
            {/* Spotify Info / Filename */}
            <td className="track-title-cell">
                <div className="track-info-flex">
                    {isSpotify && (
                        <>
                            {el.track.image_url && <img src={el.track.image_url} alt={el.track.title} className="track-mini-image" />}
                            <div>
                                <p className="track-name">{el.track.title}</p>
                                <p className="track-artist">{el.track.name}</p>
                            </div>
                        </>
                    )}
                    {isOrphan && (
                        <>
                            <div className="orphan-icon">⚠️</div>
                            <div>
                                <p className="track-name">{el.filename}</p>
                                <p className="track-artist text-muted">Orphan file (Not in playlist)</p>
                            </div>
                        </>
                    )}
                </div>
            </td>

            {hasYoutubeResults ? (
                <>
                    {/* YouTube Result */}
                    {!hideYoutubeColumn && (
                        <td className="track-youtube-cell">
                            {isSpotify && el.youtubeTrack ? (
                                <div className="track-info-flex">
                                    {el.youtubeTrack.thumbnail && <img src={el.youtubeTrack.thumbnail} alt={el.youtubeTrack.title} className="track-mini-image" />}
                                    <div>
                                        <p className="track-name">{el.youtubeTrack.title}</p>
                                        <div className="track-yt-meta">
                                            <span className="track-artist">{el.youtubeTrack.channel}</span>
                                            <a href={el.youtubeTrack.url} target="_blank" rel="noopener noreferrer" className="track-url">View</a>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <span className="text-muted">{isOrphan ? "N/A" : "No result found"}</span>
                            )}
                        </td>
                    )}

                    {/* Action Toggle */}
                    <td className="track-download-cell">
                        <label className="switch">
                            <input 
                                type="checkbox" 
                                checked={el.action === DownloadTrackAction.Download || el.action === DownloadTrackAction.Delete} 
                                onChange={() => onToggleAction(index)}
                            />
                            <span className="slider"></span>
                        </label>
                    </td>

                    {/* Status */}
                    <td className="track-status-cell">
                        <span className={`status-tag ${getStatusClass(el.status)}`}>{el.status}</span>
                    </td>
                </>
            ) : (
                <>
                    {/* Simple view: Album & Duration */}
                    {isSpotify ? (
                        <>
                            <td className="track-album">{el.track.album}</td>
                            <td className="track-duration">
                                {Math.floor(el.track.duration / 60000)}:{String(Math.floor((el.track.duration % 60000) / 1000)).padStart(2, '0')}
                            </td>
                        </>
                    ) : (
                        <>
                            <td className="track-album text-muted">N/A</td>
                            <td className="track-duration text-muted">N/A</td>
                        </>
                    )}
                </>
            )}
        </tr>
    );
}
