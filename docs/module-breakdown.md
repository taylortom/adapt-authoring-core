# Module breakdown
**Modules** are the building blocks of the Adapt authoring tool; each adding new functionality, or augmenting the existing feature-set.

This page gives a brief outline of what Adapt authoring modules must include to be included in the system.

## Minimum folder structure
```
index.js
```
Yep, that's it!

There are very few assumptions made by the authoring tool when it comes to which files you must include in your modules: at the bare minimum, you simply need to export a single Javascript file in the same way you would [with any NPM module](https://docs.npmjs.com/files/package.json#main) (this doesn't even have to be named `index.js`).

**You must export an ES6 class from your main JS file. If you don't do this, your module won't be included in the boot process.**

See below for some examples:

```
/*
* if your only export is your Adapt module...
*/
module.exports = ModuleClass
/*
* or, if you have multiple exports, make sure your Adapt module export
* is named 'Module' (note: only the 'Module' export will be treated as an Adapt
* module and included in the boot process).
*/
module.exports = {
  Module: ModuleClass,
  export2,
  // etc...
}
```

**You'll also need to add some extra config to your `package.json`, see the configuration section below for more on this.**

## Recommended folder structure
Although an authoring module can consist of a single file, in all but the simplest of cases you'll find yourself wanting to split up your module into multiple files and folders.

The below is what we recommend, and is the approach taken by the the core dev team for all core-supported modules. It is also the structure required by some Adapt modules (e.g. documentation generator, JavaScript linter, testing suite).

| Name | Type | Description |
| ---- | ---- | ----------- |
| `config` | Folder | All config files go here (in `.json` format) |
| `docs` | Folder | Documentation files go here (in `.md` format) |
| `lang` | Folder | All language files to be used in user-facing messages go here (in `.json` format) |
| `lib` | Folder | All `.js` code should go here |
| `test` | Folder | Test files go here |

## Configuration
In order for the authoring tool to recognise an NPM dependency as an Adapt authoring module, you must add some custom configuration to the module's `package.json` file.

As a bare mininum, you will need an `adapt_authoring` attribute (object), with a child `module` attribute which is set to true. See below for an example:

```javascript
"name": "helloworld",
"version": 1.0.0,
"adapt_authoring": {
  "module": true,
  // authoring tool specific config goes here...
}
// ... other options
```
### Extra configuration options
There are several other options which can be set in this object. See below for those which are provided by the core application:

| Attribute | Type | Description |
| --------- | ---- | ----------- |
|  |  |  |

*Note: other Adapt authoring modules may make use of the `adapt_authoring` attribute to store their own configuration settings. Please check the documentation for specific modules to be sure.*

## The module boot cycle

Every [Module](../class/adapt_authoring_restructure/adapt-authoring-core/lib/module.js~Module.html) subclass inherits the same boot cycle from the [Loadable class](../class/adapt_authoring_restructure/adapt-authoring-core/lib/loadable.js~Loadable.html), which consists of three distinct stages.

| Phase | Type | Function name | Description |
| ----- | ---- | ------------- | ----------- |
| Instantiation | Sync | `constructor` | Not strictly part of the boot cycle, this refers to the instantiation of the module via the constructor function (e.g. `new MyModule()`). Any relevant (**asynchronous**) setup can be included here.<br><br/> *For performance reasons, it is recommended that you don't use synchronous alternatives to asynchronous functions (e.g. [fs.readFileSync](https://nodejs.org/api/fs.html#fs_fs_readfilesync_path_options)) in the constructor, and instead move these to the relevant asynchronous preload or boot phases.* |
| Preload | Async | `preload` | This stage should perform any tasks required prior to the module actually starting. Anything that doesn’t fit into the instantiation phase (most notably anything async) should go here (e.g. the loading of a config file). |
| Boot | Async | `boot` | This stage should perform actions required to actually start the module (e.g. a database module actually connecting to the database). |

Depending on your needs, it may not be necessary to include all of the above boot stages.

To include any of the above phases in your module, simply add a function with the **Function name** value from the table, and ensure that it accepts the required parameters (see the [Loadable API docs](../class/adapt_authoring_restructure/adapt-authoring-core/lib/loadable.js~Loadable.html) for more on this).

e.g.
```javascript
class MyModule extends Module {
  preload(app, resolve, reject) {
    asyncFunction().then(results => {
      // doing some async stuff
      resolve();
    }).catch(reject);
  }
}
```

### Events

Each [Module](../class/adapt_authoring_restructure/adapt-authoring-core/lib/module.js~Module.html) fires a few [events](../class/adapt_authoring_restructure/adapt-authoring-core/lib/events.js~Events.html) at various points during the boot process to make interacting with other modules a bit easier:

`preload`: emitted once the preload process for a module has completed.

`boot`: emitted once the boot process has been completed.
