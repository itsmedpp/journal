import { JournalData } from '../types';

interface Props {
  data: JournalData;
  onClose: () => void;
}

export function NotesHistory({ data, onClose }: Props) {
  const entries = Object.entries(data.days)
    .filter(([, d]) => d.notes && d.notes.trim().length > 0)
    .sort(([a], [b]) => b.localeCompare(a));

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
        <h2>Notes History</h2>
        {entries.length === 0 && <p className="hint">No notes yet.</p>}
        <div className="notes-list">
          {entries.map(([date, d]) => (
            <div key={date} className="note-entry">
              <div className="note-date">{date}</div>
              <div className="note-text">{d.notes}</div>
            </div>
          ))}
        </div>
        <div className="modal-actions">
          <button type="button" className="btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
