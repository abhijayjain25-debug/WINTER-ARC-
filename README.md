# Winter Arc

A customizable, open-source study basecamp with winter pixel art, a focus timer, syllabus tracking, exam countdowns, workouts and weekly goals. Built with plain HTML, CSS and JavaScript. No accounts, database, API keys, analytics or runtime dependencies.

![Winter Arc landscape](assets/winter-banner.png)

## Use it locally

1. Download the repository using **Code → Download ZIP**, or clone it:
   ```sh
   git clone https://github.com/abhijayjain25-debug/WINTER-ARC-.git
   cd WINTER-ARC-
   ```
2. Install a current Node.js LTS release if needed. No `npm install` is required.
3. Windows: double-click **Start Winter Arc.cmd**. macOS/Linux/Windows terminal: run `node server.cjs` and open **http://127.0.0.1:47827**.
4. Choose a blank profile or the optional JEE + CLAT/AILET chapter template. Set your name and storage preference. Follow the guided tutorial, or select **Skip tutorial**. Replay it from Settings whenever needed.

The local server only listens on your own computer. Keep this folder together. Use the same local URL when returning. Directly opening `index.html` is not the supported storage flow; use the launcher/server or HTTPS hosting.

## Save on your machine

For new users in supported browsers, **Local JSON file** is the default storage preference. After setup, go to **Settings → Create planner file** and save `winter-arc.json` outside the source repository. Until a file is connected, the planner clearly shows that changes are only in memory. It warns before closing with unsaved work.

- Desktop Chrome or Edge: create or open a planner file. Changes autosave to that real file. Wait for **Saved to file** before closing.
- When returning, the app tries to reopen your file. If permission is needed, use **Reconnect saved file**. If you move the file or change browsers/site addresses, use **Open planner file** instead.
- File mode stores study records in your chosen file, including the timer snapshot. The browser remembers only the file handle/permission connection. If it cannot remember the handle, open the file manually next visit.
- Recovered timers are paused. A closed tab or sleeping device cannot run a completion notification.
- File saves are queued, and a file changed elsewhere is not silently overwritten. Keep one editing window per file. If a save fails, keep the tab open and export unsaved progress before reconnecting.
- Keep a second copy of your file. It contains your study records in readable JSON; treat it as a personal document.
- Other browsers: optional browser storage plus **Export backup / Restore backup**. Downloads are file backups, not direct autosave. Direct file access requires a supported browser and HTTPS or localhost.

Existing users keep their browser progress until they choose **Create planner file**. After the first successful file save, the planner removes that workspace's browser records. Existing JSON backups remain compatible. A hosted URL and your local URL have different browser storage; move progress using **Open planner file** or **Restore backup**.

