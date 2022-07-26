import { fail, warn, message, markdown, schedule, danger } from 'danger'
import wordcheck from 'danger-plugin-wordcheck'
import simpleCollection from 'danger-plugin-simple-collection'

function shouldNotRunOnThisBaseBranch () {
  const avoidBranches = ['qa', 'release']
  if (avoidBranches.indexOf(danger.github.pr.base.ref) >= 0) {
    return true 
  }
  return false
}

function validateCommitMessages () {
  if (shouldNotRunOnThisBaseBranch()) return
  
  danger.git.commits.forEach(commit => {
    if (!commit.message.match(/^(feat:)|(fix:)|(docs:)|(style:)|(test:)|(chore:)/g)) {
      warn(`Commit message '${commit.message}' does not match the correct format`)
    }
  })
}

function validatePullRequestTitle () {
  if (shouldNotRunOnThisBaseBranch()) return
  
  if (!danger.github.pr.title.match(/^DCT-\d* | '/g)) {
    warn('Pull request title does not match the format of `DCT-1234 | Message`')
  }
}

function ensurePackageChangesIncludeLockFile () {
  if (shouldNotRunOnThisBaseBranch()) return
  
  const packageChanged = danger.git.modified_files.includes('package.json')
  const lockfileChanged = danger.git.modified_files.includes('yarn.lock')
  if (packageChanged && !lockfileChanged) {
    warn('Changes were made to package.json, but not to yarn.lock - Perhaps you need to run `yarn install`?')
  }
}

// Checks for semantic commit messages
validateCommitMessages()

// Checks for words in our wordcheck list
schedule(wordcheck('./.github/wordcheck.txt'))

// React Dev Suite of Checks
simpleCollection({
  jiraKey: ['DCT', 'HGSW'], // required, key used for JIRA tickets eg. FA would be the key for ticket FA-123
  jiraUrl: 'https://sherwin-williams.atlassian.net/browse', // required, url to the account's/organization's JIRA home
  reportsPath: 'reports/danger', // optional default is reports/danger
  noConsoleWhitelist: ['warn', 'error', 'info'], // optional, whitelist options for console calls, possible options log,warn,info,error
  disabled: { // optional, disable some plugins, options are listed in example below
    coverage: true,
    jiraIssue: false,
    mentor: true,
    packageReport: true,
    noConsole: false,
    npmAudit: true,
    npmOutdated: true
  }
})

// Checks if a developer has changed package.json that a new yarn.lock file was generated
ensurePackageChangesIncludeLockFile()

// Validate PR title matches format of DCT-1234 | message
validatePullRequestTitle()
