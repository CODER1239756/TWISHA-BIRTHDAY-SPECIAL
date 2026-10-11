# Setup from an iPad (GitHub in the browser, no terminal)

Everything below happens in Safari plus the Files app. You never need a terminal or a token.

## 1. Create the repository

1. Open github.com and sign in. Tap **+ → New repository**.
2. Name it (for example `twishas-garden`). Choose **Public**. Leave "Add a README" **unticked**. Tap **Create repository**.

## 2. Unzip the Stage 1 ZIP

In the Files app, tap the ZIP once to unzip it. Open the `twishas-garden` folder. You will see ordinary files and folders. Three files are **hidden** by iPadOS because their names start with a dot (`.github/…`, `.gitignore`); `START-HERE.md` explains the visible copies provided for them.

## 3. Add the files (pick the method that works for you)

The repository must end up with exactly the structure listed in `README.md`.

### Method A - upload by folder (fewest taps)

On the repository page tap **Add file → Upload files**. Tap **choose your files**, open the unzipped folder, and select every file that sits **directly** in `twishas-garden` (not folders): `index.html`, `package.json`, `tsconfig.json`, `vite.config.ts`, `README.md`. Tap **Commit changes**.

Then, for each folder, open this address in Safari (replace `USER` and `REPO`) and upload that folder's files the same way:

| Address to open | Files to select |
|---|---|
| `https://github.com/USER/REPO/upload/main/src` | `main.tsx`, `App.tsx` |
| `https://github.com/USER/REPO/upload/main/src/scene` | the 7 files in `src/scene` |
| `https://github.com/USER/REPO/upload/main/src/ui` | `GlassShell.tsx` |
| `https://github.com/USER/REPO/upload/main/src/styles` | `tokens.css`, `glass.css` |
| `https://github.com/USER/REPO/upload/main/src/lib` | `growth.ts` |
| `https://github.com/USER/REPO/upload/main/tests` | `growth.test.ts` |
| `https://github.com/USER/REPO/upload/main/docs` | `README-SETUP.md` |

If GitHub shows a "404" for an address, the folder does not exist yet; use Method B for that one file to create the folder, then Method A works for the rest. (This was not tested; the exact GitHub behaviour could not be checked from the build environment.)

### Method B - paste each file (most reliable, slowest)

1. **Add file → Create new file**.
2. In the name box type the full path, for example `src/scene/Ground.tsx`. Typing `/` creates folders automatically.
3. Open the same file from the unzipped folder in Files (tap to preview), select all, copy, and paste into the editor.
4. **Commit changes**. Repeat for each file.

### The three hidden files (always Method B)

Use **Create new file** and paste the contents of the visible copies in `visible-copies-of-hidden-files/`:

- `.github/workflows/ci-deploy.yml` ← `ci-deploy.yml.txt`
- `.gitignore` ← `gitignore.txt`

## 4. Turn on GitHub Pages

Repository **Settings → Pages → Build and deployment → Source: GitHub Actions**.

## 5. Watch the first build

Open the **Actions** tab. The run "CI and Deploy" has steps Install, Typecheck, Test, Build, Deploy. This is the first time the code is built anywhere, so a failure is possible and not your fault; copy the red error text and send it to me. When green, the site is at `https://USER.github.io/REPO/`.

If the workflow does not start after the last upload, open Actions → CI and Deploy → **Run workflow**.

## 6. Test on the iPad

Open the site in Safari. Check: the scene appears and drifts slowly, the glass panels are readable, nothing scrolls, the safe areas look right in both orientations, and every control is dimmed (nothing should respond).
