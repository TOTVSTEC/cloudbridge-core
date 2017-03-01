#include "TOTVS.CH"

/**
@advpl_class CloudBridgeApp

@advpl_desc Classe base para aplicativos CloudBridge 

*/
Class CloudBridgeApp From LongClassName
	/**
	@advpl_attribute Device

	@advpl_desc Instancia da classe TMobile

	@advpl_type O
	*/
	Data Device

	/**
	@advpl_attribute MainWindow

	@advpl_desc Instancia da classe TWindow

	@advpl_type O
	*/
	Data MainWindow

	/**
	@advpl_attribute WebView

	@advpl_desc Instancia da classe TWebEngine

	@advpl_type O
	*/
	Data WebView

	/**
	@advpl_attribute WebChannel

	@advpl_desc Instancia da classe TWebChannel

	@advpl_type O
	*/
	Data WebChannel

	/**
	@advpl_attribute WSPort

	@advpl_desc Numero da porta utilizada para comunicacao pelo WebChannel

	@advpl_type N
	*/
	Data WSPort

	/**
	@advpl_attribute RootPath

	@advpl_desc Caminho da raiz dos arquivos web para serem carregados no WebView

	@advpl_type C
	*/
	Data RootPath

	/**
	@advpl_attribute WebChannel

	@advpl_desc Instancia da classe PlatformInfo

	@advpl_type O
	*/
	Data Platform

	Method New() Constructor

	//User can override this methods
	Method OnLoadFinished(url)
	Method OnStart()
	Method OnReceivedMessage(content)
	Method OnPause()
	Method OnResume()


	//Public helper methods
	Method ExecuteJavaScript(script)

EndClass

/**
@advpl_constructor New

@advpl_desc Método construtor da classe
*/
Method New() Class CloudBridgeApp; Return


/**
@advpl_method OnLoadFinished

@advpl_desc Callback chamado quando a pagina tiver sido completamente carregada

@advpl_param url    CO  URL da pagina carregada
*/
Method OnLoadFinished(url) Class CloudBridgeApp; Return

/**
@advpl_method OnStart

@advpl_desc Callback chamado após a criacao dos componentes AdvPL da aplicação.
*/
Method OnStart() Class CloudBridgeApp; Return

/**
@advpl_method OnReceivedMessage

@advpl_desc Callback chamado via channel.sendMessage em JavaScript, para implementacao de ações customizadas

@advpl_param content    XO  Valor enviado como parametro de channel.sendMessage. Pode ser Caracter, Numerico, Lógico, ou instancia das classes JSONArray e JSONObject 
*/
Method OnReceivedMessage(content) Class CloudBridgeApp; Return

/**
@advpl_method OnPause

@advpl_desc Callback chamado quando a aplicação entra em pausa (em android, quando ela perde o foco) 
*/
Method OnPause() Class CloudBridgeApp; Return

/**
@advpl_method OnResume

@advpl_desc Callback chamado quando a aplicação sai de pausa (em android, quando ela ganha o foco) 
*/
Method OnResume() Class CloudBridgeApp; Return


//Public helper methods
/**
@advpl_method ExecuteJavaScript

@advpl_desc Executa o comando informado dentro do WebView.  
*/
Method ExecuteJavaScript(script) Class CloudBridgeApp
	SELF:WebView:runJavaScript(script)
Return

