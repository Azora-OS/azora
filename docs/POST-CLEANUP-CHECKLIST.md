# Post-Cleanup Verification Checklist

This checklist should be completed after the repository cleanup to ensure everything works correctly.

## Phase 1: Dependency Installation
- [ ] Run `npm install` successfully
- [ ] Verify no missing dependencies
- [ ] Check for any security vulnerabilities with `npm audit`

## Phase 2: Build Verification
- [ ] Run `npm run build` successfully
- [ ] Verify no TypeScript errors related to renamed imports
- [ ] Check that all pages build correctly
- [ ] Verify Next.js build output is clean

## Phase 3: Linting and Code Quality
- [ ] Run `npm run lint` successfully
- [ ] Address any new linting errors
- [ ] Run `npm run format` to ensure code formatting is consistent
- [ ] Run `npm run types` to verify TypeScript types

## Phase 4: Import Path Verification
- [ ] Verify all `system-core/` imports work correctly
- [ ] Test that renamed scripts execute properly:
  - [ ] `npm run prod:release`
  - [ ] `npm run system:triumph`
  - [ ] `npm run system:validate`
  - [ ] `npm run system:bless`
  - [ ] `npm run chatgpt:enhanced-ai`

## Phase 5: Documentation Review
- [ ] Verify all essential docs are in `/docs` directory
- [ ] Ensure README.md in root is up to date
- [ ] Check that archived files in `.archive/` are correct
- [ ] Review CLEANUP-SUMMARY-20251106.md for accuracy

## Phase 6: H1 Upgrade Integration (When Available)
- [ ] Obtain access to Azora-OS-AI/azora-os repository
- [ ] Copy azora-upgrades-package/ directory to root
- [ ] Read APPLICATION-GUIDE.md
- [ ] Follow upgrade instructions
- [ ] Run verification checklist from VERIFICATION.txt
- [ ] Test new services and infrastructure

## Phase 7: Testing
- [ ] Run `npm test` to execute test suite
- [ ] Verify all critical paths work
- [ ] Test key services:
  - [ ] GraphQL server
  - [ ] Authentication service
  - [ ] Education services
  - [ ] Mint service
- [ ] Check that UI components render correctly

## Phase 8: Final Review
- [ ] Review git diff for any unintended changes
- [ ] Verify .gitignore properly excludes build artifacts
- [ ] Check that no sensitive data was accidentally committed
- [ ] Update CHANGELOG.md with cleanup details
- [ ] Create release notes if applicable

## Known Issues to Monitor

### Import Path Updates
The following files had their imports updated from `genome/` to `system-core/`:
- All services in `/services`
- Synapse UI components
- Elara IDE core
- Launch and ingestion scripts
- Test files

**Action Required:** Run the application and monitor for any import-related runtime errors.

### Renamed Scripts
The following npm scripts were renamed and may be referenced in:
- CI/CD pipelines
- Deployment scripts
- Documentation
- Developer workflows

**Action Required:** Update any references to old script names in:
- GitHub Actions workflows (.github/workflows/)
- Deployment documentation
- Developer onboarding guides

### Platform-Specific Files
Windows batch files were moved to `/windows` directory:
- activate-database.bat
- activate-organism.bat
- liberate-africa.bat
- test-graphql.bat

**Action Required:** Update any documentation or scripts that reference these files with the new paths.

## Rollback Plan

If critical issues are discovered:

1. **Revert Import Changes:**
   ```bash
   git diff HEAD -- '**/*/\*.ts' '**/*/\*.tsx' | grep 'system-core' > /tmp/revert.patch
   # Review and selectively revert if needed
   ```

2. **Restore Archived Files:**
   ```bash
   cp -r .archive/docs_cleanup_20251106/* .
   ```

3. **Revert Directory Rename:**
   ```bash
   git mv system-core genome
   # Then update imports back
   ```

4. **Full Rollback:**
   ```bash
   git reset --hard <commit-before-cleanup>
   ```

## Success Criteria

Cleanup is considered successful when:
- ✅ All builds pass without errors
- ✅ All tests pass
- ✅ No broken import paths
- ✅ Linting passes
- ✅ Documentation is organized and accessible
- ✅ Repository is more maintainable
- ✅ Professional naming throughout

## Notes

- The npm install timeout during verification is expected for large projects
- Build verification should be performed in a clean environment
- Consider running builds in CI/CD to verify in multiple environments
