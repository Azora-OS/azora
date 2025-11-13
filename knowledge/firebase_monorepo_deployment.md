# Handling Firebase deployments from multiple repositories

When working with multiple repositories for a single Firebase project, you might encounter issues where deploying from one repository can accidentally delete functions deployed from another.

For example, deploying from `repoA` might prompt to delete functions from `repoB`:

```
$ (cd repoA && firebase deploy --only functions)
...
i  functions: preparing functions directory for uploading...
✔  functions: functions folder uploaded successfully
The following functions are found in your project but do not exist in your local source code:
        fn1FromRepoB
        fn2FromRepoB
        ...
? Would you like to proceed with deletion? Selecting no will continue the rest of the deployments. (y/N)
```

You can avoid this problem by adding a unique `codebase` annotation in the functions configuration section of the `firebase.json` in each project repository:

```json
# repoA/firebase.json
"functions": {
  "codebase": "repo-a"
}
```

```json
# repoB/firebase.json
"functions": {
  "codebase": "repo-b"
}
```
