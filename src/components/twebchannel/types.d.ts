declare class Promise {
	constructor(executor: Function);
	then: Function;
	catch: Function;
}

declare class QWebChannel {
	constructor(socket: WebSocket, callback: Function);
}

declare class QExportedObject {
	advplToJs: any;
	jsToAdvpl(id: string, value: string, callback: Function);
}
