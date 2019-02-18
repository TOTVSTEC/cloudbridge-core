namespace TOTVS {

	var __JSON_stringify = (data: any) => {
		if (data === null) {
			return null;
		}
		else if (typeof data === "string") {
			return data;
		}
		else {
			if ((Array.isArray(data)) || (typeof data === "object")) {
				return TWebChannel.JSON_FLAG + JSON.stringify(data) + TWebChannel.JSON_FLAG;
			}
		}

		return JSON.stringify(data);
	}

	var __JSON_parse = (data: any) => {
		if (typeof data === 'string') {
			var flag = TWebChannel.JSON_FLAG;

			if (data.length >= (2 + (flag.length * 2))) {
				var begin = flag.length,
					end = data.length - flag.length;

				if ((data.substr(0, begin) === flag) && (data.substr(end) === flag)) {
					return JSON.parse(data.substring(begin, end));
				}
			}
		}

		return data;
	}

	export class TWebChannel {
		private socket: WebSocket;
		private qwebchannel: QWebChannel;
		private dialog: QExportedObject;

		protected internalWSPort: number = -1;
		protected __send: (id: string, content: any, onSuccess?: (value: any) => any, onError?: (value: any) => any) => any;
		protected queue: PromiseQueue = new PromiseQueue(0);

		static instance: TWebChannel = null;

		static version = "<%= package.version %>";
		static BLUETOOTH_FEATURE = 1;
		static NFC_FEATURE = 2;
		static WIFI_FEATURE = 3;
		static LOCATION_FEATURE = 4;
		static CONNECTED_WIFI = 5;
		static CONNECTED_MOBILE = 6;
		static JSON_FLAG = "#JSON#";

		constructor(port: number, callback: Function) {
			if (window['Promise'] !== undefined) {
				this.__send = this.__send_promise;
			}
			else {
				this.__send = this.__send_callback;
			}

			if ((callback === undefined) && (typeof port === 'function')) {
				callback = port;
				port = undefined;
			}

			if (port !== undefined) {
				if (typeof port !== 'number')
					throw new TypeError('Parameter "port" must be numeric.');

				this.internalWSPort = port;
			}


			if (this.internalWSPort === -1) {
				throw new Error('Parameter "port" must be numeric.');
			}

			if (this.internalWSPort > -1) {
				this.connect(callback);
			}
		}

		connect(callback: Function) {
			var baseUrl = "ws://127.0.0.1:" + this.internalWSPort;
			var socket = new WebSocket(baseUrl);

			socket.onclose = function() {
				console.error("WebChannel closed");
			};

			socket.onerror = function(error) {
				console.error("WebChannel error: " + error);
			};

			socket.onopen = () => {
				this.qwebchannel = new QWebChannel(socket, (channel) => {
					this.dialog = channel.objects.mainDialog;

					// Carrega mensageria global [CSS, JavaScript]
					this.dialog.advplToJs.connect(this.onReceiveAdvplToJs.bind(this));

					// Executa callback
					if (typeof callback === 'function')
						callback();

					this.queue.setMaxPendingPromises(1);
				});
			}
		}

		onReceiveAdvplToJs(codeType: string, codeContent: string) {
			if (codeType == "js") {
				var scriptRef = document.createElement('script');
				scriptRef.setAttribute("type", "text/javascript");
				scriptRef.innerText = codeContent;

				document.getElementsByTagName("head")[0].appendChild(scriptRef);
			}
			else if (codeType == "css") {
				var linkRef = document.createElement("link");
				linkRef.setAttribute("rel", "stylesheet");
				linkRef.setAttribute("type", "text/css");
				linkRef.innerText = codeContent;

				document.getElementsByTagName("head")[0].appendChild(linkRef);
			}
		}

		static start(port: number) {
			if (TWebChannel.instance === null) {
				var channel = new TWebChannel(port, function() {
					TWebChannel.instance = channel;

					if (window) {
						window['cloudbridge'] = channel;
					}

					TWebChannel.emit('cloudbridgeready');
				});
			}
			else {
				TWebChannel.emit('cloudbridgeready');
			}
		}


		static emit(name: string) {
			var event = new CustomEvent(name, {
				'detail': {
					'channel': TWebChannel.instance
				}
			});

			event["channel"] = TWebChannel.instance;

			document.dispatchEvent(event);
		}

		runAdvpl(command: string, callback: (value: any) => any) {
			return this.__send("runAdvpl", command, callback);
		}

		getPicture(callback: (value: any) => any) {
			return this.__send("getPicture", "", callback);
		}

		barCodeScanner(callback: (value: any) => any) {
			return this.__send("barCodeScanner", "", callback);
		}

		pairedDevices(callback: (value: any) => any) {
			return this.__send("pairedDevices", "", callback);
		}

		unlockOrientation(callback: (value: any) => any) {
			return this.__send("unlockOrientation", "", callback);
		}

		lockOrientation(callback: (value: any) => any) {
			return this.__send("lockOrientation", "", callback);
		}

		getCurrentPosition(callback: (value: any) => any) {
			return this.__send("getCurrentPosition", "", callback);
		}

		testDevice(feature: number, callback: (value: any) => any): void {
			return this.__send("testDevice", String(feature), callback);
		}

		createNotification(options: Object, callback: (value: any) => any) {
			return this.__send("createNotification", options, callback);
		}

		openSettings(feature: number, callback: (value: any) => any) {
			return this.__send("openSettings", String(feature), callback);
		}

		getTempPath(callback: (value: any) => any) {
			return this.__send("getTempPath", "", callback);
		}

		vibrate(milliseconds: number, callback: (value: any) => any) {
			return this.__send("vibrate", milliseconds.toString(), callback);
		}

		// Recupera dados a partir de uma query
		dbGet(query: string, callback: (value: any) => any) {
			return this.__send("dbGet", query, callback);
		}

		// Executa query
		dbExec(query: string, callback: (value: any) => any) {
			return this.__send("dbExec", query, callback);
		}

		dbExecuteScalar(query: string, callback: (value: any) => any) {
			return this.__send("DBEXECSCALAR", query, callback);
		}

		// Begin transaction
		dbBegin(callback: (value: any) => any) {
			return this.__send("dbBegin", "", callback);
		}

		// Commit
		dbCommit(callback: (value: any) => any, onError) {
			return this.__send("dbCommit", "", callback);
		}

		// Rollback
		dbRollback(callback: (value: any) => any) {
			return this.__send("dbRollback", "", callback);
		}

		sendMessage(content: string, callback: (value: any) => any) {
			return this.__send("MESSAGE", content, callback);
		}

		protected __send_promise(id: string, content: any, onSuccess?: (value: any) => any, onError?: (value: any) => any) {
			var promise = this.queue.add(() => {
				return new Promise((resolve, reject) => {
					try {
						this.dialog.jsToAdvpl(id, __JSON_stringify(content), (data) => {
							resolve(__JSON_parse(data));

							if ((onSuccess) && (typeof onSuccess === 'function')) {
								onSuccess(data);
							}
						});
					}
					catch (error) {
						reject(error);

						if ((onError) && (typeof onError === 'function')) {
							onError(error);
						}
					}
				});
			});

			return promise;
		}

		protected __send_callback(id: string, content: any, onSuccess?: (value: any) => any, onError?: (value: any) => any) {
			try {
				if (typeof onSuccess === 'function') {
					this.dialog.jsToAdvpl(id, __JSON_stringify(content), (data) => {
						onSuccess(__JSON_parse(data));
					});
				}
				else {
					this.dialog.jsToAdvpl(id, __JSON_stringify(content), null);
				}
			}
			catch (error) {
				if ((onError) && (typeof onError === 'function')) {
					onError(error);
				}
				else {
					throw error;
				}
			}
		}

	}

	export class TMessageChannel extends TWebChannel {

		private execId: number = 0;
		private execCallbacks: Object = {};
		private channel: MessageChannel;

		connect(callback: () => void) {
			this.channel = new MessageChannel();

			this.channel.port1.onmessage = (event: MessageEvent) => {
				var data = event.data,
					messageType = (data.type || 'UNDEFINED').toUpperCase();

				switch (messageType) {
					case 'CONNECTED':
						if (typeof callback === 'function')
							callback();

						this.queue.setMaxPendingPromises(1);

						break;
					case 'DISCONNECTED':

						break;
					case 'EXEC':
						console.log("received a EXEC message.", event);

						this.onReceiveAdvplToJs(
							data.value.type,
							data.value.content
						);

						break;
					case 'RETURN':
						console.log("received a RETURN message.", event);

						if (this.execCallbacks[data.execId]) {
							var defered = this.execCallbacks[data.execId];

							defered.resolve(__JSON_parse(data.value.value));

							delete this.execCallbacks[data.execId];
						}

						break;
					default:
						console.error("invalid message: " + messageType, event);

						break;
				}
			}

			window.parent.postMessage({
				type: 'CONNECT',
				port: this.internalWSPort
			}, window.location.origin, [this.channel.port2]);
		}

		static start(port: number) {
			if (TMessageChannel.instance === null) {
				var channel = new TMessageChannel(port, () => {
					TMessageChannel.instance = channel;

					if (window) {
						window['cloudbridge'] = channel;
					}

					TMessageChannel.emit('cloudbridgeready');
				});
			}
			else {
				TMessageChannel.emit('cloudbridgeready');
			}
		}

		protected __send_promise(messageId: string, content: string, onSuccess: (value: any) => any, onError: (value: any) => any) {
			var execId = ++this.execId;

			if (this.execId === Number.MAX_VALUE) {
				this.execId = Number.MIN_VALUE;
			}

			var promise = this.queue.add(() => {
				return new Promise((resolve, reject) => {
					try {
						this.execCallbacks[execId] = {
							resolve: resolve,
							reject: reject
						};

						var message = {
							execId: execId,
							type: messageId,
							content: __JSON_stringify(content),
							port: this.internalWSPort
						};

						this.channel.port1.postMessage(message);
					}
					catch (error) {
						reject(error);

						if ((onError) && (typeof onError === 'function')) {
							onError(error);
						}
					}
				});
			});

			return promise;
		}

	}

}
