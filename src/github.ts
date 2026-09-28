import { JournalData, Settings } from './types';

const API = 'https://api.github.com';

function b64encode(str: string): string {
  return btoa(unescape(encodeURIComponent(str)));
}

function b64decode(b64: string): string {
  return decodeURIComponent(escape(atob(b64)));
}

async function ghFetch(url: string, token: string, init?: RequestInit) {
  const res = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(init?.headers ?? {}),
    },
  });
  return res;
}

function contentsUrl(s: Settings): string {
  return `${API}/repos/${encodeURIComponent(s.owner)}/${encodeURIComponent(
    s.repo
  )}/contents/${s.path.split('/').map(encodeURIComponent).join('/')}`;
}

export interface LoadedFile {
  data: JournalData;
  sha: string | null;
}

export async function loadJournal(s: Settings): Promise<LoadedFile> {
  const res = await ghFetch(contentsUrl(s), s.token);
  if (res.status === 404) {
    return { data: { calorieGoal: null, days: {} }, sha: null };
  }
  if (!res.ok) {
    throw new Error(`GitHub load failed: ${res.status} ${await res.text()}`);
  }
  const json = await res.json();
  const text = b64decode((json.content as string).replace(/\n/g, ''));
  const parsed = JSON.parse(text) as Partial<JournalData>;
  return {
    data: {
      calorieGoal: parsed.calorieGoal ?? null,
      days: parsed.days ?? {},
    },
    sha: json.sha as string,
  };
}

export async function saveJournal(
  s: Settings,
  data: JournalData,
  sha: string | null,
  attempt = 0
): Promise<string> {
  const body: Record<string, unknown> = {
    message: `journal: update ${new Date().toISOString().slice(0, 10)}`,
    content: b64encode(JSON.stringify(data, null, 2)),
  };
  if (sha) body.sha = sha;

  const res = await ghFetch(contentsUrl(s), s.token, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (res.status === 409 && attempt < 2) {
    const fresh = await loadJournal(s);
    return saveJournal(s, data, fresh.sha, attempt + 1);
  }
  if (!res.ok) {
    throw new Error(`GitHub save failed: ${res.status} ${await res.text()}`);
  }
  const json = await res.json();
  return json.content.sha as string;
}
