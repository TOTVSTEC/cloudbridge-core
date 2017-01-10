#include "cloudbridge.ch"

Main Function CloudBridge(cloudProg)
	Local name := GetName(cloudProg)
	Local initializer := &("{|| " + name + "():New() }")

	Private app := nil

	if valType(initializer) == "B"
		app:= eval(initializer)
	endif

	_CreateComponents(app)
	_InitConfig(app)
	_Start(app)
return

Static Function GetName(cloudProg)
	Local pos:= AT(".CLOUD", Upper(cloudProg))

	if (pos > 0)
		return SubStr(cloudProg, 1, pos - 1)
	endif

	return cloudProg
return

Static Function _CreateComponents(app)
	ErrorBlock({|e| _OnError(app, e) })

	app:Platform:= PlatformInfo():New()

	app:MainWindow := TWindow():New(0, 0, 960, 540, "TOTVS - CloudBridge", NIL, NIL, NIL, NIL, NIL, NIL, NIL, CLR_BLACK, CLR_WHITE, NIL, NIL, NIL, NIL, NIL, NIL, .T. )
	//app:MainWindow := TDialog():New(0, 0, 0, 0, "TOTVS - CloudBridge", NIL, NIL, NIL, NIL, CLR_BLACK, CLR_WHITE, NIL, NIL, .T. , NIL, NIL, NIL, 960, 540)
	app:MainWindow:bStart:= {|| _WindowStarted(app) }

	app:Device := TMobile():New()

	if AttIsMemberOf(app:Device, "bOnPause")
		app:Device:bOnPause:= {|| _OnPause(app) }
	EndIf

	if AttIsMemberOf(app:Device, "bOnResume")
		app:Device:bOnResume:= {|| _OnResume(app) }
	EndIf

    app:WebChannel := TWebChannel():New()
	app:WebChannel:bJsToAdvpl := {|channel, codeType, codeContent| _ReceivedMessage(app, codeType, codeContent) }

    app:WSPort:= app:WebChannel:connect()

    app:WebView := TWebEngine():New(app:MainWindow, 0, 0, 100, 100,, app:WSPort)
    app:WebView:bLoadFinished := {|webview, url| _OnLoadFinished(app, url) }
    app:WebView:setAsMain() // Define como WebEngine que recebera o KEY_BACK (Android)
    app:WebView:Align := CONTROL_ALIGN_ALLCLIENT
return

Static Function _OnError(app, error)
	Local buttonOk
	Local textError
	Local stack:= error:ErrorStack

	Private oDlgError

	app:WebView:hide()

	DEFINE MSDIALOG oDlgError TITLE "Error" FROM 000, 000  TO 500, 500 COLORS 0, 16777215 PIXEL
		@ 000, 000 GET textError VAR stack OF oDlgError MULTILINE SIZE 250, 224 COLORS 0, 16777215 HSCROLL READONLY PIXEL
		@ 228, 210 BUTTON buttonOk PROMPT "OK" SIZE 037, 020 OF oDlgError ACTION {|| oDlgError:End() } PIXEL
		textError:Align := CONTROL_ALIGN_TOP
	ACTIVATE MSDIALOG oDlgError CENTERED

	break(stack)
Return

Static Function _WindowStarted(app)

	//app:MainWindow:Move(0, 0, 540, 960, .T., .T.)
	//app:MainWindow:nWidth:= 50
	//app:MainWindow:CommitControls()
Return

Static Function _GetSetting(section, key, defaultValue)
	Default defaultValue := ""
	static ini:= GetRemoteIniName()

	return GetPvProfString(section, key, defaultValue, ini)
return

Static Function _SaveSetting(section, key, value)
	static ini:= GetRemoteIniName()

	WritePProString(section, key, value, ini)
return

Static Function _OnLoadFinished(app, url)
	Local script
	script:= "TOTVS.TWebChannel.start(" + AllTrim(Str(app:WSPort)) + ");"

	app:ExecuteJavaScript(script)

	app:OnLoadFinished(url)
return

