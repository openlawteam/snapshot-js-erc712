## Deployment

1. Checkout `master` and pull the latest
2. Locally run `npm run release`
3. Choose a new semver version number
4. _**In the background**: the `package.json` version will be bumped and committed, a new Git tag created, and the GitHub Releases page will open._
5. Create a GitHub Release entry (opens in brower automatically)
6. _**In the background**: `prod-release.yaml` will execute to publish the new package version to the NPM registry_
7. Done!
