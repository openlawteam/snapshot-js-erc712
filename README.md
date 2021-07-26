## Deployment

1. Checkout `master` and pull the latest
2. Locally run `npm run release`
3. Choose a new semver version number
4. **In the background the following will now happen**:
    1. the `package.json` version will be bumped
    2. a new Git tag created
    3. version bump and tag pushed to `master`
    4. `prod-release.yaml` will execute (due to package bump) to publish the new package version to the NPM registry
    5. GitHub Release page will open

5. Create a GitHub Release entry (opens in brower automatically)
6. Done!
