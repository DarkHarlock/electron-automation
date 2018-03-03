import { app, BrowserWindow } from 'electron';

export class WindowTracker {
    private windows: { [id: number]: BrowserWindow } = {};

    constructor(
    ) {
        app.on("browser-window-created", (event, window) => {
            const id = window.id;
            this.windows[id] = window;
            window.once("closed", () => {
                delete this.windows[id];
            });
        })
    }
    private filter(f: (w: BrowserWindow) => boolean): BrowserWindow[] {
        const ret = [];
        for (const wid in Object.keys(this.windows)) {
            const w = this.windows[wid];
            if (f(w)) ret.push(w)
        }
        return ret;
    }

    background(): BrowserWindow[] {
        return this.filter(w => !w.isVisible())
    }

    displayed(): BrowserWindow[] {
        return this.filter(w => w.isVisible())
    }
}