# PRISM Contribution Guide (WIP)

## Git Process

WIP

## Changeset

A changeset is required per JIRA ticket at a minimum. When wrapping up the ticket, that is when a changeset is created
and should be part of the final pull request.

#### Creating a Changeset

1. Run `yarn changeset`
2. Pick the packages that you updated as part of your changes.<br />![Step 2](docs/images/changeset-step-1.png)
3. Select the packages that should have a major, minor, or patch version. Pressing `enter` will proceed to the next version type.<br />![Step 2](docs/images/changeset-step-2.png)
4. Add your summary of your changes, add the JIRA number to the end of the summary (ex: [DCT-1234]).<br />![Step 3](docs/images/changeset-step-3.png)
5. After the above steps, you'll see that a new file is created within the `.changeset` directory, commit this file and it will be appended to the `CHANGELOG.md` upon release.
   If you had any mistakes in the above steps, you're able to correct them manually in this file before you commit.<br />![Step 4](docs/images/changeset-step-4.png)

## Testing

WIP
