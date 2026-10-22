# Architecture
- Embed the latest code commit's committer timestamp through Vite for the header; this tracks the displayed version on both hosts without confusing external CSV updates with app updates or depending on GitHub API access.
- Select the deployment base through GITHUB_PAGES in CI; Lovable uses the root while GitHub Pages uses the repository path so published assets load on both hosts.
- Optional campaign history is assembled by a pure prompt helper shared by copied prompts and direct generation, so both paths use identical continuity.
- Campaign document text is extracted in the browser with lazy-loaded PDF and DOCX readers, avoiding document storage or new backend services.
- History and character context use separate validated localStorage memories containing text and extracted document contents; edits and removals persist on the same browser without account or cross-device syncing.
- Adventure and encounter lore lists persist separately in validated browser storage, including uploaded file contents and URLs, so reopening or switching tabs retains them.
- Both lore URL forms share a debounced title reader; public HTML metadata is read by a bounded, IP-pinned HTTPS edge function, while inaccessible/Google titles require an optional override until per-user Google access is configured.
- Lore URL additions use a shared title resolver with a hostname fallback, so unavailable automatic titles never make an override mandatory.- After any dependency change, refresh package-lock.json (npm install --package-lock-only): the GitHub Pages workflow runs npm ci and fails on a stale lockfile.
