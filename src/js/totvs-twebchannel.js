// TOTVS Tecnology Namespace
var totvstec = {
	// Versao
	version: "1.0.1",
    
    // Porta do WebSocket
    internalWSPort: 0,

    // Defines do OpenSettings e TestDevice
    BLUETOOTH_FEATURE: 1,
    NFC_FEATURE:       2,
    WIFI_FEATURE:      3,
    LOCATION_FEATURE:  4,
    CONNECTED_WIFI:	   5,
    CONNECTED_MOBILE:  6,
    
    // Recupera dados do GET enviado via URL
    // http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
    getParam: function (queryField) {
        var url = window.location.href;
        queryField = queryField.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + queryField + "(=([^&#]*)|&|#|$)", "i"),
                results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    },

    // Conecta WebSocket e prepara mensageria global
    connectWS: function (callBack) {
		var _this = this;
					
        this.internalWSPort = this.getParam('totvstec_websocket_port');
        
		if (this.internalWSPort) {
			var baseUrl = "ws://127.0.0.1:" + this.internalWSPort;

			var socket = new WebSocket(baseUrl);
			socket.onclose = function () { console.error("WebChannel closed"); };
			socket.onerror = function (error) { console.error("WebChannel error: " + error); };
			socket.onopen = function () {
				new QWebChannel(socket, function (channel) {
					_this.dialog = channel.objects.mainDialog;

					// Carrega mensageria global [CSS, JavaScript]
					_this.dialog.advplToJs.connect(function(codeType, codeContent, objectName) {
						if (codeType == "js") {
							var fileref = document.createElement('script');
							fileref.setAttribute("type", "text/javascript");
							fileref.innerText = codeContent;

							document.getElementsByTagName("head")[0].appendChild(fileref);
						}
						else if (codeType == "css") {
							var fileref = document.createElement("link");
							fileref.setAttribute("rel", "stylesheet");
							fileref.setAttribute("type", "text/css");
							fileref.innerText = codeContent;

							document.getElementsByTagName("head")[0].appendChild(fileref)
						}
					});

					// Executa callback
					callBack();
				});
			}
		}
    },

    runAdvpl: function (command, onSuccess) {
		// Formata JSON com o Bloco de Código e o callBack
		var jsonCommand = {
			'codeBlock': command,
			'callBack': onSuccess.name
		}
        this.dialog.jsToAdvpl("runAdvpl", JSON.stringify(jsonCommand));
    },

    getPicture: function (onSuccess) {
        this.dialog.jsToAdvpl("getPicture", onSuccess.name);
    },

    barCodeScanner: function (onSuccess) {
        this.dialog.jsToAdvpl("barCodeScanner", onSuccess.name);
    },

    pairedDevices: function (onSuccess) {
        this.dialog.jsToAdvpl("pairedDevices", onSuccess.name);
    },

    unlockOrientation: function () {
        this.dialog.jsToAdvpl("unlockOrientation", "");
    },

    lockOrientation: function () {
        this.dialog.jsToAdvpl("lockOrientation", "");
    },

    getCurrentPosition: function (onSuccess) {
        this.dialog.jsToAdvpl("getCurrentPosition", onSuccess.name);
    },

    testDevice: function (feature, onSuccess) {
		var jsonCommand = {
			'testFeature': feature,
			'callBack': onSuccess.name
		}
        this.dialog.jsToAdvpl("testDevice", JSON.stringify(jsonCommand));
    },
    
    createNotification: function (id, title, message) {
		var jsonCommand = {
			'id': id,
			'title': title,
			'message': message
		}
        this.dialog.jsToAdvpl("createNotification", JSON.stringify(jsonCommand));
    },
    
    openSettings: function (feature, onSuccess) {
        this.dialog.jsToAdvpl("openSettings", feature);
    },
	
	jsToAdvpl: function(codeType, codeContent) {
		this.dialog.jsToAdvpl(codeType, codeContent);
	}

}


