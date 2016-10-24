#include "TOTVS.CH"

Class CloudBridgeApp From LongClassname
	Data Device
	Data MainWindow
	Data WebView
	Data WebChannel
	Data WSPort
	Data RootPath
	Data Platform

	Method New() Constructor

	//User can override this methods
	Method OnLoadFinished(url)
	Method OnStart()
	Method OnReceivedMessage(content)

	//Public helper methods
	Method ExecuteJavaScript(script, callback)

EndClass


Method New() Class CloudBridgeApp; Return
Method OnLoadFinished(url) Class CloudBridgeApp; Return
Method OnStart() Class CloudBridgeApp; Return
Method OnReceivedMessage(content) Class CloudBridgeApp; Return


//Public helper methods
Method ExecuteJavaScript(script, callback) Class CloudBridgeApp
	SELF:WebView:runJavaScript(script)
Return

/*
Method SendMessage(script, callback) Class CloudBridgeApp
	//advplToJs(....)
RETURN
*/
