import { useState } from 'react';
import { Settings } from '../types';

interface Props {
  initial: Settings | null;
  onSave: (s: Settings) => void;
  onClose: () => void;
}

export function SettingsPanel({ initial, onSave, onClose }: Props) {
  const [token, setToken] = useState(initial?.token ?? '');
  const [owner, setOwner] = useState(initial?.owner ?? '');
  const [repo, setRepo] = useState(initial?.repo ?? '');
  const [path, setPath] = useState(initial?.path ?? 'journal.json');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ token: token.trim(), owner: owner.trim(), repo: repo.trim(), path: path.trim() || 'journal.json' });
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>GitHub Sync Settings</h2>
        <form onSubmit={submit}>
          <label>
            Personal access token
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="github_pat_..."
              required
            />
          </label>
          <label>
            Repo owner (user or org)
            <input
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              placeholder="octocat"
              required
            />
          </label>
          <label>
            Repo name
            <input
              value={repo}
              onChange={(e) => setRepo(e.target.value)}
              placeholder="my-journal"
              required
            />
          </label>
          <label>
            Data file path
            <input
              value={path}
              onChange={(e) => setPath(e.target.value)}
              placeholder="journal.json"
            />
          </label>
          <div className="modal-actions">
            <button type="button" className="btn secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn">
              Save
            </button>
          </div>
        </form>
        <p className="hint">
          Use a fine-grained token scoped to this repo with Contents: Read and
          write permission. The token is stored in this browser's localStorage.
        </p>
      </div>
    </div>
  );
}
