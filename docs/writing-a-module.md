# Writing a module
This page is a quick-start guide to writing your own modules. For a detailed explanation of Adapt authoring tool modules, see [this page](module-breakdown.html).

## 1. Set up your folder structure
The first necessary step is to make sure your module has the correct folder structure. The below table gives a summary of each folder you can expect to find in any given module.

_**Note:** not all of the below may be relevant to you and your module._

| Name | Description | Type | File type | Required | More info |
| ---- | ----------- | :--: | --------- | :------: | :-------: |
| `conf/` | Module configuration schema. | Folder | `config.schema.js` |  |  |
| `docs/` | Documentation files. These files will be included in the auto-generated documentation. | Folder | `.md` |  |  |
| `lang/` | Language strings for translation. | Folder | `.json` |  |  |
| `lib/` | JavaScript code. The files in this folder will be included in the auto-generated documentation. | Folder | `.js` | Yes |   |
| `schema/` | MongoDB schemas. | Folder | `*.schema.js` |  |  |
| `tests/` | Automated tests. All `*.spec.js` files in this folder will by run by the test suite. | Folder | `*.spec.js` |  |  |
| `index.js` | The main entry-point into the application. | File | N/A | Yes |  |

## 2. Add your module details to `package.json`
Besides the [standard NPM package attributes](https://docs.npmjs.com/files/package.json), there are also some custom Adapt configuration options that are expected.

- **module** (`Boolean`): Whether the Node.js module exports an adapt-authoring 'module'.
- **utility** (`Boolean`): Whether the Node.js module exports an adapt-authoring 'utility'.
- **documentation.enable** (`Boolean`): Whether the JavaScript code in this module should be included when you run the documentation generator.
- **documentation.manualIndex** (`String`): Path to a page to be used as the 'Developer guides' index page (note: this will override the default index page).
- **documentation.sourceIndex** (`String`): Path to a page to be used as the 'API reference' index page (note: this will override the default index page).

Example:
```
// full config
{
  "name": "adapt-authoring-mymodule",
  "version": "0.0.1",
  "description": "My custom module",
  "main": "index.js",
  "adapt-authoring": {
    "module": true,
    "utility": true,
    "documentation": {
      "enable": true,
      "manualIndex": "docs/index-manual.md",
      "sourceIndex": "docs/index-docs.md"
    }
}
// basic config (likely most commonly used)
{
  // ... NPM config omitted
  "adapt-authoring": {
    "module": true,
    "documentation": {
      "enable": true
    }
}
```

## 3. Write your module code
Now you've got the expected config and skeleton folder structure in place, it's time to get writing your module!

### Making use of the boot cycle
Each module extends from the Loadable class, adding a multi-stage boot process. This makes it easy for each module to initialise itself and interact with other modules as it needs.

The three stages in the boot cycle are as follows:

- **Instantiation** (i.e. constructor): Nothing exists yet.
- **Preload**: All module instances exist and are accessible from other modules.
- **Boot**: All modules have been preloaded and are ready to run.

You can make use of the above phases by overriding the constructor, `preload` and `boot` functions respectively:

```javascript
class MyModule extends AbstractModule {
  constructor(app, pkg) {
    /**
    * Don't attempt to reference anything besides utilities at this point,
    * and concern yourself only with your own module's setup.
    */
  }
  preload(app, resolve, reject) {
    /**
    * If you need access to another module but don't have to wait until it has
    * finishing booting, make use of this phase. In some cases, modules block
    * certain functionality after they have fully booted (i.e. creating Server
    * routers). Check the documentation for the specific module for full
    * details.
    */
  }
  boot(app, resolve, reject) {
    /**
    * Aim to finalise the initialisation of your module here.
    */
  }
}
```

### _Optional task: Add a configuration schema_
If you plan to add user-configurable settings to your module, you can add a `config.schema.js` to define which settings users need to add. See [this page](defining-config.html) for more information.

### _Optional task: Add MongoDB schemas_
Any data you wish to push to the database must be accompanied with a 'schema', to define the shape and structure of the data. You may be able to make use of schemas defined in other modules, but you will most likely need to create your own for your uses. For more information on creating schemas, see [this page]().

### _Optional task: Write unit tests_
Unit tests are a vital component to ensuring your module functions as expected, and doesn't suffer from undetected 'regression' bugs in the future. See [this page](writing-tests.html) for more information on writing tests.

## 4. Add your module in your adapt-authoring NPM dependencies
Your new module won't be loaded by the app unless you add it as a dependency to the main `adapt-authoring` app. To do this, simply add the name and version to the `dependencies` in the `package.json` for your local copy of `adapt-authoring`.
See the [NPM docs](https://docs.npmjs.com/files/package.json#dependencies) for more info.

_**Tip:** if you don't want to publish your module to NPM, you can simply provide the URL for the hosted git repository:_
```
{
  "dependencies": {
    "adapt-authoring-mymodule": "https://github.com/MY_GITHUB_ACCOUNT/GITHUB_REPO_NAME.git"
  }
}
```
