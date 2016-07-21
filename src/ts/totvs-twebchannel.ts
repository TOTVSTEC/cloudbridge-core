declare class QWebChannel {
    constructor(socket: WebSocket, callback: Function);
}

namespace TOTVS {

    export class TWebChannel {
        socket: WebSocket;
        qwebchannel: QWebChannel;
        dialog: any;
        internalWSPort: number;

        static version = "1.0.1";
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

                socket.onclose = function () {
                    console.error("WebChannel closed");
                };

                socket.onerror = function (error) {
                    console.error("WebChannel error: " + error);
                };

                socket.onopen = function () {
                    _this.qwebchannel = new QWebChannel(socket, function (channel) {
                        _this.dialog = channel.objects.mainDialog;

                        // Carrega mensageria global [CSS, JavaScript]
                        _this.dialog.advplToJs.connect(function (codeType, codeContent, objectName) {
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

        runAdvpl(command, onSuccess) {
            // Formata JSON com o Bloco de Código e o callBack
            var jsonCommand = {
                'codeBlock': command,
                'callBack': onSuccess.name
            }

            this.dialog.jsToAdvpl("runAdvpl", JSON.stringify(jsonCommand));
        }

        getPicture(onSuccess) {
            this.dialog.jsToAdvpl("getPicture", onSuccess.name);
        }

        barCodeScanner(onSuccess) {
            this.dialog.jsToAdvpl("barCodeScanner", onSuccess.name);
        }

        pairedDevices(onSuccess) {
            this.dialog.jsToAdvpl("pairedDevices", onSuccess.name);
        }

        unlockOrientation() {
            this.dialog.jsToAdvpl("unlockOrientation", "");
        }

        lockOrientation() {
            this.dialog.jsToAdvpl("lockOrientation", "");
        }

        getCurrentPosition(onSuccess) {
            this.dialog.jsToAdvpl("getCurrentPosition", onSuccess.name);
        }

		testDevice(feature, onSuccess) : void {
            var jsonCommand = {
                'testFeature': feature,
                'callBack': onSuccess.name
            }

            this.dialog.jsToAdvpl("testDevice", JSON.stringify(jsonCommand));
        }

        createNotification(id, title, message) {
            var jsonCommand = {
                'id': id,
                'title': title,
                'message': message
            }
            this.dialog.jsToAdvpl("createNotification", JSON.stringify(jsonCommand));
        }

        openSettings(feature, onSuccess) {
            this.dialog.jsToAdvpl("openSettings", feature);
        }

        jsToAdvpl(codeType, codeContent) {
            this.dialog.jsToAdvpl(codeType, codeContent);
        }

    }

}
