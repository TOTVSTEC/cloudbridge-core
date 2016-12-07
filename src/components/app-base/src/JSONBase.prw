#include "TOTVS.CH"

Class JSONBase From LongClassName
	Method _QuoteString(value)
	Method _Stringify(value)
	Method _JoinArray(array, separator)
	Method _Error(message)
	Method _Upgrade(value)
EndClass

Method _QuoteString(value) Class JSONBase
	Local result:= CValToChar(value)
	result:= StrTran(result, '"', '\"')

	return '"' + result + '"'
Return

Method _Stringify(value) Class JSONBase
	Local cType:= ValType(value)
	Local temp

	if cType == 'L'
		return IIF(value, 'true', 'false')
	elseif cType == 'N' .OR. cType == 'F'
		return AllTrim(Str(value))
	elseif cType == 'U'
		return 'null'
	elseif cType == 'O'
		cType:= Upper(GetClassName(value))
		if ((cType == "JSONOBJECT") .OR. (cType == "JSONARRAY"))
			Return value:ToString()
		elseIf (cType == "THASHMAP")
			temp:= JSONObject():New(value)

			Return temp:ToString()
		EndIf

		Return Nil
	elseif cType == 'A'
		temp:= JSONArray():New(value)

		Return temp:ToString()
	else
		return SELF:_QuoteString(value)
	endif
Return

Method _JoinArray(array, separator) Class JSONBase
	Local i
	Local size:= Len(array)
	Local result:= ""
	Default separator:= ""

	if (size > 0)
		For i:= 1 to (size - 1)
			result += array[i] + separator
		Next

		result += array[size]
	EndIf

	Return result
Return

Method _Upgrade(value) Class JSONBase
	Local cType:= ValType(value)

	if (cType == 'A')
		Return JSONArray():New(value)
	elseif ((cType == 'O') .AND. (Upper(GetClassName(value)) == "THASHMAP"))
		Return JSONObject():New(value)
	else
		Return value
	EndIf
Return

Method _Error(message, extra) Class JSONBase
	UserException(message + CRLF + "at " + GetClassName(SELF) + ":" + ProcName(1) + ":" + AllTrim(Str(ProcLine(1))) + CRLF + extra)
Return
