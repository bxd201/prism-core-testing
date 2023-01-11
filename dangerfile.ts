import { warn, schedule, danger, markdown, message, fail } from 'danger'
import wordcheck from 'danger-plugin-wordcheck'
import simpleCollection from 'danger-plugin-simple-collection'

const labels = danger.github.issue.labels.map((v) => v.name)
const hasReadyToMerge = labels.reduce((accum, curr) => {
  if (curr.toLowerCase() === 'ready to merge') return true
  return accum
}, false)

const reviews = danger.github.reviews
const hasApprovingReviews = reviews.reduce((accum, curr) => {
  if (curr.state === 'APPROVED') return true
  return accum
}, false)

const hasChangelog = danger.git.created_files.filter((name) => name.indexOf('.changeset/') === 0).length > 0
const isTrivial = (danger.github.pr.body + danger.github.pr.title).includes('#trivial')

function shouldNotRunOnThisBaseBranch() {
  const avoidBranches = ['qa', 'release']
  if (avoidBranches.indexOf(danger.github.pr.base.ref) >= 0) {
    return true
  }
  return false
}

function eslintDisableWarn() {
  const modifiedFiles = danger.git.modified_files.filter(
    (path) => path.match(/[tj]sx?$/) && !path.match(/dangerfile\.[tj]s$/)
  )

  const structuredModifiedFiles = modifiedFiles.map((file) => {
    return {
      fileName: file,
      fileDiffPromise: danger.git.diffForFile(file)
    }
  })

  const eslintFiles = []
  const tsFiles = []

  Promise.all(
    structuredModifiedFiles.map((structuredModifiedFile) => {
      return structuredModifiedFile.fileDiffPromise.then((fileDiff) => {
        if (fileDiff.added.includes('eslint-disable')) {
          eslintFiles.push(structuredModifiedFile.fileName)
        }

        if (fileDiff.added.includes('ts-ignore')) {
          tsFiles.push(structuredModifiedFile.fileName)
        }
      })
    })
  )
    .then(() => {
      if (eslintFiles.length) {
        warn(`🟡 At least one "eslint-disable" directive was added in this PR.`)
        message(
          `🟡 The following file(s) have "eslint-disable" directives added:\n${eslintFiles
            .sort()
            .map((v) => ` * \`${v}\``)
            .join('\n')}`
        )
      }
      if (tsFiles.length) {
        warn(`🔵 At least one "ts-ignore" directive was added in this PR.`)
        message(
          `🔵 The following file(s) have "ts-ignore" directives added:\n${tsFiles
            .sort()
            .map((v) => ` * \`${v}\``)
            .join('\n')}`
        )
      }
    })
    .catch((err) => {
      console.error('Scanning files for eslint-disable and ts-ignore directives failed')
    })
}

function validateCommitMessages() {
  danger.git.commits.forEach((commit) => {
    if (!commit.message.match(/^(feat:)|(fix:)|(docs:)|(style:)|(test:)|(chore:)/g)) {
      warn(`Commit \`${commit.sha.slice(0, 7)}\` message '${commit.message}' does not match the correct format`)
    }
  })
}

function validatePullRequestTitle() {
  if (!danger.github.pr.title.match(/^[A-Z]+-\d* | '/g)) {
    warn('Pull request title does not match the format of `DCT-1234 | Message`')
  }
}

function ensurePackageChangesIncludeLockFile() {
  const packageChanged = danger.git.modified_files.includes('package.json')
  const lockfileChanged = danger.git.modified_files.includes('yarn.lock')
  if (packageChanged && !lockfileChanged) {
    warn('Changes were made to package.json, but not to yarn.lock - Perhaps you need to run `yarn install`?')
  }
}

function checkForBigPR(bigPRThreshold) {
  if (danger.github.pr.additions + danger.github.pr.deletions > bigPRThreshold) {
    warn(':exclamation: Big PR')
    markdown(
      '> Pull Request size seems relatively large. If Pull Request contains multiple changes, split each into separate PR will helps faster, easier review.'
    )
  }
}

;(() => {
  if (shouldNotRunOnThisBaseBranch()) return

  if (hasApprovingReviews && !hasReadyToMerge) {
    message('🏷 Please add the **Ready to Merge** label if this has been approved!')
  }

  if (!hasChangelog && !isTrivial) {
    warn('Please add a changelog entry for your changes by running `yarn changeset` from the project root.')
  }

  if (danger.github.commits.length > 1) {
    warn('This PR contains multiple commits. Consider squashing related commits into a single, well-described commit.')
  }

  checkForBigPR(600)

  // check for eslint-disable and warn if found
  eslintDisableWarn()

  // Checks for semantic commit messages
  validateCommitMessages()

  // Checks for words in our wordcheck list
  schedule(wordcheck('./.github/wordcheck.txt'))

  // React Dev Suite of Checks
  simpleCollection({
    jiraKey: ['DCT', 'HGSW', 'MESP'], // required, key used for JIRA tickets eg. FA would be the key for ticket FA-123
    jiraUrl: 'https://sherwin-williams.atlassian.net/browse', // required, url to the account's/organization's JIRA home
    reportsPath: 'reports/danger', // optional default is reports/danger
    noConsoleWhitelist: ['warn', 'error', 'info'], // optional, whitelist options for console calls, possible options log,warn,info,error
    disabled: {
      // optional, disable some plugins, options are listed in example below
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
})()
