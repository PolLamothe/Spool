import { RustPlaylist } from "../structures";
import PlaylistPreview from "./PlaylistPreview";

interface PlaylistsPreviewProps {
    playlists: RustPlaylist[];
    selectedId?: string;
    onSelect: (id: string) => void;
}

function PlaylistsPreview({ playlists, selectedId, onSelect }: PlaylistsPreviewProps) {
    return (
        <div className="playlists-preview-container" style={{
            maxHeight: '250px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
            backgroundColor: 'var(--bg-tertiary)',
            borderRadius: 'var(--border-radius-md)',
            border: '1px solid rgba(0, 0, 0, 0.3)',
            marginTop: '0.25rem'
        }}>
            {playlists.length === 0 ? (
                <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    No playlists found
                </div>
            ) : (
                playlists.map((playlist) => (
                    <PlaylistPreview 
                        key={playlist.id as string} 
                        playlist={playlist} 
                        isSelected={selectedId === (playlist.id as string)}
                        onClick={() => onSelect(playlist.id as string)}
                    />
                ))
            )}
        </div>
    );
}

export default PlaylistsPreview;
