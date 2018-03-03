import { WindowTracker } from "./window-tracker";
import { app } from "electron";

export class Loader {
    constructor(
        private tracker: WindowTracker
    ){

    }
    reloadUI() {
        for (var window of this.tracker.displayed()) {
            window.reload();
        }
    }

    reloadBackgroundJob() {
        for (var window of this.tracker.background()) {
            window.reload();
        }        
    }
}