Static Function _OnPause(app)
	app:ExecuteJavaScript("TOTVS.TWebChannel.emit('pause');")
	app:OnPause()
Return

Static Function _OnResume(app)
	app:ExecuteJavaScript("TOTVS.TWebChannel.emit('resume');")
	app:OnResume()
Return

Static Function _TestServerIp(ip)
	Local timeout:= 2
	Local status

	url:= _BuildUrl(ip)

	HttpCGet(url + "time.apl", NIL, timeout)
	status:= HTTPGetStatus(NIL)

	return (status == 200)
return

Static Function _BuildUrl(ip)
	static port:=  AllTrim(Str(GetPort(3)))

	return "http://" + ip + ":" + port + "/"
return

Static Function _FindServerIp(app)
	Local serverIP := GetServerIP(.T.)
	Local i := 0

	for i:= 1 to Len(serverIP)
		if (serverIP[i][1] != "IPv4")
			LOOP
		endif

		if (_TestServerIp(serverIP[i][4]))
			return serverIP[i][4]
		endif
	next

	return ""
return

Static Function _GetRootPath(app)
	Local serverIp

	if (app:Platform:IS_ANDROID)
		app:RootPath:= "file:///android_asset/web/"
	else
		serverIp:= _GetSetting("CloudBridge", "ServerAddress")

		If (serverIp != "")
			conout("ServerIp != ''")

			if (_TestServerIp(serverIp) == .F.)
				conout("ServerIp Test failed, reseting")
				serverIp:= ""
			endif
		endif

		If (serverIp == "")
			conout("_FindServerIp...")
			serverIp:= _FindServerIp(app)

			conout("_SaveSetting: " + serverIp)
			_SaveSetting("CloudBridge", "ServerAddress", serverIp)
		endif

		app:RootPath:= _BuildUrl(serverIp)
	endif

	ConOut(app:RootPath)
return

Static Function _InitConfig(app)
	_GetRootPath(app)


	//_ExtractFiles(app)
return

/*
Static Function _ExtractFiles(app)
	Local program:= AllTrim(Lower(GetClassName(app)))
	//Local outputPath := "\cloudbridge"
	Local outputPath := GetPvProfString("config", "AndroidPath", "", GetRemoteIniName())


	//if (OutputPath == "")
	//	OutputPath := GetPvProfString("http", "Path", "", GetSrvIniName())
	//else
	OutputPath += "/cloudbridge"
	//endif

	ConOut("OutputPath: " + OutputPath)

	if (!ExistDir(outputPath))
		MakeDir(outputPath)
	endif

	_WriteFile(app, OutputPath, program + ".cloud")
	_WriteFile(app, OutputPath, program + ".wpk")

	outputPath += "\" + program

	if (!ExistDir(outputPath))
		MakeDir(outputPath)
	endif

	FUnZip(outputPath + ".wpk", outputPath)
return

Static Function _WriteFile(app, outputPath, filename)
	//Local fileHandle
	Local result

	ConOut("_WriteFile: " + OutputPath + "\" + fileName)

	//fileHandle := FCreate(OutputPath + "\" + fileName)
	//FWrite(fileHandle, getApoRes(fileName))
    //FClose(fileHandle)

    result:= Resource2File(filename, OutputPath + "\" + fileName)

    //Varinfo("result", result)
return
*/

/*
Method _Unpack() Class CloudBridgeApp

return
*/

Static Function _Start(app)
	ConOut("  WebSocket port: " + AllTrim(Str(app:WSPort)))
	app:OnStart()

/*
	//if (app:Platform:IS_DESKTOP)
	if (app:Platform:IS_MOBILE)
		//app:MainWindow:nHeight	:= 10 //960
		//app:MainWindow:nWidth	:= 10 //540

		app:MainWindow:Move(0, 0, 480, 848, .T., .T.)
		//app:MainWindow:Activate()
	else
		app:MainWindow:lMaximized:= .T.
	endif
*/
	app:MainWindow:Activate("MAXIMIZED")
	//app:MainWindow:Activate(NIL, NIL, NIL, .T.)
return

