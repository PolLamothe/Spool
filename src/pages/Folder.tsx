import { Folder } from "../structures";

interface FolderProps {
    folder: Folder;
    onBack: () => void;
}

function FolderPage({ folder, onBack }: FolderProps) {
    return (
        <div className="folder-detail">
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
                        <p className="folder-stats">{folder.tracks.length} tracks</p>
                    </div>
                </div>
            </header>

            <div className="track-list-container">
                <table className="track-table">
                    <thead>
                        <tr>
                            <th className="track-num">#</th>
                            <th className="track-title">Title</th>
                            <th className="track-album">Album</th>
                            <th className="track-year">Year</th>
                            <th className="track-duration">Duration</th>
                        </tr>
                    </thead>
                    <tbody>
                        {folder.tracks.map((track, index) => (
                            <tr key={index} className="track-row">
                                <td className="track-num">{index + 1}</td>
                                <td className="track-title-cell">
                                    <div className="track-info-flex">
                                        {track.image_url && <img src={track.image_url} alt={track.title} className="track-mini-image" />}
                                        <div>
                                            <p className="track-name">{track.title}</p>
                                            <p className="track-artist">{track.name}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="track-album">{track.album}</td>
                                <td className="track-year">{track.year}</td>
                                <td className="track-duration">
                                    {Math.floor(track.duration / 60000)}:{String(Math.floor((track.duration % 60000) / 1000)).padStart(2, '0')}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {folder.tracks.length === 0 && (
                    <div className="empty-tracks">
                        <p>No tracks found in this folder.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default FolderPage;