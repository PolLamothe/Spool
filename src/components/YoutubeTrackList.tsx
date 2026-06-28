import { useMemo } from "react";
import { 
    DownloadTrackElement, 
    SpotifyTrackElement, 
    OrphanFileElement 
} from "../structures";
import { TrackRow } from "./TrackRow";

interface YoutubeTrackListProps {
    elements: DownloadTrackElement[];
    onToggleAction: (index: number) => void;
}

export function YoutubeTrackList({ 
    elements, 
    onToggleAction 
}: YoutubeTrackListProps) {
    const spotifyElements = useMemo(() => elements.filter(el => el instanceof SpotifyTrackElement) as SpotifyTrackElement[], [elements]);
    const orphanElements = useMemo(() => elements.filter(el => el instanceof OrphanFileElement) as OrphanFileElement[], [elements]);
    return (
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
                                onToggleAction={onToggleAction}
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
                                        onToggleAction={onToggleAction}
                                    />
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </>
    );
}