Static Function _ReceivedMessage(app, what, content)
	Local value:= JSON_Parse(content)
	Local result:= NIL

	what := UPPER(what)
	ConOut("_ReceivedMessage: " + what)

	if (what == "MESSAGE")
		result:= _Message(app, value)
	elseif (what == "GETPICTURE")
		result:= _GetPicture(app, value)
	elseif what == "BARCODESCANNER"
		result:= _BarCodeScan(app, value)
	elseif what == "PAIREDDEVICES"
		result:= _PairedDevices(app, value)
	elseif what == "UNLOCKORIENTATION"
		result:= _UnlockOrientation(app, value)
	elseif what == "LOCKORIENTATION"
		result:= _LockOrientation(app, value)
	elseif what == "GETCURRENTPOSITION"
		result:= _GetCurrentPosition(app, value)
	elseif what == "TESTDEVICE"
		result:= _TestDevice(app, value)
	elseif what == "CREATENOTIFICATION"
		result:= _CreateNotification(app, value)
	elseif what == "VIBRATE"
		result:= _Vibrate(app, value)
	elseif what == "OPENSETTINGS"
		result:= _OpenSettings(app, value)
	elseif what == "DBGET"
		result:= _DbGet(app, value)
	elseif what == "DBEXEC"
		result:= _DbExec(app, value)
	elseif what == "DBEXECSCALAR"
		result:= _DbExecScalar(app, value)
	elseif what == "DBBEGIN"
		result:= _DbBegin(app, value)
	elseif what == "DBCOMMIT"
		result:= _DbCommit(app, value)
	elseif what == "DBROLLBACK"
		result:= _DbRollback(app, value)
	elseif what == "RUNADVPL"
		result:= _runAdvpl(app, value)
	elseif what == "GETTEMPPATH"
		result:= _getTempPath(app, value)
	else
		ConOut("[_ReceivedMessage] Mensagem não mapeada! '" + what + "'")
	endif

	Return JSON_Stringify(result)
 return

Static Function _GetPicture(app, content)
	return app:Device:TakePicture()
return

Static Function _BarCodeScan(app, content)
	Local result := JSONObject():New()
	Local aBarcodeRead := app:Device:BarCode()

	if len(aBarcodeRead) = 2
		result:set("code", aBarcodeRead[1])
		result:set("format", aBarcodeRead[2])
	endif

	return result
return

Static Function _PairedDevices(app, content)
	Local aDevicesResult := app:Device:GetPairedBluetoothDevices()
	Local result := JSONObject():New()
	Local aDevices := JSONArray():New()
	Local rowData
	Local i

	For i := 1 to len(aDevicesResult)
		rowData:= JSONObject():New()
		rowData:Set("name", aDevicesResult[i][1])
		rowData:Set("address", aDevicesResult[i][2])
		aDevices:Append(rowData)
	Next i
	
	if len(aDevicesResult) > 0
		result:set("devices", aDevices)
	endif

	return result
return

Static Function _UnlockOrientation(app, content)
	return app:Device:SetScreenOrientation(-1)
return

Static Function _LockOrientation(app, content)
	return app:Device:SetScreenOrientation(2)
return

Static Function _GetCurrentPosition(app, content)
	Local result := JSONObject():New()
	Local aGeoCoord
	Local strGeoCoord := app:Device:getGeoCoordinate(0)

	strGeoCoord := StrTran(strGeoCoord, CHR(176))
	aGeoCoord := STRTOKARR(strGeoCoord, ',')
	
	if len(aGeoCoord) = 2
		result:set("latitude", aGeoCoord[1])
		result:set("longitude", aGeoCoord[2])
	endif

	return result
return

Static Function _TestDevice(app, content)
	return app:Device:TestDevice(Val(content))
return

Static Function _CreateNotification(app, content)
	Local id := content:get("id", "")
	Local title := content:get("title", "")
	Local message := content:get("message", "")

	return app:Device:CreateNotification(id, title, message)
return

Static Function _Vibrate(app, content)
	return app:Device:vibrate(Val(content))
