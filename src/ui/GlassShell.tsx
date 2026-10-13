import { useState, type FormEvent, type ReactNode } from 'react';

/** Stage 1 garden UI. Thought entry works locally; persistence and plant growth come later. */

const icon = (children: ReactNode) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);

const NAV: { label: string; icon: ReactNode }[] = [
  { label: 'Home', icon: icon(<path d="M4 11l8-7 8 7v8a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z" />) },
  { label: 'Library', icon: icon(<path d="M5 4h5v16H5zM10 4h5v16h-5zM16 6l4 1-3 13-4-1" />) },
  { label: 'Create', icon: icon(<path d="M12 5v14M5 12h14" />) },
  { label: 'Talk', icon: icon(<path d="M5 5h14a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1h-8l-5 4v-4H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z" />) },
  { label: 'Grow', icon: icon(<path d="M12 21V11m0 0c0-4 3-6 8-6 0 4-3 6-8 6zm0 4c0-3-2-5-7-5 0 3 2 5 7 5z" />) },
  { label: 'Memories', icon: icon(<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />) },
  { label: 'Settings', icon: icon(<path d="M5 7h9M18 7h1M5 17h1M10 17h9M14 5v4M8 15v4" />) },
];

const ACTIVE = 'Grow';
const CHIPS = ['Thought', 'Memory', 'Happy', 'Sad', 'Idea', 'Dream', 'Random'];

export default function GlassShell() {
  const [thought, setThought] = useState('');
  const [latestThought, setLatestThought] = useState('');
  const [notice, setNotice] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = thought.trim();
    if (!value) {
      setNotice('Write a thought first.');
      return;
    }
    setLatestThought(value);
    setThought('');
    setNotice('Your thought is taking root in the garden.');
    window.dispatchEvent(new CustomEvent('garden:thought-seed', { detail: { text: value } }));
  }

  return (
    <div className="shell">
      <header className="hero">
        <h1>Twisha's Garden</h1>
        <p>Every thought is a seed. Let it grow.</p>
      </header>

      <nav className="glass rail" aria-label="Garden sections (preview)">
        <ul>
          {NAV.map((item) => (
            <li key={item.label}>
              <button
                type="button"
                className="nav-item"
                disabled
                aria-current={item.label === ACTIVE ? 'page' : undefined}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <aside className="glass growth" aria-label="Growth card (preview)">
        <span className="tag">Preview</span>
        <h2>Your thought is growing…</h2>
        <div className="bar" aria-hidden="true"><span /></div>
        <p>Sample card. Real growth starts in a later stage.</p>
      </aside>

      <p className="quote">Small thoughts create the most beautiful gardens.</p>

      <div className="composer">
        <div className="chips" role="group" aria-label="Thought types (preview)">
          {CHIPS.map((c) => (
            <button key={c} type="button" className="glass chip" disabled>
              {c}
            </button>
          ))}
        </div>
        <form className="glass thought-form" onSubmit={handleSubmit}>
          <input
            type="text"
            value={thought}
            onChange={(event) => {
              setThought(event.target.value);
              if (notice) setNotice('');
            }}
            placeholder="Feed the plant with your imagination…"
            aria-label="Write a thought"
            autoComplete="off"
            maxLength={280}
            enterKeyHint="send"
          />
          <button type="submit" className="send" aria-label="Add thought">
            {icon(<path d="M5 12h13M13 6l6 6-6 6" />)}
          </button>
        </form>
        {notice && <p className="preview-note" role="status">{notice}</p>}
        {latestThought && (
          <div className="glass submitted-thought" aria-live="polite">
            <span className="tag">Latest thought</span>
            <p>{latestThought}</p>
          </div>
        )}
      </div>
    </div>
  );
}
