export default function MissingKey() {
  return (
    <div className="center-screen">
      <div className="card">
        <h1>KEnjine</h1>
        <p className="muted">Real-time collaborative whiteboard</p>
        <div className="notice">
          <strong>Liveblocks key needed.</strong>
          <p>
            This app uses Liveblocks (free tier) for real-time sync. Add your
            public key to enable collaboration:
          </p>
          <ol>
            <li>
              Create a free account at{" "}
              <a href="https://liveblocks.io" target="_blank" rel="noreferrer">
                liveblocks.io
              </a>
            </li>
            <li>
              Copy your project's <code>public</code> key (starts with{" "}
              <code>pk_</code>)
            </li>
            <li>
              For local dev: create a <code>.env</code> file with
              <pre>VITE_LIVEBLOCKS_PUBLIC_KEY=pk_xxx</pre>
            </li>
            <li>
              For GitHub Pages: add it as a repo secret named{" "}
              <code>VITE_LIVEBLOCKS_PUBLIC_KEY</code> (see README)
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
