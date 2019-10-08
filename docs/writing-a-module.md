# Writing a module
**Modules** are the building blocks of the Adapt authoring tool; each adding new functionality, or augmenting the existing feature-set.

This page gives a brief outline of what Adapt authoring modules must include to be included in the system.

## Minimum folder structure
```
index.js
```
Yep, that's it!

There are very few assumptions made by the authoring tool when it comes to which files you must include in your modules; at the very bare minimum, you simply need to export a single Javascript file in the same way you would [with any NPM module](https://docs.npmjs.com/files/package.json#main).

**The one requirement for an authoring tool module is that you export an ES6 class from your main JS file. If you don't do this, your module won't be included in the boot process. See below for examples:**

```
/*
* this can be either as the only export
*/
module.exports = ModuleClass
/*
* or in an object with a `Module` attribute
*/
module.exports = {
  Module: ModuleClass,
  export2,
  // etc...
}
```

**You'll also need to add some extra config to your `package.json`, see the configuration section below for more on this.**


## Recommended folder structure
Although an authoring module can consist of a single file, in all but the simplest of cases you'll find yourself wanting to split up your module into multiple files (and maybe even folders).

The below is what we recommend, and is the approach taken by the the core dev team for all core-supported modules.

| Name | Type | Description |
| ---- | ---- | ----------- |
| `config` | Folder | All config files go here (in `.json` format) |
| `lang` | Folder | All language files (to be used in user-facing messages) go here (in `.json` format) |
| `lib` | Folder | This folder contains the `.js` code |
| &nbsp;&nbsp;&nbsp;`datatypes` | Folder | This folder contains data models. |
| &nbsp;&nbsp;&nbsp;`api.js` | File | The API 'definition'. Contains no implementation code, but acts as an 'index' for developers to get a sense of exactly what the API exposes. |
| &nbsp;&nbsp;&nbsp;`controller.js` | File | Provides a link between the API definition and the lib code, by performing any relevant IO functions (most commonly things like processing and validating the incoming request and sending the response). |
| &nbsp;&nbsp;&nbsp;`lib.js` | File | The meat and potatoes of the module, this file contains the module-specific code, and should be easily unit testable. |
| &nbsp;&nbsp;&nbsp;`middleware.js` | File | Middleware functions. |
| &nbsp;&nbsp;&nbsp;`module.js` | File | The main module definition; provides the entry point into your module, and acts as the link between the above files. *Your module must inherit from the [Module class](../class/adapt_authoring_restructure/adapt-authoring-core/lib/module.js~Module.html) from the core module.* |
| `test` | Folder | Tests files go here. |

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
| `moduleDependencies` | Array | If your module relies on other Adapt authoring modules, you can list them here. If at runtime any of the modules in this list aren't installed, a warning is printed and your module isn't loaded. |

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

### Which phase should I use?
This is a question you will likely ask yourself when developing a new module, particularly one which needs to interact with an existing module.

The below table

| Phase | Summary |
| ----- | ------- |
| Instantiation | Assume nothing exists yet, concern yourself only with your own module's setup. |
| Preload | All module instances exist, so you will be able to access them at this point. |
| Boot | All modules have been preloaded and are ready to run. |

When trying to determine which phase you need to work with, you should ask yourself the following questions:

**Do I need to interact with any other modules?**<br>
If not, you can simply fit your code into the boot phases which seem to work best (remember that other modules may need to interact with yours, so try and be helpful and fit with the conventions when it comes to defining your boot process).

**Does my code need to complete before the boot process can continue?**<br>
If not, you can listen into that module's corresponding event. If taking this approach, be aware that some events may have already fired when you add a listener (e.g. if adding a preload listener from your module's boot function). Also note that you will need a reference to the specific module you're trying to listen to (so the constructor won't work...).

**None of the above**<br>
At this point, you've established that you need to interact with other modules asynchronously. You now need to decide where your code fits into the boot cycle according to what you're looking to achieve.

Here are a few examples as a guide:

**I have a module which needs to add an API**: you'll need to interact with the [Server](../class/adapt_authoring_restructure/adapt-authoring-server/lib/module.js~Server.html) module, so you need to be able to get a reference to that.
