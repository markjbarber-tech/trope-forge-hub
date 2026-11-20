# Saved Adventures library ("My Adventures")

## What you get
- Each time you generate a campaign, one-shot or encounter, the PDF is saved online automatically, along with the story elements and settings that made it.
- A new **My Adventures** tab lists every saved item: title, type (Campaign / One-Shot / Encounter), date and the elements used.
- Each entry has buttons to **Download PDF**, **Copy link**, **Rename**, **Delete** and **Reuse elements** (loads the same elements back into the generator).
- There's no sign-in. The app keeps your list of links on this device, so you can find them easily. Each link is a long private address that nobody can guess.
- **Restore on another device:** an "Export list" / "Import list" button moves your saved links to your phone or another computer.

## Trade-offs to know
- Anyone who has a link can open that PDF, so only share the ones you mean to share.
- If you clear this browser's data without exporting your list, the PDFs are still online, but you lose the list of links. Export your list now and then as a backup.
- Delete removes the entry from your list. It also deletes the PDF itself, using a secret key that only this device keeps.

## Technical details
- Storage: a private Cloud storage bucket `adventure-pdfs`, plus a `saved_adventures` table (id uuid, kind, title, elements jsonb, settings jsonb, file_path, delete_token_hash, created_at). Browsers get no direct access to the table. Everything goes through edge functions:
  - `save-adventure`: receives the PDF (base64, max 10MB) and metadata, validated with zod. It stores the file, creates the row, and returns `{id, deleteToken}`.
  - `get-adventure?id=`: returns the metadata plus a short-lived signed download URL.
  - `delete-adventure`: checks the delete token's hash, then removes the file and the row.
- `pdfGenerator.ts` returns the jsPDF Blob in addition to `doc.save()`. ExportPanel and EncounterExportPanel call a `saveAdventure()` helper after generating and show a "Saved to My Adventures" toast.
- Local index: a validated localStorage key `story-copilot-saved-adventures-v1` (id, title, kind, date, deleteToken). Export/Import uses a JSON file.
- Shareable route `/adventure/:id` opens a page showing the elements and a download button.
- The new tab goes into GeneratorTabs; AGENTS.md gets a rule for the storage approach; tests cover index validation and the delete-token check.
