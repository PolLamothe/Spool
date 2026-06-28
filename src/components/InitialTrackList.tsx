import { 
    DownloadTrackElement 
} from "../structures";
import { TrackRow } from "./TrackRow";

interface InitialTrackListProps {
    elements: DownloadTrackElement[];
    onToggleAction: (index: number) => void;
}

export function InitialTrackList({ 
    elements, 
    onToggleAction 
}: InitialTrackListProps) {
    return (
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
                        onToggleAction={onToggleAction}
                    />
                ))}
            </tbody>
        </table>
    );
}
