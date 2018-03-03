interface PromiseCompletion<T> extends Promise<T> {
    resolve(value?: T): void;
    reject(reason: any): void;
}

function createCompletablePromise<T>(): PromiseCompletion<T> {
    const obj: any = {};
    const result: any = new Promise<T>((res, rej) => {
        obj.resolve = res;
        obj.reject = rej;
    });
    return Object.assign(result, obj);
}

interface MessageResponse {
    requestid: string
    error?: any
    data?: any
}
interface MessageRequest {
    requestid: string
    command: string
    data: any
}

export interface IpcHelperSend {
    (message: any): void;
}
export interface IpcHelperOn {
    (event: 'message', callback: (msg: any) => void): void;
}

export interface Subscription {
    unsubscribe(): void
}

export class IpcHelper {
    private pending: { [key: string]: PromiseCompletion<any> } = {};
    private subscription: { [key: string]: (data: any) => Promise<any> } = {};

    constructor(
        private ipcChannelSend: IpcHelperSend,
        private ipcChannelOn: IpcHelperOn
    ) {
        this.ipcChannelOn('message', (message: MessageResponse | MessageRequest) => {
            if (this.isRequest(message)) {
                this.handleRequest(message);
            }
            else {
                if (message.error) { return this.reject(message.requestid, message.error); }
                else { return this.resolve(message.requestid, message.data); }
            }
        });
    }

    getId = (() => { let count = 0; return () => count++ })()

    private isRequest(message: any): message is MessageRequest {
        return !!(message.command);
    }

    private resolve(requestid: string, result: any): void {
        this.pending[requestid].resolve(result);
        delete this.pending[requestid];
    }
    private reject(requestid: string, reason: any): void {
        this.pending[requestid].reject(reason);
        delete this.pending[requestid];
    }
    private async handleRequest(message: MessageRequest) {
        const handle = this.subscription[message.command];
        try {
            if (handle) {
                const data = await handle(message.data);
                const response: MessageResponse = { data, requestid: message.requestid }
                this.ipcChannelSend(response);
            } else {
                throw new Error();
            }
        } catch (error) {
            const response: MessageResponse = { error, requestid: message.requestid }
            this.ipcChannelSend(response);
        }
    }

    send(command: string, data: any): Promise<any> {
        const requestid = `request-${this.getId()}`;
        const request: MessageRequest = { requestid, command, data }
        const promise = createCompletablePromise();
        this.pending[requestid] = promise;
        this.ipcChannelSend(request);
        return promise;
    }

    subscribe(command: string, callback: (data: any) => Promise<void>): Subscription {
        if (this.subscription[command])
            throw new Error("Already subscribed");
        this.subscription[command] = callback;
        const unsubscribe = () => { delete this.subscription[command]; };
        return { unsubscribe }
    }
}