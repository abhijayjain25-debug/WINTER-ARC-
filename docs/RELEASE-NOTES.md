# Winter Arc v0.1.0 beta.2 — college handbook imports

A free, open-source study basecamp with winter pixel art and companions that evolve as you earn study XP. Customize it for entrance exams, college, or your own course.

**Try it now:** https://wintercarc.vercel.app/

## New in beta.2

- PDF imports up to 100 MB and 1,000 pages; Word up to 25 MB.
- Suggested year/semester sections and course titles from common headings and codes.
- Editable previews per course; import one semester or selected courses across all sections.
- Filter common filler and recover the full extracted text using manual review.
- Import selected courses atomically, with duplicate skipping and source references. Existing study data and XP stay intact.
- Reading progress and cancellation; tested a synthetic 120-page, 11 MB PDF, Word documents and a 390-pixel phone preview.

Detection uses local rules and needs review. Scanned PDFs still need OCR elsewhere. No external AI, file uploads or new database.

## Included

- Editable syllabus, subjects, exams, weekly roadmap, practice checks, and mock analysis.
- On-device PDF / Word `.docx` / text syllabus imports with review before saving.
- Custom focus timers, completion chime, daily/lifetime study time, XP, ranks, achievements, and companion evolutions.
- Workout logs, measurable weekly goals, and optional earned rewards.
- Dark/light winter themes, snow, phone navigation, large touch controls, and reduced-motion support.
- User-selected JSON file autosave where supported, or local browser storage with export/restore backups.

## Run locally

Download and extract **Winter-Arc-v0.1.0-beta.1.zip**. Install a current Node.js LTS release. Windows: open `Winter Arc/Start Winter Arc.cmd`. Other systems: run `node server.cjs` inside `Winter Arc/` and open http://127.0.0.1:47827. No `npm install`, database, API keys, or account needed.

New users choose their own name and a blank or optional JEE/law template. The ZIP contains no owner's study progress.

## Beta limits

- Phone layouts were checked at six screen sizes; broader real-device testing is still needed.
- This is a website/local web app, not an APK or an installable PWA.
- Browser storage can be erased when site data is cleared. Keep downloaded backups. There is no automatic cross-device sync.
- Background/locked-device timer sounds are not guaranteed. Finish & log study manually when you return.
- Scanned PDFs need OCR elsewhere. Complex document formatting may need manual cleanup.
- Optional anime companions are unofficial fan art; character rights remain with their owners. Original project code/art and third-party document readers have the licenses documented in the repository.

Validation: progression, storage, duplicate/reward protection, imports, keyboard behavior, static build, real file-write checks, and responsive page checks.

Please report issues with device/browser details and reproducible steps. Do not attach private planner files. If this helps your study season, a GitHub star is appreciated.
