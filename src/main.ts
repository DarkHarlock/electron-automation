import { app, BrowserWindow } from 'electron';
import { IpcHelper } from './ipc-helper';
import { WindowTracker } from './window-tracker';
import { Loader } from './loader';

app.on('ready', async info => {
    if (process.send) {
        const tracker = new WindowTracker();
        const loader = new Loader(tracker);
        const ipcHelper = new IpcHelper(process.send.bind(process), process.on.bind(process));

        ipcHelper.subscribe('reload-ui', async data => {
            loader.reloadUI();
        })
        ipcHelper.subscribe('reload-background', async data => {
            loader.reloadBackgroundJob();
        })
        await ipcHelper.send('initialized', {})
    }
});

require(process.argv[process.argv.length - 1]);
