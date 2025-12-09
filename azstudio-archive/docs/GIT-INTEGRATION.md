# Git Integration

AzStudio includes comprehensive Git integration powered by `isomorphic-git`, providing version control capabilities directly within the IDE.

## Features

### 1. Repository Management
- Initialize new Git repositories
- Check repository status
- View changed files with diffs
- Stage and unstage files
- Commit changes with messages

### 2. Branch Management
- View all branches
- Create new branches
- Switch between branches
- Delete branches
- Merge branches with conflict detection

### 3. Remote Repository Management
- Add and remove remote repositories
- Push changes to remote
- Pull changes from remote
- Fetch updates
- Authentication with personal access tokens

### 4. Commit History
- View commit log
- See commit details (author, date, message)
- Browse commit history

## Components

### GitPanel
The main Git interface component that provides:
- **Changes Tab**: View and stage/unstage files, commit changes
- **History Tab**: Browse commit history
- **Branches Tab**: View and manage branches

**Usage:**
```tsx
import { GitPanel } from './components/GitPanel';

<GitPanel projectPath="/path/to/project" />
```

### BranchManager
Dedicated branch management interface:
- Create new branches
- Switch branches
- Delete branches
- Merge branches

**Usage:**
```tsx
import { BranchManager } from './components/BranchManager';

<BranchManager 
  projectPath="/path/to/project"
  onBranchChange={(branchName) => console.log('Switched to:', branchName)}
/>
```

### RemoteManager
Remote repository management interface:
- Add/remove remotes
- Push/pull/fetch operations
- Credential management
- Authentication dialogs

**Usage:**
```tsx
import { RemoteManager } from './components/RemoteManager';

<RemoteManager projectPath="/path/to/project" />
```

## GitService API

The `GitService` class provides the core Git functionality:

### Repository Operations
```typescript
const gitService = new GitService('/path/to/project');

// Initialize repository
await gitService.init();

// Check if directory is a Git repo
const isRepo = await gitService.isRepo();

// Get repository status
const status = await gitService.status();
// Returns: { modified, added, deleted, untracked, staged }
```

### Staging and Committing
```typescript
// Stage files
await gitService.add(['file1.ts', 'file2.ts']);

// Unstage files
await gitService.remove(['file1.ts']);

// Commit changes
const sha = await gitService.commit('Commit message', {
  name: 'Your Name',
  email: 'your.email@example.com'
});

// Get commit history
const commits = await gitService.log(50); // Last 50 commits
```

### Branch Operations
```typescript
// Get current branch
const currentBranch = await gitService.getCurrentBranch();

// List all branches
const branches = await gitService.listBranches();

// Create new branch
await gitService.createBranch('feature/new-feature', true); // true = checkout

// Switch branches
await gitService.checkoutBranch('main');

// Delete branch
await gitService.deleteBranch('feature/old-feature');

// Merge branch
await gitService.merge('feature/new-feature', {
  name: 'Your Name',
  email: 'your.email@example.com'
});
```

### Remote Operations
```typescript
// Add remote
await gitService.addRemote('origin', 'https://github.com/user/repo.git');

// List remotes
const remotes = await gitService.listRemotes();

// Push to remote
await gitService.push('origin', 'main', {
  username: 'your-username',
  password: 'your-personal-access-token'
});

// Pull from remote
await gitService.pull('origin', 'main', {
  username: 'your-username',
  password: 'your-personal-access-token'
}, {
  name: 'Your Name',
  email: 'your.email@example.com'
});

// Fetch from remote
await gitService.fetch('origin', {
  username: 'your-username',
  password: 'your-personal-access-token'
});
```

### Diff Operations
```typescript
// Get diff for a file
const diff = await gitService.getDiff('src/file.ts');
```

### Clone Repository
```typescript
// Clone a repository
const gitService = await GitService.clone(
  'https://github.com/user/repo.git',
  '/path/to/destination',
  {
    username: 'your-username',
    password: 'your-personal-access-token'
  }
);
```

## IPC API

The Git functionality is exposed to the renderer process through IPC:

```typescript
// All operations return { success: boolean, data?: any, error?: string }

// Repository operations
await window.electronAPI.git.init(projectPath);
await window.electronAPI.git.isRepo(projectPath);
await window.electronAPI.git.status(projectPath);

// Staging and committing
await window.electronAPI.git.add(projectPath, ['file1.ts']);
await window.electronAPI.git.remove(projectPath, ['file1.ts']);
await window.electronAPI.git.commit(projectPath, 'message', config);
await window.electronAPI.git.log(projectPath, 50);

// Branch operations
await window.electronAPI.git.getCurrentBranch(projectPath);
await window.electronAPI.git.listBranches(projectPath);
await window.electronAPI.git.createBranch(projectPath, 'branch-name', true);
await window.electronAPI.git.checkoutBranch(projectPath, 'branch-name');
await window.electronAPI.git.deleteBranch(projectPath, 'branch-name');
await window.electronAPI.git.merge(projectPath, 'branch-name', config);

// Remote operations
await window.electronAPI.git.addRemote(projectPath, 'origin', 'url');
await window.electronAPI.git.listRemotes(projectPath);
await window.electronAPI.git.push(projectPath, 'origin', 'main', credentials);
await window.electronAPI.git.pull(projectPath, 'origin', 'main', credentials, config);
await window.electronAPI.git.fetch(projectPath, 'origin', credentials);

// Diff operations
await window.electronAPI.git.getDiff(projectPath, 'file.ts');

// Clone
await window.electronAPI.git.clone(url, dir, credentials);
```

## Authentication

### Personal Access Tokens

For HTTPS remotes, use personal access tokens instead of passwords:

**GitHub:**
1. Go to Settings → Developer settings → Personal access tokens
2. Generate new token with `repo` scope
3. Use token as password in credentials

**GitLab:**
1. Go to User Settings → Access Tokens
2. Create token with `api` and `write_repository` scopes
3. Use token as password in credentials

### SSH Keys

SSH authentication is not currently supported by isomorphic-git. Use HTTPS with personal access tokens instead.

## Best Practices

1. **Always commit before switching branches** to avoid losing changes
2. **Pull before pushing** to avoid conflicts
3. **Use meaningful commit messages** that describe what changed and why
4. **Create feature branches** for new work instead of committing directly to main
5. **Review diffs** before committing to ensure you're committing the right changes
6. **Keep credentials secure** - never commit tokens or passwords

## Limitations

- SSH authentication is not supported (use HTTPS with tokens)
- Large file support (Git LFS) is not implemented
- Submodules are not fully supported
- Some advanced Git features (rebase, cherry-pick, stash) are not yet implemented

## Troubleshooting

### Authentication Failures
- Ensure you're using a personal access token, not your account password
- Check that the token has the correct permissions
- Verify the remote URL is correct

### Merge Conflicts
- If a merge fails, you'll need to resolve conflicts manually
- Check the error message for details on which files have conflicts
- Edit the conflicted files to resolve issues
- Stage the resolved files and commit

### Push Rejected
- Usually means the remote has changes you don't have locally
- Pull the latest changes first, then push again
- If you're sure you want to force push, you'll need to use Git CLI

## Future Enhancements

- Visual merge conflict resolution
- Interactive rebase
- Git stash support
- Submodule management
- Git LFS support
- SSH key authentication
- Pull request creation from within AzStudio
- Blame/annotation view
- Git graph visualization