Return

Static Function _OpenSettings(app, content)
	return app:Device:OpenSettings(val(content))
Return

Static Function _DbExecScalar(app, query)
	Local result := JSONObject():New()
	Local status

	ConOut("_DbExecScalar: " + query)

	status:= TCSQLExec(query)
	result:Set("result", status)

	if status < 0
		result:set("error", TcSqlError())
	else
		dbUseArea(.T., 'TOPCONN', TCGenQry(,,query), 'TRB', .F., .T.)

		If (!TRB->(eof())) .AND. (TRB->(FCount()) > 0) .AND. (TRB->(RecCount()) > 0)
			result:set("data", FieldGet(1))
		Else
			result:set("data", NIL)
		EndIf

		TRB->(dbCloseArea())
	endif

	return result
Return

Static Function _DbGet(app, query)
	Local result := JSONObject():New()
	Local i
	Local status
	Local queryData
	Local rowData

	ConOut("_DbGet: " + query)

	status:= TCSQLExec(query)
	result:Set("result", status)

	if status < 0
		result:set("error", TcSqlError())
	else
		queryData:= JSONArray():New()

		// Recupera os dados
		dbUseArea(.T., 'TOPCONN', TCGenQry(,,query),'TRB', .F., .T.)

		nFields := TRB->(FCount())
		nRecords := TRB->(RecCount())

		while !TRB->(eof())
			rowData:= JSONObject():New()

			for i :=  1 to nFields
				rowData:Set(FieldName(i), FieldGet(i))
			next i

			queryData:Append(rowData)

			TRB->(DbSkip())
		end

		TRB->(dbCloseArea())

		result:set("data", queryData)
	endif

	return result
return

Static Function _DbExec(app, query)
	Local result:= JSONObject():New()
	Local status:= TCSQLExec(query)

	result:set("result", status)

	if status < 0
		result:set("error", TcSqlError())
		ConOut(query)
		ConOut(result:Get("error"))
	endif

	return result
return

Static Function _DbBegin(app, content)
	return _DbExec(app, "BEGIN")
return

Static Function _DbCommit(app, content)
	return _DbExec(app, "COMMIT")
return

Static Function _DbRollback(app, content)
	return _DbExec(app, "ROLLBACK")
return

Static Function _runAdvpl(app, content)
	Local xVal := &("{|| " + content + "}")

	If ValType(xVal) == "B"
		Return eval(xVal)
	EndIf

	return Nil
Return

Static Function _getTempPath(app, content)
	return app:Device:GetTempPath()
Return

Static Function _Message(app, value)
	Return app:OnReceivedMessage(value)
Return

Static Function JSON_Parse(value)
	Local valueType:= ValType(value)
	Local valueLength
	Local flagLength

	If (valueType == 'C')
		valueLength:= Len(value)
		flagLength:= Len(JSON_FLAG)

		If (valueLength >= (2 + (flagLength * 2)))
			If ((Left(value, flagLength) == JSON_FLAG) .AND. (Right(value, flagLength) == JSON_FLAG))
				valueLength -= (flagLength * 2)
				value:= SubStr(value, flagLength + 1, valueLength)

				If ((Left(value, 1) == '{') .AND. (Right(value, 1) == '}'))
					return JSONObject():New(value)
				ElseIf ((Left(value, 1) == '[') .AND. (Right(value, 1) == ']'))
					return JSONArray():New(value)
				EndIf
			EndIf
		EndIf
	Endif

	Return value
Return

Static Function JSON_Stringify(value)
	Local valueType:= ValType(value)
	Local className

	If (valueType == 'A')
		Return JSON_Stringify(JSONArray():New(value))
	ElseIf (valueType == 'O')
		className:= Upper(GetClassName(value))

 		if (className == "THASHMAP")
 			Return JSON_Stringify(JSONObject():New(value))
 		ElseIf(className == "JSONOBJECT") .OR. (className == "JSONARRAY")
 			Return JSON_FLAG + value:ToString() + JSON_FLAG
 		EndIf
 	EndIf

	Return value
Return
