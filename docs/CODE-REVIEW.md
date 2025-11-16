# Code Review Guidelines

## Overview

Code review is a critical part of our development process. It ensures code quality, knowledge sharing, and alignment with our standards and Ubuntu philosophy. This guide provides best practices for both reviewers and authors.

---

## Table of Contents

1. [Purpose of Code Review](#purpose-of-code-review)
2. [Reviewer Responsibilities](#reviewer-responsibilities)
3. [Author Responsibilities](#author-responsibilities)
4. [Review Process](#review-process)
5. [Review Checklist](#review-checklist)
6. [Feedback Guidelines](#feedback-guidelines)
7. [Common Issues](#common-issues)
8. [Ubuntu Philosophy in Reviews](#ubuntu-philosophy-in-reviews)

---

## Purpose of Code Review

Code review serves multiple purposes:

- **Quality Assurance**: Catch bugs and issues before production
- **Knowledge Sharing**: Spread knowledge across the team
- **Standards Enforcement**: Ensure adherence to development standards
- **Security**: Identify security vulnerabilities
- **Learning**: Help team members grow and improve
- **Collective Ownership**: Build shared responsibility for code quality

---

## Reviewer Responsibilities

### Before Starting Review

1. **Understand the Context**
   - Read the PR description
   - Check linked issues
   - Review requirements
   - Understand the scope

2. **Check Prerequisites**
   - All tests passing
   - No merge conflicts
   - Coverage maintained
   - CI/CD checks passing

3. **Set Aside Time**
   - Don't rush reviews
   - Focus completely
   - Minimize distractions
   - Take breaks if needed

### During Review

1. **Read the Code**
   - Start with the big picture
   - Understand the approach
   - Review implementation details
   - Check for edge cases

2. **Test Locally** (when appropriate)
   ```bash
   git fetch origin pull/<PR_NUMBER>/head:review-branch
   git checkout review-branch
   npm install
   npm test
   npm run dev
   ```

3. **Verify Against Standards**
   - TypeScript strict mode
   - ESLint compliance
   - Prettier formatting
   - Test coverage
   - Documentation

4. **Check Security**
   - Input validation
   - Authentication/authorization
   - Secrets management
   - SQL injection prevention
   - XSS prevention

5. **Evaluate Performance**
   - Database queries optimized
   - No N+1 queries
   - Caching implemented
   - Response times acceptable

6. **Assess Accessibility**
   - WCAG 2.1 AA compliance
   - Keyboard navigation
   - Screen reader support
   - Color contrast

### After Review

1. **Provide Feedback**
   - Be specific and constructive
   - Suggest improvements
   - Acknowledge good work
   - Ask clarifying questions

2. **Make Decision**
   - Approve if satisfied
   - Request changes if needed
   - Comment if just observing

3. **Follow Up**
   - Respond to author questions
   - Re-review after changes
   - Approve when ready

---

## Author Responsibilities

### Before Requesting Review

1. **Self-Review**
   - Read your own code
   - Check for obvious issues
   - Verify tests pass
   - Ensure coverage maintained

2. **Prepare PR**
   - Clear title and description
   - Link related issues
   - Include screenshots (if UI)
   - Explain approach

3. **Verify Quality**
   ```bash
   npm run lint
   npm run format
   npm test
   npm run build
   ```

### During Review

1. **Respond Promptly**
   - Check for feedback regularly
   - Respond to questions
   - Clarify intent
   - Provide additional context

2. **Accept Feedback Gracefully**
   - Listen to suggestions
   - Ask for clarification
   - Discuss disagreements respectfully
   - Learn from feedback

3. **Make Changes**
   - Address all feedback
   - Commit with clear messages
   - Push changes
   - Request re-review

### After Approval

1. **Merge Carefully**
   - Ensure no conflicts
   - Verify CI/CD passing
   - Use squash and merge
   - Delete branch

2. **Monitor Deployment**
   - Watch for issues
   - Monitor metrics
   - Be available for questions
   - Help with rollback if needed

---

## Review Process

### Step 1: Create Pull Request

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issues
Closes #123

## Testing
Describe testing performed

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Tests pass
- [ ] Coverage maintained
- [ ] Documentation updated
- [ ] No breaking changes
```

### Step 2: Request Review

- Request review from relevant team members
- Assign to yourself
- Add appropriate labels
- Link to related issues

### Step 3: Reviewer Examines Code

- Reads PR description
- Reviews code changes
- Checks tests
- Verifies standards compliance

### Step 4: Provide Feedback

- Comment on specific lines
- Suggest improvements
- Ask clarifying questions
- Acknowledge good work

### Step 5: Author Responds

- Addresses feedback
- Makes changes
- Requests re-review
- Discusses disagreements

### Step 6: Approval

- Reviewer approves when satisfied
- At least 2 approvals required
- All CI/CD checks passing
- No merge conflicts

### Step 7: Merge

- Author merges PR
- Uses squash and merge
- Deletes branch
- Monitors deployment

---

## Review Checklist

### Code Quality

- [ ] Code is clear and readable
- [ ] Naming is descriptive
- [ ] Functions are focused
- [ ] Complexity is reasonable
- [ ] No code duplication
- [ ] Comments explain why, not what

### TypeScript

- [ ] Strict mode enabled
- [ ] No implicit any
- [ ] Types are explicit
- [ ] Interfaces used appropriately
- [ ] Generics used correctly

### Testing

- [ ] Tests are included
- [ ] Tests are meaningful
- [ ] Coverage maintained (80%+)
- [ ] Edge cases covered
- [ ] No mocks for core logic

### Security

- [ ] Input validated
- [ ] No secrets in code
- [ ] Authentication checked
- [ ] Authorization verified
- [ ] SQL injection prevented
- [ ] XSS prevented

### Performance

- [ ] No N+1 queries
- [ ] Caching implemented
- [ ] Response times acceptable
- [ ] Database queries optimized
- [ ] No unnecessary loops

### Accessibility

- [ ] WCAG 2.1 AA compliant
- [ ] Keyboard navigable
- [ ] Screen reader compatible
- [ ] Color contrast adequate
- [ ] Touch targets sufficient

### Documentation

- [ ] Code documented
- [ ] README updated
- [ ] API docs updated
- [ ] Breaking changes noted
- [ ] Examples provided

### Standards Compliance

- [ ] ESLint passing
- [ ] Prettier formatted
- [ ] Conventional commits
- [ ] Branch naming correct
- [ ] Ubuntu philosophy aligned

---

## Feedback Guidelines

### Constructive Feedback

**Good**:
```
This query could be optimized by adding an index on the email column.
Consider using the existing UserRepository method instead of duplicating logic.
Great test coverage! Did you consider the edge case where...?
```

**Bad**:
```
This is wrong.
Why did you do it this way?
This code is terrible.
```

### Asking Questions

**Good**:
```
What's the reason for this approach? I'm wondering if we could...
Have you considered using the existing utility function?
Could you explain the logic here? I want to make sure I understand.
```

**Bad**:
```
Why would you do this?
This doesn't make sense.
This is obviously wrong.
```

### Suggesting Improvements

**Good**:
```
This could be simplified by using Array.map() instead of a loop.
Consider extracting this logic into a separate function for reusability.
This pattern is used elsewhere in the codebase. See UserService.ts line 45.
```

**Bad**:
```
Change this.
This is inefficient.
You should know better.
```

### Acknowledging Good Work

**Good**:
```
Great test coverage! This is exactly what we need.
I like how you handled the error case here.
Excellent documentation. This will help future developers.
```

**Bad**:
```
OK.
Fine.
Whatever.
```

---

## Common Issues

### Issue: Reviewer Blocks on Minor Issues

**Solution**:
- Distinguish between blocking and non-blocking issues
- Use comment vs. request changes appropriately
- Allow author to decide on minor improvements
- Focus on critical issues

### Issue: Author Defensive About Feedback

**Solution**:
- Remember feedback is about code, not person
- Ask clarifying questions
- Explain reasoning
- Discuss alternatives
- Respect author's decisions

### Issue: Review Takes Too Long

**Solution**:
- Set time limits for reviews
- Break large PRs into smaller ones
- Use automated checks for style
- Focus on logic and design
- Escalate if blocked

### Issue: Disagreement on Approach

**Solution**:
- Discuss alternatives
- Consider trade-offs
- Consult standards
- Ask for second opinion
- Document decision

### Issue: Reviewer Unfamiliar with Code

**Solution**:
- Ask author for explanation
- Review related code
- Check documentation
- Request pair review
- Learn from the code

---

## Ubuntu Philosophy in Reviews

### Collective Benefit

- **Ask**: Does this benefit the collective?
- **Consider**: How does this affect the team?
- **Evaluate**: Is this sustainable long-term?
- **Decide**: What's best for everyone?

### Knowledge Sharing

- **Explain**: Help author understand why
- **Learn**: Ask questions to understand approach
- **Share**: Point to similar patterns
- **Teach**: Use reviews as learning opportunities

### Inclusive Feedback

- **Respect**: Value diverse perspectives
- **Listen**: Understand author's reasoning
- **Collaborate**: Work together on solution
- **Support**: Help author succeed

### Supportive Tone

- **Encourage**: Acknowledge good work
- **Help**: Offer suggestions, not demands
- **Grow**: Focus on learning and improvement
- **Celebrate**: Recognize contributions

---

## Review Metrics

### Track These Metrics

- **Review Time**: How long reviews take
- **Feedback Quality**: Usefulness of feedback
- **Author Satisfaction**: How authors feel about reviews
- **Code Quality**: Impact on code quality
- **Knowledge Sharing**: Learning from reviews

### Improve Reviews

- **Regular Retrospectives**: Discuss review process
- **Training**: Share best practices
- **Tools**: Use better review tools
- **Automation**: Automate style checks
- **Culture**: Build supportive culture

---

## Tools and Resources

### GitHub Features

- **Code Review**: Use GitHub's review feature
- **Suggestions**: Use suggestion feature for changes
- **Conversations**: Use threads for discussions
- **Approvals**: Use approval workflow

### Useful Commands

```bash
# Fetch PR locally
git fetch origin pull/<PR_NUMBER>/head:review-branch
git checkout review-branch

# Compare with main
git diff main

# Run tests
npm test

# Check coverage
npm test -- --coverage

# Lint code
npm run lint

# Format code
npm run format
```

### Related Documents

- [Development Standards](./STANDARDS.md)
- [Testing Guidelines](./TESTING-GUIDELINES.md)
- [Contributing Guide](../CONTRIBUTING.md)
- [Architecture](./ARCHITECTURE.md)

---

## Questions?

If you have questions about code review:

1. Check this guide
2. Ask in #azora-dev Slack channel
3. Bring it up in team meetings
4. Propose improvements

---

## Conclusion

Code review is a collaborative process that improves code quality and builds team knowledge. By following these guidelines, we create a supportive environment where everyone can grow and contribute their best work.

**Together, we build better code.**

