module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', [
      'feat', 'fix', 'docs', 'style', 'refactor',
      'perf', 'test', 'build', 'ci', 'chore', 'revert'
    ]],
    'scope-enum': [2, 'always', [
      'education', 'finance', 'marketplace', 'auth',
      'ai-family', 'api', 'ui', 'infra', 'docs'
    ]]
  }
};
