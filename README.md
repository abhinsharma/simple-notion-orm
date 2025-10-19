# simple-notion-orm

Simplified Notion ORM for managing Notion databases and pages.

<!-- worktrees:begin -->
## Worktrees

This project uses Git worktrees to enable parallel development on multiple branches. All worktrees are stored in a sibling directory to keep the main repository clean.

**Base directory:** `/Users/abhinsharma/projects/simple-notion-orm-worktrees`

### Commands

**List all worktrees:**
```bash
git worktree list
```

**Create a new feature branch worktree:**
```bash
git worktree add ../simple-notion-orm-worktrees/<branch-name> -b <branch-name> main
```

**Create worktree for existing remote branch:**
```bash
git fetch origin <branch-name>
git worktree add ../simple-notion-orm-worktrees/<branch-name> origin/<branch-name>
```

**Remove a worktree after merging:**
```bash
git worktree remove ../simple-notion-orm-worktrees/<branch-name>
```

**Prune stale worktree entries:**
```bash
git worktree prune
```

### Workflow

1. Create a worktree for your feature branch
2. Work in the worktree directory
3. Commit and push changes
4. After merging the PR, remove the worktree and prune stale entries

See `../simple-notion-orm-worktrees/README.md` for more details.
<!-- worktrees:end -->
