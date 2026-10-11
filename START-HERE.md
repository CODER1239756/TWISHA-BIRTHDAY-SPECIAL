# Twisha's Garden - Stage 1 ZIP

- `twishas-garden/` is the complete Stage 1 repository. Upload its contents to a new empty GitHub repository.
- `visible-copies-of-hidden-files/` holds plain copies of the files iPadOS hides because their names begin with a dot. You paste these into GitHub's "Create new file" with the real names (see below).
- Full instructions: `twishas-garden/docs/README-SETUP.md`.

Hidden-file mapping:

| Create this file on GitHub | Paste contents of |
|---|---|
| `.github/workflows/ci-deploy.yml` | `visible-copies-of-hidden-files/ci-deploy.yml.txt` |
| `.gitignore` | `visible-copies-of-hidden-files/gitignore.txt` |

The real hidden files are also inside `twishas-garden/`, so on a computer you can upload the folder as is.

Honest status: nothing here has been built by npm or rendered in 3D yet. The first real build is the GitHub Actions run.
