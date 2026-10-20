# Architecture
- Optional campaign history is assembled by a pure prompt helper shared by copied prompts and direct generation, so both paths use identical continuity.
- Campaign document text is extracted in the browser with lazy-loaded PDF and DOCX readers, avoiding document storage or new backend services.
- History and character context use separate validated localStorage memories containing text and extracted document contents; edits and removals persist on the same browser without account or cross-device syncing.
- Adventure and encounter lore lists persist separately in validated browser storage, including uploaded file contents and URLs, so reopening or switching tabs retains them.