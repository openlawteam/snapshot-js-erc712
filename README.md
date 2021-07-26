## Deployment

1. Checkout `master` and pull the latest
2. Locally run `npm run release`
3. Choose a new semver version number
4. **In the background the following will now happen**:

  - the `package.json` version will be bumped
  - a new Git tag created
  - version bump and tag pushed to `master`
  - because a new version was committed to `master` now `prod-release.yaml` will execute to publish the new package version to the NPM registry
  - GitHub Release page will open

5. Create a GitHub Release entry (opens in brower automatically)
6. Done!
