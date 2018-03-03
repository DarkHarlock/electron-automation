# electron-automation

Utility tool to develop applications with [Electron](https://electronjs.org/).

Using this in your `Node.js` scripts (e.g. `gulpfile.js`), you can livereload your Electron app.

It provides the following features:

* start / restart `Electron` application.
* reload renderer visible (UI) processes.
* reload renderer not visible (background) processes.

## Install
Use npm:

```bash
npm install electron-automation --save-dev
```

## Usage
`electron-automation` has 2 components. They communicate with each other using Ipc.

The main component is a standard node modules that can start your `Electron` application from a `nodejs` process.
The second one is an `Electron` main process script that communicate with the parent `nodejs` process via Ipc and than start your application.

> No changes required into your application in most cases.

> No socket used!

### How to with Gulp
Here is an example on how start your application with a [gulpfile](http://gulpjs.com/).

```ts
/// typescript
import * as gulp from 'gulp';
import { electronAutomation } from 'electron-automation';

let electron = electronAutomation();

gulp.task('serve', function () {

    // Start browser process
    electron.start(process.cwd() + '/app');

    // Restart browser process
    gulp.watch('app.js', electron.restart);

    // Reload all renderer processes
    gulp.watch(['index.js', 'index.html'], electron.reloadUI);

    // Reload all renderer background processes
    gulp.watch(['background.js', 'background.html'], electron.reloadBackground);

});
```

All methods runs asynchronously and returns `Promise`. You should `await` it to avoid concurrent calls.

This library was inspired by the work done in:

* [`electron-connect`](https://github.com/Quramy/electron-connect)
* [`electron-reload`](https://github.com/yan-foto/electron-reload)
* [`electron-livereload`](https://github.com/BoLaMN/electron-livereload)

Thanks to all!
