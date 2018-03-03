import electron from 'electron';
import { spawn, ChildProcess } from 'child_process';
import { Loader } from './loader'
import { IpcHelper } from './ipc-helper';

const path = '' + electron;

export interface ElectronApp {
    start(appMain: string): Promise<void>
    restart(): Promise<void>
    reloadUI(): Promise<void>
    reloadBackground(): Promise<void>
}

class App implements ElectronApp {
    private child?: ChildProcess
    private ipcHelper?: IpcHelper;
    private appMain?: string;
    constructor(
    ) {

    }
    start(appMain: string): Promise<void> {
        return new Promise<void>((res, rej) => {
            this.child = spawn(path, [
                __dirname + '/main', 
                appMain
            ], { stdio: ['inherit', 'inherit', 'inherit', 'ipc'] });
            //this.child.on('exit', () =>{ this.child = undefined; this.ipcHelper = undefined })
            this.appMain = appMain;
            this.ipcHelper = new IpcHelper(this.child.send.bind(this.child), this.child.on.bind(this.child));
            const sub = this.ipcHelper.subscribe('initialized', async () => {
                sub.unsubscribe();
                res();
            })
        })
    }
    async restart(): Promise<void> {
        if (!this.appMain) return;
        if (this.child){
            this.child.kill();
        }
        await this.start(this.appMain);
    }
    async reloadUI(): Promise<void> {
        if (!this.ipcHelper) return;
        return await this.ipcHelper.send('reload-ui', {});
    }
    async reloadBackground(): Promise<void> {
        if (!this.ipcHelper) return;
        return await this.ipcHelper.send('reload-background', {});
    }
}

export function electronAutomation(): ElectronApp {
    return new App();
}
