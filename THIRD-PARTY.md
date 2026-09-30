# Bundled document readers

These files are copied from official npm releases, pinned to the versions below, and loaded from this site's own assets only when importing a syllabus. Document contents are processed on the user's device. The app extracts text, does not render document HTML, and does not run PDF scripts.

- **PDF.js / pdfjs-dist 6.3.289**, Mozilla, Apache License 2.0. Bundled files: `assets/pdf-reader.mjs`, `assets/pdf-worker.mjs`. License: [pdf-reader-LICENSE.txt](assets/pdf-reader-LICENSE.txt). Source and API: [mozilla/pdf.js](https://github.com/mozilla/pdf.js), [PDF.js documentation](https://mozilla.github.io/pdf.js/).
- **Mammoth 1.13.0**, Michael Williamson, BSD 2-Clause. Bundled standalone browser distribution: `assets/word-reader.js`. License: [word-reader-LICENSE.txt](assets/word-reader-LICENSE.txt). Source and API: [mwilliamson/mammoth.js](https://github.com/mwilliamson/mammoth.js). Its standalone distribution includes its upstream dependencies.

These third-party files retain their original licenses; the project's MIT license does not replace them. No npm installation is required to run or build Winter Arc. To update readers, fetch the official release, retain license notices, and rerun document-import and app checks.