No study records are uploaded to GitHub, Vercel or a shared database. Hosting serves the app assets. There is no automatic device sync. File access is limited to the file you choose through the browser picker. See [Chrome's File System Access documentation](https://developer.chrome.com/docs/capabilities/web-apis/file-system-access).

## Customize your basecamp

- **Subjects and exams:** Settings → Edit subjects & exams. Use any college course, entrance exam or skill track. Add up to 30 subjects and 20 exams. Each exam has its name, target date and maximum score. Keep names referenced by historical records; changing those would disconnect the history.
- **Syllabus:** Paste one topic per line into a selected subject, or add/edit individual topics in Study map. Duplicate names in that subject are skipped. Track notes, prerequisites, priorities, practice checks and review dates.
- **Mastery:** the latest two independent checks must each have at least 10 questions and 75% accuracy. A weak later check returns a topic to revision. This is a study milestone, not an exam-score guarantee.
- **Roadmap:** create editable weeks with work for each of your subjects. Basecamp suggests daily blocks from unfinished or due topics; change them to suit your workload.
- **Focus chamber:** choose 25, 30, 35, 40, 50 or 90 minutes, or custom whole minutes from 1 to 1440. Pause interruptions, then confirm actual study time and a work note. Log offline work without duplicating timer sessions.
- **Sound:** the four-note completion chime is enabled by default. Preview it with Test chime or mute it separately from level-up sounds. Keep the tab open, unmuted and your device awake.
- **Mock lab:** record your own exam or course test on its configured score scale, compare similar papers and analyse mistakes. Keep specific repairs in the reattempt queue.
- **Companions:** choose Frost, Pip, Flurry, Byte, Ember (burgundy), Aurora (purple), Summit (green), Sung Jinwoo, Naruto, Gojo, Ichigo or Asta. Levels 10 and 25 unlock new forms automatically: anime companions change sprites, while original companions gain stronger auras. These are progression milestones for the planner, not a complete retelling of the series. The companion shares your level; selection does not change your XP. Add your own art through `custom.js` and `assets/` when forking.
- **Appearance:** dark and light modes, glass surfaces, layered snowfall and gentle animations. The header snowflake toggles ambient motion. System reduced-motion preferences take priority. Quiet mode softens effects.
- **Field guide:** editable preparation notes. Blank profiles receive a general guide; the JEE/law template has its own chapter plan. Template dates must be checked against official timetables.

## Workouts and weekly goals

**Life & weekly goals** keeps optional activity separate from study focus. Log calisthenics, heavy weights, cardio or a rest day. Record actual active minutes and an optional note. A workout of at least 10 active minutes earns 25 XP, capped at 25 per day. Extra workouts remain in the log. Past entries and rest days earn no new XP. Rest has no penalty.

Set one measurable goal for Monday–Sunday: complete three chapters, follow a routine on five days, or finish any milestone. Choose a target, unit and clear completion criteria. For an all-or-nothing goal, use target **1** and unit **milestone**. Log progress during that week with a short account of the completed work. Once complete, claim **200 XP** and an optional reward you named. Weekly-goal XP is capped at 200 per calendar week; rewards cannot be claimed twice. The target is locked after the first progress log. Unfinished weeks stay visible without taking XP away.

Normal meals, sleep and ordinary breaks are unconditional. Rewards are optional extras such as a movie evening or additional leisure time. Progress logs are based on honest self-reporting; the app does not verify your workout or study work.

## XP rules

- Focus: 1 XP per active minute after at least 10 minutes, capped at 360/day.
- Daily blocks: 10 XP for each of the first three completions/day.
- Mock entry: 20 XP/day. Analysis: 40 XP each, capped at 80/day.
- Error reattempt: 5 XP each, capped at 20/day. Mastery: 40 XP once per topic.
- Workout: 25 XP/day maximum. Weekly goal: 200 XP/calendar week maximum.
- Backdated focus/workouts fill history without granting fresh XP.
- Each 10 lifetime XP gives one frost crystal. Reward redemptions spend crystals, not levels.
- Level thresholds: 100 × (level − 1)². A study streak requires 25 logged focus minutes/day. Missing a day removes no XP.

## Deploy without a database

The published app is entirely static. Each visitor gets their own file or optional browser workspace. You do not run `server.cjs` on a host; it is just the local launcher.

**Vercel**

1. Import this GitHub repository into a Vercel project.
2. Use the **Other** framework preset and repository root directory.
3. `vercel.json` sets the build command to `node build.cjs` and output directory to `dist`. No environment variables or database are required.
4. Deploy. Each user can open their local planner file from the HTTPS website.

**GitHub Pages**

1. In repository **Settings → Pages**, choose **GitHub Actions** as the source.
2. Under **Actions**, select **Deploy GitHub Pages** and run it for `main`.
3. It checks the app, builds a static `dist/` directory and publishes it. The workflow is manual so a code push does not unexpectedly deploy a site.
4. Use the URL reported by the deployment. All app assets use relative paths, including under a repository subpath.

`build.cjs` only copies an explicit list of app files/artwork. Personal JSON planner files, development scratch files and local server scripts are excluded from the deployed output. For hosting details, see [Vercel build configuration](https://vercel.com/docs/builds/configure-a-build) and [GitHub Pages documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages).

## Develop and contribute

Run `node check.cjs` for progression, schema, migration compatibility, custom profiles and real temporary-file persistence checks. Run `node build.cjs` to assemble static assets. Test UI using `?sandbox=1`; `?sandbox=your-test-name` creates another isolated test workspace. Never commit personal planner files or backups.

See [CONTRIBUTING.md](CONTRIBUTING.md). MIT licensed: fork it, customize it, share it and retain the license notice. The original banner and Frost PNG are AI-generated assets made for this project; the human companions use generated pixel art. Anime companions are unofficial fan art; their characters belong to their respective owners. The MIT license covers project code and original artwork, not ownership of those characters.

Daily banner mottos rotate through a date-seeded shuffled set of original study quotes. Each local calendar day keeps one quote; the rotation needs no account or extra saved data. September 30, 2026 keeps the original “Quiet days. Stronger tomorrow.”

Basecamp and Focus chamber show **Studied today** and **Lifetime study time** in hours and minutes. Totals use completed, saved timer sessions and offline study logs, including backdated entries. Running timers count after Finish & log. Time totals are independent of XP caps; workouts and separately entered mock durations do not add study time. Log a mock as a study session if you want its time included, without duplicating a session you already logged.

Rendering uses static glass gradients without backdrop blur, skips offscreen chapter contents, and lazy-loads companion choices. Snow draws at at most 24 fps with 60 particles and pauses while scrolling or when the tab is hidden. Turning ambient motion off stops snow and animations. Timer updates avoid rewriting hidden controls.
