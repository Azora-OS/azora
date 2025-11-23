# Test Code Review Checklist

## Overview

Use this checklist when reviewing test code to ensure quality and consistency.

## Test Structure

### Organization
- [ ] Tests are organized in logical describe blocks
- [ ] Related tests are grouped together
- [ ] Test file structure mirrors source file structure
- [ ] One test file per source file (when applicable)

### Naming
- [ ] Test file uses `.test.ts` or `.test.js` extension
- [ ] Test descriptions are clear and action-oriented
- [ ] Describe blocks use noun phrases (e.g., "User Authentication")
- [ ] Test cases use "should" statements (e.g., "should create user")

## Test Quality

### Independence
- [ ] Tests can run in any order
- [ ] Tests don't depend on other tests
- [ ] Each test sets up its own data
- [ ] Proper cleanup in afterEach/afterAll hooks

### Clarity
- [ ] Test intent is immediately clear
- [ ] Arrange-Act-Assert pattern is followed
- [ ] No unnecessary complexity
- [ ] Comments explain "why" not "what"

### Coverage
- [ ] Happy path is tested
- [ ] Error cases are tested
- [ ] Edge cases are covered
- [ ] Boundary conditions are tested

## Assertions

### Specificity
- [ ] Assertions are specific (not just toBeTruthy)
- [ ] Expected values are explicit
- [ ] Error messages are checked
- [ ] Multiple related assertions are in separate tests

### Correctness
- [ ] Assertions actually test the intended behavior
- [ ] No false positives (tests that always pass)
- [ ] Async operations are properly awaited
- [ ] Promises are properly handled

## Data Management

### Factories
- [ ] Factories are used for test data creation
- [ ] Only necessary fields are overridden
- [ ] Factory usage is consistent
- [ ] No hardcoded test data

### Cleanup
- [ ] Database is cleaned after each test
- [ ] Mocks are reset between tests
- [ ] No data leakage between tests
- [ ] Resources are properly released

## Mocking

### Mock Usage
- [ ] External services are mocked
- [ ] Mocks are appropriate for the test
- [ ] Mock behavior is clearly defined
- [ ] Mocks are verified when necessary

### Mock Quality
- [ ] Mocks are reset in beforeEach
- [ ] Mock responses are realistic
- [ ] Mock failures are tested
- [ ] No over-mocking (testing implementation details)

## Performance

### Speed
- [ ] Tests run quickly (< 1 second each)
- [ ] No unnecessary database calls
- [ ] No unnecessary async operations
- [ ] Efficient test setup

### Resource Usage
- [ ] Minimal data creation
- [ ] Proper connection pooling
- [ ] No memory leaks
- [ ] Efficient queries

## Async Handling

### Promises
- [ ] Async functions use async/await
- [ ] Promises are properly awaited
- [ ] Error handling is correct
- [ ] No unhandled promise rejections

### Timing
- [ ] No arbitrary timeouts
- [ ] No race conditions
- [ ] Proper use of waitFor/waitForElement
- [ ] Deterministic test behavior

## Error Handling

### Error Tests
- [ ] Error cases are explicitly tested
- [ ] Error messages are verified
- [ ] Error types are checked
- [ ] Edge cases that throw errors are covered

### Error Patterns
- [ ] expect().rejects.toThrow() for async errors
- [ ] expect(() => {}).toThrow() for sync errors
- [ ] Specific error messages are checked
- [ ] Error handling doesn't hide bugs

## Code Quality

### Readability
- [ ] Code is easy to understand
- [ ] Variable names are descriptive
- [ ] No magic numbers
- [ ] Consistent formatting

### Maintainability
- [ ] No code duplication
- [ ] Helper functions for repeated logic
- [ ] Tests are easy to update
- [ ] Clear separation of concerns

### Best Practices
- [ ] Follows project conventions
- [ ] Uses established patterns
- [ ] No anti-patterns
- [ ] Consistent with existing tests

## Documentation

### Comments
- [ ] Complex logic is explained
- [ ] Non-obvious behavior is documented
- [ ] TODO comments have tickets
- [ ] No commented-out code

### Context
- [ ] Test purpose is clear
- [ ] Assumptions are documented
- [ ] Known limitations are noted
- [ ] Related tests are referenced

## Integration

### CI/CD
- [ ] Tests pass in CI environment
- [ ] No flaky tests
- [ ] Appropriate test timeout
- [ ] Proper test categorization

### Dependencies
- [ ] All dependencies are available
- [ ] Version compatibility is ensured
- [ ] No unnecessary dependencies
- [ ] Mock dependencies are up to date

## Security

### Data Safety
- [ ] No sensitive data in tests
- [ ] No hardcoded credentials
- [ ] Test data is anonymized
- [ ] Proper data isolation

### Access Control
- [ ] Authorization is tested
- [ ] Permission checks are verified
- [ ] Security boundaries are tested
- [ ] No security bypasses in tests

## Common Issues to Check

### Anti-Patterns
- [ ] No testing implementation details
- [ ] No brittle selectors
- [ ] No snapshot testing abuse
- [ ] No excessive mocking

### Red Flags
- [ ] Tests that always pass
- [ ] Tests that are skipped
- [ ] Tests with try-catch that swallow errors
- [ ] Tests that modify global state

### Maintenance Concerns
- [ ] Tests that are hard to understand
- [ ] Tests that are slow
- [ ] Tests that are flaky
- [ ] Tests that are overly complex

## Final Checks

### Before Approval
- [ ] All tests pass locally
- [ ] All tests pass in CI
- [ ] Coverage meets requirements
- [ ] No console warnings or errors
- [ ] Documentation is updated

### Quality Gates
- [ ] Code coverage threshold met
- [ ] No decrease in coverage
- [ ] All critical paths tested
- [ ] Performance benchmarks met

## Reviewer Notes

### Feedback Guidelines
- Be specific about issues
- Suggest improvements
- Explain reasoning
- Link to documentation
- Provide examples

### Approval Criteria
- All checklist items addressed
- No blocking issues
- Quality standards met
- Team conventions followed
- Documentation complete

## Resources

- [Testing Standards](./TESTING-STANDARDS.md)
- [Test Writing Guide](./TEST-WRITING-GUIDE.md)
- [Factory Guide](./FACTORY-GUIDE.md)
- [Mock Guide](./MOCK-GUIDE.md)
