import { RustPlaylist } from "../structures";

interface PlaylistPreviewProps {
    playlist: RustPlaylist;
    onClick?: () => void;
    isSelected?: boolean;
}

function PlaylistPreview({ playlist, onClick, isSelected }: PlaylistPreviewProps) {
    return (
        <div 
            className={`playlist-card ${isSelected ? 'selected' : ''}`} 
            onClick={onClick}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '0.75rem',
                borderRadius: 'var(--border-radius-md)',
                backgroundColor: isSelected ? 'var(--active-bg)' : 'transparent',
                cursor: 'pointer',
                transition: 'background-color var(--transition-speed) ease',
                border: isSelected ? '1px solid var(--accent-color)' : '1px solid transparent'
            }}
        >
            <div className="playlist-image" style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--border-radius-sm)',
                overflow: 'hidden',
                backgroundColor: 'var(--bg-tertiary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
            }}>
                {playlist.image_url ? (
                    <img src={playlist.image_url as string} alt={playlist.name as string} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                    <div className="playlist-placeholder" style={{ color: 'var(--text-muted)' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 18V5l12-2v13"></path>
                            <circle cx="6" cy="18" r="3"></circle>
                            <circle cx="18" cy="16" r="3"></circle>
                        </svg>
                    </div>
                )}
            </div>
            <div className="playlist-info" style={{ flex: 1, overflow: 'hidden' }}>
                <p className="playlist-name" style={{ margin: 0, fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {playlist.name}
                </p>
                <p className="playlist-id" style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {playlist.id}
                </p>
            </div>
        </div>
    );
}

export default PlaylistPreview;
