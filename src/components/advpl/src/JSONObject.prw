#include "TOTVS.CH"

#define HASH_KEY	1
#define HASH_VALUE	2

Class JSONObject From JSONBase
	Data oHash

	Method New() Constructor

	Method Get(key)
	Method Has(key)
	Method Keys()

	//Method Put(key, value)

	Method Remove(name)

	Method Set(key, value)
	Method ToString()
End Class

Method New(jsonString) Class JSONObject
	Local oParser := TJsonParser():New()
	Local jsonfields := {}
	Local nRetParser := 0
	Local lRet

	if ValType(jsonString) == 'O'
		if (Upper(GetClassName(jsonString)) == "THASHMAP")
			SELF:oHash := jsonString
		else
			SELF:oHash := THashMap():New()
		EndIf
	elseif Empty(jsonString) .OR. ValType(jsonString) != 'C'
		SELF:oHash := THashMap():New()
	else
		// Converte JSON pra Hash
		lRet:= oParser:Json_Hash(jsonString, len(jsonString), @jsonfields, @nRetParser, @SELF:oHash)

		If ( lRet == .F. )
			ConOut("[JSON][ERR] Erro ao parsear MSG len: " + AllTrim(Str(len(jsonString))) + " bytes lidos: " + AllTrim(Str(nRetParser)))
			ConOut("Erro a partir: " + SubStr(jsonString, (nRetParser+1)))
		EndIf
	Endif
	//ConOut("nRetParser", nRetParser)
Return

Method Get(key, defaultValue) Class JSONObject
	Local xGet := Nil
	Default defaultValue:= NIL

	// Recupera valor do campo
	If Self:oHash:Get(key, xGet)
		return xGet
	Else
		return defaultValue
	Endif
Return

Method Has(key) Class JSONObject
	Local dummy

	Return Self:oHash:Get(key, dummy)
Return


Method Keys() Class JSONObject
	Local list
	Local result:= {}

	If (Self:oHash:List(list))
		AEval(list, {|item| AAdd(result, item[HASH_KEY]) })
	EndIf

	return result
Return


Method Remove(key) Class JSONObject
	Return Self:oHash:Del(key)
Return

Method Set(key, value) Class JSONObject
	If !Self:oHash:Set(key, SELF:_Upgrade(value))
	    ConOut("Falha ao inserir chave '" + cKey + "'")
	EndIf
Return

Method ToString() Class JSONObject
	Local i := 0
	Local size
	Local list := {}
	Local value
	Local result:= {}

	if (Self:oHash:List(list))
		size:= Len(list)

		for i:= 1 to size
			value:= SELF:_Stringify(list[i][HASH_VALUE])

			if value != Nil
				AAdd(result, SELF:_QuoteString(list[i][HASH_KEY]) + ': ' + value)
			EndIf
		next
	EndIf

	Return "{" + SELF:_JoinArray(result, ", ") + "}"
Return
