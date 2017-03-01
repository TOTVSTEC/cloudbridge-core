

namespace TOTVS {

	export class TWebChannel {
		private socket: WebSocket;
		private qwebchannel: QWebChannel;
		private dialog: QExportedObject;
		private internalWSPort: number = -1;
		private __send: Function;
		private queue: PromiseQueue = new PromiseQueue(0);

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
				var _this = this;
				var baseUrl = "ws://127.0.0.1:" + this.internalWSPort;
				var socket = new WebSocket(baseUrl);

				socket.onclose = function() {
					console.error("WebChannel closed");
				};

				socket.onerror = function(error) {
					console.error("WebChannel error: " + error);
				};

				socket.onopen = function() {
					_this.qwebchannel = new QWebChannel(socket, function(channel) {
						_this.dialog = channel.objects.mainDialog;

						// Carrega mensageria global [CSS, JavaScript]
						_this.dialog.advplToJs.connect(function(codeType, codeContent, objectName) {
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

								document.getElementsByTagName("head")[0].appendChild(linkRef)
							}
						});

						// Executa callback
						if (typeof callback === 'function')
							callback();

						_this.queue.setMaxPendingPromises(1);
					});
				}
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

		runAdvpl(command: string, callback: Function) {
			return this.__send("runAdvpl", command, callback);
		}

		getPicture(callback: Function) {
			return this.__send("getPicture", "", callback);
		}

		barCodeScanner(callback: Function) {
			return this.__send("barCodeScanner", "", callback);
		}

		pairedDevices(callback: Function) {
			return this.__send("pairedDevices", "", callback);
		}

		unlockOrientation(callback: Function) {
			return this.__send("unlockOrientation", "", callback);
		}

		lockOrientation(callback: Function) {
			return this.__send("lockOrientation", "", callback);
		}

		getCurrentPosition(callback: Function) {
			return this.__send("getCurrentPosition", "", callback);
		}

		testDevice(feature: number, callback: Function): void {
			return this.__send("testDevice", String(feature), callback);
		}

		createNotification(options: Object, callback: Function) {
			return this.__send("createNotification", options, callback);
		}

		openSettings(feature: number, callback: Function) {
			return this.__send("openSettings", String(feature), callback);
		}

		getTempPath(callback: Function) {
			return this.__send("getTempPath", "", callback);
		}

		vibrate(milliseconds: number, callback: Function) {
			return this.__send("vibrate", milliseconds, callback);
		}

		// Data Function BEGIN -----------------------------------------------------

		// Recupera dados a partir de uma query
		dbGet(query: string, callback: Function) {
			return this.__send("dbGet", query, callback);
		}

		// Executa query
		dbExec(query: string, callback: Function) {
			return this.__send("dbExec", query, callback);
		}

		dbExecuteScalar(query: string, callback: Function) {
			return this.__send("DBEXECSCALAR", query, callback);
		}

		// Begin transaction
		dbBegin(callback: Function) {
			return this.__send("dbBegin", "", callback);
		}

		// Commit
		dbCommit(callback: Function, onError) {
			return this.__send("dbCommit", "", callback);
		}

		// Rollback
		dbRollback(callback: Function) {
			return this.__send("dbRollback", "", callback);
		}

		sendMessage(content: string, callback: Function) {
			return this.__send("MESSAGE", content, callback);
		}

		private __send_promise(id: string, content: string, onSuccess: (value: any) => any, onError: (value: any) => any) {
  			var _this = this;

            var promise = this.queue.add(function() {
                return new Promise(function(resolve, reject) {
                    try {
                        _this.dialog.jsToAdvpl(id, _this.__JSON_stringify(content), function (data) {
                            resolve(_this.__JSON_parse(data));

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

		private __send_callback(id: string, content: string, onSuccess: Function, onError: Function) {
			var _this = this;

			try {
				if (typeof onSuccess === 'function') {
					_this.dialog.jsToAdvpl(id, _this.__JSON_stringify(content), function(data) {
						onSuccess(_this.__JSON_parse(data));
					});
				}
				else {
					_this.dialog.jsToAdvpl(id, _this.__JSON_stringify(content), null);
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

		private __JSON_stringify(data: any) {
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

		private __JSON_parse(data: any) {
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

	}

}
