YTemplater
==========

[![Build Status](https://travis-ci.org/orionhealth/ytemplater.png?branch=master)](https://travis-ci.org/orionhealth/ytemplater)
[![Dependency Status](https://gemnasium.com/orionhealth/ytemplater.png)](https://gemnasium.com/orionhealth/ytemplater)

Node.js utility for precompiling templates for use with YUI's Y.Template.

Usage
-----

```js
var ytemplater = require('ytemplater');
```

### ytemplater.precompile(files, options)

Precompiles the given files and concatenates the resulting JavaScript to a single file.

```js
ytemplater.precompile(['my-template.handlebars', 'my-other-template.micro'], {
    out: 'build/',
    moduleName: 'my-templates'
}); // => Creates build/my-templates.js
```

- **files** {String[]} array of paths to the templates to precompile. Template files should be named according to their template engine i.e. `*.handlebars`, `*.micro`.
- **options** {Object} additional config
  - **out** {String} file or directory to write the precompiled template JavaScript to. Defaults to `process.cwd()`.
  - **moduleName** {String} name of the module that hosts these precompiled templates - used to determine the name of the JavaScript file to write to (unless `options.out` is a .js file). If not specified and `options.out` is omitted or a directory, ytemplater will write to a file called "templates.js".

Returns a [Q promise](https://github.com/kriskowal/q) that is resolved once the JavaScript file has been written (or rejected in the event of an error).

### ytemplater.precompileShifterModule(shifterModuleDir)

Precompiles templates for a given [shifter](http://yui.github.io/shifter/) module. Parses the `build.json` for declared template module builds, precompiles the appropriate template files and writes the resulting JavaScript file(s) to the module's `js` directory (ready for shifter to build it).

```js
ytemplater.precompileShifterModule('my-shifter-module/');
// => Parses my-shifter-module/build.json
// => Precompiles declared templates to .js files in my-shifter-module/js/
```

- **shifterModuleDir** {String} path to a shifter module. The module's `build.json` should declare at least one template module build, see the [build.json Reference](#buildjson-reference) below.

Returns a [Q promise](https://github.com/kriskowal/q) that is resolved once the JavaScript file(s) have been written (or rejected in the event of an error).

#### build.json Reference

The module's `build.json` should contain a `ytemplater` section with one or more declared template modules containing a `templateFiles` array with the list of templates to precompile for that module. For example:

```json
{
  "name": "my-module",
  "builds": {
    "my-module": {
      "jsfiles": ["my-module.js"]
    },
    "my-module-templates": {
      "jsfiles": ["my-module-templates.js"]
    }
  },
  "ytemplater": {
    "my-module-templates": {
      "templateFiles": [
        "my-template-1.handlebars",
        "my-template-2.micro"
      ]
    }
  }
}
```

**Note:** ytemplater just precompiles the templates in place in the shifter module directory, you will either need to have a shifter build declared and shifter meta data for each template module or concatenate the resulting JavaScript files into an existing build (see the [shifter docs](http://yui.github.io/shifter/) for more info).

CLI
---

Install the `ytemplater` command:
```
$ npm install -g ytemplater
```

```
$ ytemplater --help

Usage:

 ytemplater [options] files...
 ytemplater --shifter dirs...


Options:
  -o, --out          File or directory to write the precompiled templates to
  -m, --module-name  Used to determine the name of the file to write to when specifying a directory for -o
  -s, --shifter      Find and precompile templates in the given shifter module directories; all other options are ignored
  -h, --help         Show this usage information
```

### Default Mode

In this mode specify a list of files and optionally the `-o` or `-m` flag to determine where to write the precompiled JavaScript to.

```bash
ytemplater templates/*.handlebars -o build/ -m "my-templates"
# => Creates build/my-templates.js
```

### Shifter Mode

In this mode specify shifter module directories to have ytemplater build their declared templates into their `js` directories. In this mode other options (such as `-o` and `-m`) are ignored.

```bash
ytemplater -s my-shifter-module/
# => Parses my-shifter-module/build.json
# => Precompiles declared templates to .js files in my-shifter-module/js/
```

Contributing
------------

### Building

YTemplater is built with [gulp.js](http://gulpjs.com/).

First, install the `gulp` CLI:

    $ npm install -g gulp

Run `gulp` to lint, test and watch for changes:

    $ gulp


### Tests & Coverage

You can also run the tests and generate a test coverage report (using [Istanbul](https://github.com/gotwarlost/istanbul)) with:

    $ npm test --coverage


License
-------

Copyright (c) 2014 Orion Health MIT License (enclosed)
