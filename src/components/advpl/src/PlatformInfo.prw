#include "TOTVS.CH"

Class PlatformInfo
	Data IS_WINDOWS
	Data IS_LINUX
	Data IS_MACOSX
	Data IS_ANDROID
	Data IS_IOS
	Data IS_WINDOWS_UNIVERSAL

	Data IS_MOBILE
	Data IS_DESKTOP

	Data WINDOWS_VALUE
	Data LINUX_VALUE
	Data MACOSX_VALUE
	Data ANDROID_VALUE
	Data IOS_VALUE
	Data WINDOWS_UNIVERSAL_VALUE
	
	Data Value

	Method New() Constructor
End Class

Method New() Class PlatformInfo
    Local stringOS := Upper(GetRmtInfo()[2])

	SELF:Value					:= 0

	SELF:IS_WINDOWS				:= .F.
	SELF:IS_LINUX				:= .F.
	SELF:IS_MACOSX				:= .F.
	SELF:IS_ANDROID				:= .F.
	SELF:IS_IOS					:= .F.
	SELF:IS_WINDOWS_UNIVERSAL	:= .F.

	SELF:IS_MOBILE				:= .F.
	SELF:IS_DESKTOP				:= .F.

	SELF:WINDOWS_VALUE			:= 1
	SELF:LINUX_VALUE			:= 2
	SELF:MACOSX_VALUE			:= 3
	SELF:ANDROID_VALUE			:= 4
	SELF:IOS_VALUE				:= 5
	SELF:WINDOWS_UNIVERSAL_VALUE:= 6

    if ("ANDROID" $ stringOS)
		SELF:IS_ANDROID := .T.
		SELF:IS_MOBILE	:= .T.

		SELF:Value := SELF:ANDROID_VALUE
	elseif ("IPHONEOS" $ stringOS)
		SELF:IS_IOS		:= .T.
		SELF:IS_MOBILE	:= .T.

		SELF:Value := SELF:IOS_VALUE
	elseif ("WINDOWS RUNTIME" $ stringOS)
		SELF:IS_WINDOWS_UNIVERSAL	:= .T.
		SELF:IS_MOBILE				:= .T.

		SELF:Value:= SELF:WINDOWS_UNIVERSAL_VALUE
	elseif ("MAC OS" $ stringOS)
		SELF:IS_MACOSX	:= .T.
		SELF:IS_DESKTOP	:= .T.

		SELF:Value:= SELF:MACOSX_VALUE
	else
	    stringOS:= GetRemoteType()

	    if (stringOS == 1)
	    	SELF:IS_WINDOWS	:= .T.
	    	SELF:IS_DESKTOP	:= .T.

	    	SELF:Value:= SELF:WINDOWS_VALUE
	    elseif (stringOS == 2)
	    	SELF:IS_LINUX	:= .T.
	    	SELF:IS_DESKTOP	:= .T.

	    	SELF:Value:= SELF:LINUX_VALUE
	    endif
	endif
Return
