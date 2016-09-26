declare class QWebChannel {
    constructor(socket: WebSocket, callback: Function);
}

declare class QExportedObject {
	advplToJs: any;
	jsToAdvpl(id: string, value: string, callback: Function);
}

namespace TOTVS {

    export class TWebChannel {
        socket: WebSocket;
        qwebchannel: QWebChannel;
        dialog: QExportedObject;
        internalWSPort: number;

        static version = "<%= package.version %>";
        static BLUETOOTH_FEATURE = 1;
        static NFC_FEATURE = 2;
        static WIFI_FEATURE = 3;
        static LOCATION_FEATURE = 4;
        static CONNECTED_WIFI = 5;
        static CONNECTED_MOBILE = 6;

        constructor(port: number, callback: Function) {
            this.internalWSPort = port;

            if (this.internalWSPort) {
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
                    });
                }
            }
        }

        runAdvpl(command: string, callback: Function) {
            // Formata JSON com o Bloco de Código e o callBack
            var jsonCommand = {
                'codeBlock': command,
                'callBack': callback
            }

            this.dialog.jsToAdvpl("runAdvpl", command, callback);
        }

        getPicture(callback: Function) {
            this.dialog.jsToAdvpl("getPicture", "", callback);
        }

        barCodeScanner(callback: Function) {
            this.dialog.jsToAdvpl("barCodeScanner", "", callback);
        }

        pairedDevices(callback: Function) {
            this.dialog.jsToAdvpl("pairedDevices", "", callback);
        }

        unlockOrientation(callback: Function) {
            this.dialog.jsToAdvpl("unlockOrientation", "", callback);
        }

        lockOrientation(callback: Function) {
            this.dialog.jsToAdvpl("lockOrientation", "", callback);
        }

        getCurrentPosition(callback: Function) {
            this.dialog.jsToAdvpl("getCurrentPosition", "", callback);
        }

		testDevice(feature: string, callback: Function): void {
            var jsonCommand = {
                'testFeature': feature,
                'callBack': callback
            }

            this.dialog.jsToAdvpl("testDevice", feature, callback);
        }

		createNotification(options: Object, callback: Function) {
			/*
            var jsonCommand = {
                'id': id,
                'title': title,
                'message': message
            }
			*/

            this.dialog.jsToAdvpl("createNotification", JSON.stringify(options), callback);
        }

        openSettings(feature: string, callback: Function) {
            this.dialog.jsToAdvpl("openSettings", feature, callback);
        }

		getTempPath(callback: Function) {
			this.dialog.jsToAdvpl("getTempPath", "", callback);
		}

		vibrate(milliseconds: number, callback: Function) {
			this.dialog.jsToAdvpl("vibrate", milliseconds.toString(), callback);
		}

		// Data Function BEGIN -----------------------------------------------------

		// Recupera dados a partir de uma query
		dbGet(query: string, callback: Function) {
			this.dialog.jsToAdvpl("dbGet", query, callback);
		}

		// Executa query
		dbExec(query: string, callback: Function) {
			this.dialog.jsToAdvpl("dbExec", query, callback);
		}

		dbExecuteScalar(query: string, callback: Function) {
			if (callback) {
				this.dialog.jsToAdvpl("DBEXECSCALAR", query, function(data) {
					var json = JSON.parse(data);

					if (!json.data)
						json.data = null;

					callback(json);
				});
			} 
			else {
				this.dialog.jsToAdvpl("DBEXECSCALAR", query, null);
			}
		}

		// Begin transaction
		dbBegin(callback: Function) {
			this.dialog.jsToAdvpl("dbBegin", "", callback);
		}

		// Commit
		dbCommit(callback: Function, onError) {
			this.dialog.jsToAdvpl("dbCommit", "", callback);
		}

		// Rollback
		dbRollback(callback: Function) {
			this.dialog.jsToAdvpl("dbRollback", "", callback);
		}

		sendMessage(content: string, callback: Function) {
            this.dialog.jsToAdvpl("MESSAGE", content, callback);
		}

    }

}
