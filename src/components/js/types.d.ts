declare class Promise<T> {
	constructor(executor: Function);

	then: Promise<T>;
	catch: Promise<T>;
}

declare class QWebChannel {
	constructor(socket: WebSocket, callback: Function);
}

declare class QExportedObject {
	advplToJs: any;
	jsToAdvpl(id: string, value: string, callback: Function);
}
