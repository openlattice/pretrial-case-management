# Pretrial Case Management

## Getting Started

1. Add your SSH key to GitHub

  https://help.github.com/en/github/authenticating-to-github/connecting-to-github-with-ssh

  https://help.github.com/en/github/authenticating-to-github/adding-a-new-ssh-key-to-your-github-account


2. Install `node` and `npm`

  ```
  ~ $ node --version
  v11.6.0
  ~ $ npm --version
  6.14.0
  ```

3. Clone the repository

  ```
  git clone git@github.com:Lattice-Works/pretrial-case-management.git
  ```

4. Install

  ```
  ~ $ cd pcm
  ~/pcm $ npm install
  ```

## Running Locally

  ```
  ~/pcm $ npm run app

  > psa@0.0.0 app /path/to/pcm
  > webpack-dev-server --config config/webpack/webpack.config.app.js --env.development

  ℹ ｢wds｣: Project is running at http://localhost:9000/
  ℹ ｢wds｣: webpack output is served from /pcm/
  ℹ ｢wds｣: Content not from webpack is served from /path/to/pcm/build
  ℹ ｢wds｣: 404s will fallback to /pcm/
  ℹ ｢wdm｣: Hash: fcb355a8b8301d990293
  Version: webpack 4.41.6
  Time: 4781ms
  Built at: 04/20/2020 10:09:29 PM
  ...
  Entrypoint main [big] = static/js/index.js
  [0] multi (webpack)-dev-server/client?http://localhost:9000 (webpack)/hot/dev-server.js @babel/polyfill ./src/index.js 64 bytes {main} [built]
  [./node_modules/@babel/polyfill/lib/index.js] 686 bytes {main} [built]
  ...
  [./node_modules/webpack-dev-server/client/index.js?http://localhost:9000] (webpack)-dev-server/client?http://localhost:9000 4.29 KiB {main} [built]
  [./node_modules/webpack/hot/dev-server.js] (webpack)/hot/dev-server.js 1.59 KiB {main} [built]
  [./src/index.js] 2.2 KiB {main} [built]
      + 1377 hidden modules
  Child html-webpack-plugin for "index.html":
       1 asset
      Entrypoint undefined = index.html
  ...
  ℹ ｢wdm｣: Compiled successfully.
  ```

  The app should now be running at `localhost:9000/{app}/`, where `{app}` is defined as `BASE_PATH` in `config/webpack/webpack.config.base.js`. For example:
    - `localhost:9000/psa/`

  **NOTE**: the trailing `/` is required

## Running Against Production

Pointing the app to production requires 2 simple changes:

1. Change `__AUTH0_CLIENT_ID__` to the production client id:
  ```
  // config/webpack/webpack.config.base.js, line 69
  __AUTH0_CLIENT_ID__: JSON.stringify(AUTH0_CLIENT_ID_PROD),
  ```

2. Add `baseUrl` to the `lattice-auth` initialization:
  ```
  // src/index.js, lines 53 to 57
  LatticeAuth.configure({
    auth0ClientId: __AUTH0_CLIENT_ID__,
    auth0Domain: __AUTH0_DOMAIN__,
    authToken: AuthUtils.getAuthToken(),
    baseUrl: 'production',                    // <- add this line
  });
  ```

To run the app, make sure the app is stopped. Then, just run normally:
```
~/pcm $ npm run app
```

**NOTE**: The app must be restarted in order to pick up the above changes.

## Building

  ```
  ~/pcm $ npm run build:prod
  ```

## Other npm scripts

  ```
  ~/pcm $ npm run flow
  ~/pcm $ npm run lint
  ~/pcm $ npm run test
  ```
