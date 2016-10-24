#include "TOTVS.CH"

Class JSONArray From JSONBase
	Data oArray

	Method New() Constructor
	
	Method Length()

	Method Get(index)
	Method Append(value)
	Method Insert(index, value)

	Method ToString()

End Class

Method New(jsonString) Class JSONArray
	Local oParser := TJsonParser():New()
	Local jsonfields := {}
	Local nRetParser := 0
	Local lRet

	if ValType(jsonString) == 'A'
		SELF:oArray := jsonString
	elseif Empty(jsonString) .OR. ValType(jsonString) != 'C'
		SELF:oArray := {}
	else
		lRet := oParser:Json_Parser(jsonString, len(jsonString), @jsonfields, @nRetParser)

		If ( lRet == .F. )
			ConOut("[JSON][ERR] Erro ao parsear MSG len: " + AllTrim(Str(len(jsonString))) + " bytes lidos: " + AllTrim(Str(nRetParser)))
			ConOut("Erro a partir: " + SubStr(jsonString, (nRetParser+1)))
		Else
			SELF:oArray := jsonfields[1]
		EndIf
	Endif
Return

Method Length() Class JSONArray
	Return Len(SELF:oArray)
Return

Method Get(index) Class JSONArray
	if index > 0 .AND. index <= SELF:Length()
		Return SELF:oArray[index]
	EndIf

	Return NIL
Return

Method Append(value) Class JSONArray
	AAdd(SELF:oArray, SELF:_Upgrade(value))
Return

Method Insert(index, value) Class JSONArray
	Local length:= SELF:Length()
	
	if index < 1
		SELF:_Error("Array is out of bounds!",;
			"  Length: " + AllTrim(Str(length)) + CRLF +;
			"  Index: " + AllTrim(Str(index)) )
	/*
		UserException("Array is out of bounds at " + SELF:ClassName() + ":" + ProcName() + ":" + AllTrim(Str(ProcLine())) + CRLF +;
			"  Length: " + AllTrim(Str(length)) + CRLF +;
			"  Index: " + AllTrim(Str(index)))
*/
		Return
	ElseIf index <= length
		ASize(SELF:oArray, length + 1)
		AIns(SELF:oArray, index)
	ElseIf index > SELF:Length()
		ASize(SELF:oArray, index)
	End

	SELF:oArray[index] := SELF:_Upgrade(value)
Return

Method ToString() Class JSONArray
	Local result:= {}
	Local size:= Len(SELF:oArray)
	Local value
	Local i
	
	for i:= 1 to size
		value:= SELF:_Stringify(SELF:oArray[i])

		if value != Nil
			AAdd(result, value)
		EndIf
	next

	return "[" + SELF:_JoinArray(result, ", ") + "]"
Return
