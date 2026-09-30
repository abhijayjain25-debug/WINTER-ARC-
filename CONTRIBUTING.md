# Contributing to Winter Arc

Fork the repository, make a focused change, run `node check.cjs` and `node build.cjs`, and open a pull request explaining the behavior and validation. No dependency install is required.

Keep local study files, backups, screenshots with private records, tokens and `.env` files out of commits. Use `?sandbox=1` for browser testing; it uses separate storage. A distinct name such as `?sandbox=my-test` creates another test workspace.

Preserve keyboard access, visible labels, light/dark themes and reduced motion. New state fields must validate safely and old backups must still load. XP should support honest study rather than encourage repeated clicks.

`app.js` renders the main study workspace; `profile.js` manages onboarding, customization and tutorial; `life.js` manages workouts and weekly goals; `core.js` validates data and computes progression; `disk.js` manages user-approved local files. `custom.js` holds companion metadata and profile parsers. `build.cjs` has an explicit public-file list.

`syllabus.js` reads documents on-device and validates reviewed topics. Its readers are bundled lazily; retain the licenses in [THIRD-PARTY.md](THIRD-PARTY.md). New parsers must not upload documents, render untrusted document HTML, or bypass the review step.

Good first contributions include reproducing phone layout problems, improving accessible labels, fixing confusing setup copy, and documenting a study workflow. Use the repository's issue templates for bugs and ideas. Discuss substantial features before implementing them. Test desktop and narrow-screen layouts, and keep the planner quick to use.

Public launch images and the feature tour use fictional demo data. Do not replace them with screenshots of your own private study records. [docs/LAUNCH-POSTS.md](docs/LAUNCH-POSTS.md) contains draft outreach copy; sharing it is optional and should follow the rules of each community.

Companion PNGs and banner PNG are AI-generated original assets for this project. Additional human companions are generated pixel artwork. Anime characters are unofficial fan art and belong to their respective owners; MIT does not grant ownership of those characters. Keep the MIT license notice when distributing modifications.
