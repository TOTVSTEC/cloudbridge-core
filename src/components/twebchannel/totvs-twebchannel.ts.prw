// --------------------------------------------------------------------------------------------
// Este arquivo contém a documentação do arquivo totvs-twebchannel.ts
// por motivo de distribuição a documentação não pode ser mantida no proprio arquivo 
// --------------------------------------------------------------------------------------------

dialog.advplToJs.connect(codeType, codeContent, objectName)
dialog.dialog.advplToJs.connect(codeType, codeContent, objectName)
dialog.jsToAdvpl(codeType, codContent)(codeType, codContent)
TWebChannel.runAdvpl(command, callback)
TWebChannel.getPicture(callback)
TWebChannel.barCodeScanner(callback)
TWebChannel.pairedDevices(callback)
TWebChannel.unlockOrientation()
TWebChannel.lockOrientation()
TWebChannel.getCurrentPosition(callback)
TWebChannel.testDevice(feature, callback)
TWebChannel.createNotification(options)
TWebChannel.openSettings(feature)
TWebChannel.dbGet(query, callBack)
TWebChannel.dbExec(query, callBack)
TWebChannel.dbBegin(callBack)
TWebChannel.dbCommit(callBack, onError)
TWebChannel.dbRollback(callBack)
TWebChannel.getTempPath(callback)
TWebChannel.vibrate(milliseconds)

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @advpl_function dialog.advplToJs.connect
 * 
 * @advpl_desc Essa função é reponsável pelo recebimento das mensagens vindas do ADVPL para o JavaScript, permitindo o tratamento para inserção de campos, páginas de estilo, trechos JavaScript, etc.
 * 
 * @advpl_param codeType 	CR Código da mensagem recebida.
 * @advpl_param codeContent CR Texto a ser tratado no recebimento, como páginas de estilo, trechos JavaScript, etc.
 *
 * @advpl_obs Função disponível em builds superiores a 7.00.131227A. 
 *
 * @advpl_example
 * 
[code]
// O trecho ADVPL abaixo ira "injetar" um campo no formulário
// HTML em exibição no componente TWebEngine
code := "<input id='"+ID+"'" +;
        " type='"+type+"'" +;
        " placeholder='"+placeholder+"'"+;
        " value='"+value+"'"+;
        " " + freeJSCode +;
         cStyle +;
         "/>"
oWebChannel:advplToJs("html", code)

// O trecho Javascript abaixo efetua a conexão WebSocket entre o SmartClient
// e o Navegador embedado, a função definida como callBack será disparada 
// ao fim da carga inicial da pagina/componente

// Carrega mensageria exclusiva da pagina, neste caso a mensagem "html"
dialog.advplToJs.connect(function (codeType, codeContent, objectName) {
  if (codeType == "html") {
    var form = document.getElementById("mainForm");
    form.innerHTML += codeContent;                    
  }
});

[code]
*/

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @advpl_function dialog.jsToAdvpl
 * 
 * @advpl_desc Envia uma mensagem do JavaScript para o ADVPL. 
 * Essa mensagem será recebida pelo bloco de código bJsToAdvpl do componente
 * TWebChannel associado ao componente TWebEngine que está exibindo a página/componente HTML. 
 * 
 * @advpl_param codeType 	CR Código da mensagem recebida.
 * @advpl_param codeContent CR Texto enviado do JavaScript para tratamento via ADVPL
 *
 * @advpl_obs Função disponível em builds superiores a 7.00.131227A. 
 *
 * @advpl_example
 * 
[code]
// O trecho ADVPL abaixo cria o componente TWebChannel e
// associa o bloco de código bJsToADVPL
oWebChannel := TWebChannel():New()
oWebChannel:bJsToAdvpl := {|self,codeType,codeContent| jsToAdvpl(self,codeType,codeContent) } 

// Associa a porta do componente TWebChannel ao componente
// TWebEngine possibilitando a troca de mensagens
oWebEngine := TWebEngine():New(oDlg,0,0,800, 600,,oWebChannel:nPort)

// Trecho JavaScript abaixo envia sinal informando 
// termino da carga da página/componente HTML
dialog.jsToAdvpl("page_started", "Pagina inicializada");

// Techo ADVPL abaixo é a função que será disparada pelo
// bloco de código bJsToAdvpl ao receber a mensagem do JavaScript
static function jsToAdvpl(self,codeType,codeContent)
  if codeType == "page_started"
    msgAlert(codeContent)
  endif
return
[code]
*/

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @advpl_function TWebChannel.runAdvpl
 * 
 * @advpl_desc Executa um comando ADVPL através do Javascript, retornando o valor processado via ADVPL para a função Javascript definida como callBack na chamada original.
 * 
 * @advpl_param command CR Comando ADVPL a ser executado no AppServer embutido no CloudBridge.
 * @advpl_param callback CR Função JavaScript (callBack) disparada ao fim do processamento ADVPL do comando solicitado.
 *
 * @advpl_obs Função disponível em builds superiores a 7.00.131227A. 
 *
 * @advpl_example
 * 
[code]
// Código Javascript que monta uma data formatada em mês/dia/ano
var today = new Date();
var dd = today.getDate();
var mm = today.getMonth()+1; //January is 0!
var yyyy = today.getFullYear();
var jsDate = mm+'/'+dd+'/'+yyyy;

// Comando ADVPL
var advplCommand = 'DtoS(CtoD(\'' +jsDate+ '\'))';

channel.runAdvpl(advplCommand).then(function(result) {
    alert('Command runAdvpl: ' + advplCommand + '\nValue returned: ' + result);
});
[code]
*/

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @advpl_function TWebChannel.getPicture
 * 
 * @advpl_desc Abre a câmera do dispositivo, retornando o nome da imagem, caso tirada, para a função Javascript definida como callBack na chamada original.
 *
 * @advpl_param callback CR Função JavaScript (callBack) disparada ao fim da captura da imagem.
 *
 * @advpl_obs Função disponível em builds superiores a 7.00.131227A. 
 *
 * @advpl_example
 * 
[code]
channel.getPicture().then(function(result) {
    alert("Picture path: " + result);
});
[code]
*/

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @advpl_function TWebChannel.barCodeScanner
 * 
 * @advpl_desc Inicia a captura do código de barras retornando o código capturado e seu formato para a função Javascript definida como callBack na chamada original.
 * 
 * @advpl_param callback CR Função JavaScript (callBack) disparada ao fim da captura do código de barras.
 *
 * @advpl_obs Função disponível em builds superiores a 7.00.131227A. 
 *
 * @advpl_obs O retorno será um objeto JSON contendo o valor decodificado do código de barras e o nome do formato de código de barras lido.
 *            Exemplo de retorno {"format":"EAN_13","code":"7891172000256"}
 *
 * @advpl_example
 * 
[code]
channel.barCodeScanner().then(function(result) {
    alert('Code: ' + result.code + "\nFormat: " + result.format);
});
[code]
*/

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @advpl_function TWebChannel.pairedDevices
 * 
 * @advpl_desc Retorna a lista de dispositivos Bluetooth pareados através da função Javascript definida como callBack na chamada original.
 * 
 * @advpl_param callback CR Função JavaScript (callBack) disparada ao fim do processamento.
 *
 * @advpl_obs Função disponível em builds superiores a 7.00.131227A.
 *
 * @advpl_obs O retorno será um objeto JSON onde a propriedade "devices" conterá um array de dispositivos com as propriedades "name" e "address".
 *            "Devices" será "undefined" caso nenhum dispositivo esteja pareado ou a interface Bluetooth esteja desativada.
 *
 * @advpl_example
 * 
[code]
channel.pairedDevices().then(function(result) {
    if(result.devices === undefined) {
        alert('Nenhum dispositivo pareado ou interface Bluetooth desligada.');
        return;
    }

    var msg = '';
    for (var i = 0; i < result.devices.length; i++) {
        msg += '\n\nNome: ' + result.devices[i].name;
        msg += '\nEndereço: ' + result.devices[i].address;
    }
    alert('Paired Bluetooth Devices:' + msg);
});
[code]
*/

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @advpl_function TWebChannel.unlockOrientation
 * 
 * @advpl_desc Permite a mudança de orientação do dispositivo.
 * 
 * @advpl_obs Função disponível em builds superiores a 7.00.131227A. 
 *
 * @advpl_example
 * 
[code]
channel.unlockOrientation();
[code]
*/

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @advpl_function TWebChannel.lockOrientation
 * 
 * @advpl_desc Bloqueia a mudança de orientação do dispositivo.
 * 
 * @advpl_obs Função disponível em builds superiores a 7.00.131227A. 
 *
 * @advpl_example
 * 
[code]
channel.lockOrientation();
[code]
*/

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @advpl_function TWebChannel.getCurrentPosition
 * 
 * @advpl_desc Recupera a posição do GPS, quando este estiver ativo no dispositivo móvel.
 * 
 * @advpl_param callback CR Função JavaScript (callBack) disparada ao fim do processamento, recebendo a posição do GPS.
 *
 * @advpl_obs Função disponível em builds superiores a 7.00.131227A.
 *
 * @advpl_obs A posição GPS retornada será um objeto JSON contendo a latitude e longitude em graus no formato decimal,
 * por exemplo {"latitude":"-23.50590","longitude":"-46.64300"}
 *
 * @advpl_example
 * 
[code]
channel.getCurrentPosition().then(function(position) {
    alert(position.latitude + ", " + position.longitude);
});
[code]
*/

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @advpl_function TWebChannel.testDevice
 * 
 * @advpl_desc Retorna o Status do periférico (camera, gps, etc), informando se o mesmo esta habilitado ou não.
 * 
 * @advpl_param feature NR Código do periférico a ser testado, os códigos estão descritos no exemplo.
 * @advpl_param callback CR Função JavaScript (callBack) disparada ao fim do processamento, recebendo True caso o periférico esteja habilitado e False caso contrário.
 *
 * @advpl_obs O teste CONNECTED_MOBILE (Conectado via 3G ou 4G) somente retornará True caso a conexão WIFI esteja desabilitada.
 *
 * @advpl_obs Função disponível em builds superiores a 7.00.131227A. 
 *
 * @advpl_example
 * 
[code]
//// Testes possíveis:
// TOTVS.TWebChannel.BLUETOOTH_FEATURE // = 1 (Bluetooth)
// TOTVS.TWebChannel.NFC_FEATURE       // = 2 (NFC)
// TOTVS.TWebChannel.WIFI_FEATURE      // = 3 (WIFI)
// TOTVS.TWebChannel.LOCATION_FEATURE  // = 4 (Localização/GPS)
// TOTVS.TWebChannel.CONNECTED_WIFI    // = 5 (Conectado via WIFI)
// TOTVS.TWebChannel.CONNECTED_MOBILE  // = 6 (Conectado via 3G ou 4G)

channel.testDevice(TOTVS.TWebChannel.WIFI_FEATURE).then(function(result) {
    alert(result);
});
[code]
*/

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @advpl_function TWebChannel.createNotification
 * 
 * @advpl_desc Exibe uma notificação no dispositivo móvel que permite o envio de um Identificador que será enviado ao ADVPL
 * para tratamento pelo bloco de código *bNotificationTapped* definido para o componente TMobile. Mais detalhes no exemplo. 
 * 
 * @advpl_param options OR Objeto JSON contendo as propriedades necessárias para criação da notificação. Consulte a tabela na área de observações
 *                         para conhecer as propriedades requeridas.
 *
 * @advpl_obs_nb Propriedades requeridas pelo objeto JSON do parâmetro "options":
<table>
<tr>
<th bgcolor="#C0C0C0">Identificador</th>
<th bgcolor="#C0C0C0">Tipo</th>
<th bgcolor="#C0C0C0">Descrição</th>
</tr>
<tr>
<td>ID</td>
<td>Numérico</td>
<td>Código identificador da notificação.</td>
</tr>
<tr>
<td>Title</td>
<td>Caractere</td>
<td>Texto da mensagem a ser exibida no titulo da notificação.</td>
</tr>
<tr>
<td>Message</td>
<td>Caractere</td>
<td>Texto da mensagem a ser exibida no corpo da notificação.</td>
</tr>
</table>
 *
 * @advpl_obs Função disponível em builds superiores a 7.00.131227A.
 *
 * @advpl_example
 * 
[code]
var options = {
    id: 1,
    title: "Titulo da Notificação",
    message: "Corpo da Notificação"
};
channel.createNotification(options);
[code]

<h3>Preview</h3>
<img src="http://tdn.totvs.com/download/attachments/244720717/totvstec.notification.android.screenshot.png?api=v2">
 *
*/

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @advpl_function TWebChannel.openSettings
 * 
 * @advpl_desc Exibe a tela de configuração do periférico (camera, gps, etc), possibilitando habilitar/desabilitar o mesmo.
 * 
 * @advpl_param CodeFeature NR Código do periférico a ser exibido, os códigos estão descritos no exemplo.
 *
 * @advpl_obs Caso o periférico escolhido não exista no dispositivo móvel, exemplo NFC, nenhuma tela será apresentada.
 *
 * @advpl_obs Função disponível em builds superiores a 7.00.131227A. 
 *
 * @advpl_example
 * 
[code]
//// Periféricos disponíveis
// TOTVS.TWebChannel.BLUETOOTH_FEATURE // = 1 (Bluetooth)
// TOTVS.TWebChannel.NFC_FEATURE       // = 2 (NFC)
// TOTVS.TWebChannel.WIFI_FEATURE      // = 3 (WIFI)
// TOTVS.TWebChannel.LOCATION_FEATURE  // = 4 (Localização/GPS)

channel.openSettings(TOTVS.TWebChannel.BLUETOOTH_FEATURE);
[code]
*/

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @advpl_function TWebChannel.dbGet
 * 
 * @advpl_desc Recupera registros do banco SQLite definido no AppServer.ini a partir de uma Query. Os registros serão retornados no formato JSON para uma função callback Javascript.
 *
 * @advpl_param cQuery 		CR Query no formato SQL para retorno dos registros.
 * @advpl_param callback 	CR Função JavaScript (callBack) para retorno dos dados no formato JSON.
 *
 * @advpl_obs Função disponível em builds superiores a 7.00.131227A. 
 *
 * @advpl_example
 * 
[code]
var query = 'select * from newTab';

channel.dbGet(query).then(function(result) {
    if (result.error !== undefined) {
        alert("dbError: " + result.error);
        return;
    }

    if (result.result === 0) {
        msg = '';
        for (var i = 0; i < result.data.length; i++) {
            msg += '\n\nID: ' +  result.data[i].COD;
            msg += '\nNAME: ' +  result.data[i].NAME;
        }
        alert('Query: ' + query + msg);
    }
});
[code]
*/

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @advpl_function TWebChannel.dbExec
 * 
 * @advpl_desc Executa uma query no banco SQLite definido no AppServer.ini.
 *
 * @advpl_param cQuery 		CR Query no formato SQL para retorno dos registros.
 * @advpl_param callback 	CR Função JavaScript (callBack) disparada como retorno da execução da Query, seja ela bem bem sucedida ou não.
 *
 * @advpl_obs Função disponível em builds superiores a 7.00.131227A. 
 *
 * @advpl_example
 * 
[code]
var channel = this.channel;
var query = "select max(cod) as RESULT from newTab";

channel.dbExecuteScalar(query).then(function(result) {

    if (result.error !== undefined) {
        alert("dbError: " + result.error);
        return;
    }

    var recno = result.data || 0;
    recno++;

    query = "insert into newTab values (" + recno + ", 'User é: " + recno + "')";

    channel.dbExec(query).then(function(result) {

        if (result.error !== undefined) {
            alert("dbError: " + result.error);
            return;
        }
        
        if (result.result === 0) {
            alert('Registro inserido com sucesso!\n\nQuery: ' + query);
        }

    });
});
[code]
*/

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @advpl_function TWebChannel.dbBegin
 * 
 * @advpl_desc Executa o camando BEGIN TRANSACTION no banco SQLite definido no AppServer.ini
 * 
 * @advpl_param callback 	CR Função JavaScript (callBack) disparada caso a execução for bem sucedida.
 *
 * @advpl_obs Função disponível em builds superiores a 7.00.131227A. 
 *
 * @advpl_example
 * 
[code]
var channel = this.channel;

channel.dbBegin().then(function(result) {
    channel.dbExec("insert into newTab values (4,'User 4')");
    channel.dbExec("insert into newTab values (5,'User 5')");
    channel.dbExec("insert into newTab values (6,'User 6')");
})
.then(function(result) {
    channel.dbCommit();
    alert("dbCommit executado.");
})
.catch(function(error) {
    channel.dbRollback();
    alert("dbRollback: " + error);
});
[code]
*/

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @advpl_function TWebChannel.dbCommit
 * 
 * @advpl_desc Executa o camando COMMIT TRANSACTION no banco SQLite definido no AppServer.ini
 * 
 * @advpl_param callback 	CR Função JavaScript (callBack) disparada caso a execução for bem sucedida.
 * @advpl_param onError 	CR Função JavaScript (callBack) disparada caso a execução não for bem sucedida, ela receberá a mensagem de erro.
 *
 * @advpl_obs Função disponível em builds superiores a 7.00.131227A. 
 *
 * @advpl_example
 * 
[code]
var channel = this.channel;

channel.dbBegin().then(function(result) {
    channel.dbExec("insert into newTab values (4,'User 4')");
    channel.dbExec("insert into newTab values (5,'User 5')");
    channel.dbExec("insert into newTab values (6,'User 6')");
})
.then(function(result) {
    channel.dbCommit();
    alert("dbCommit executado.");
})
.catch(function(error) {
    channel.dbRollback();
    alert("dbRollback: " + error);
});
[code]
*/

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @advpl_function TWebChannel.dbRollback
 * 
 * @advpl_desc Executa o camando ROLLBACK no banco SQLite definido no AppServer.ini
 * 
 * @advpl_param callback 	CR Função JavaScript (callBack) disparada caso a execução for bem sucedida.
 *
 * @advpl_obs Função disponível em builds superiores a 7.00.131227A. 
 *
 * @advpl_example
 * 
[code]
var channel = this.channel;

channel.dbBegin().then(function(result) {
    channel.dbExec("insert into newTab values (4,'User 4')");
    channel.dbExec("insert into newTab values (5,'User 5')");
    channel.dbExec("insert into newTab values (6,'User 6')");

    throw new Error('Rollback the transaction');
})
.then(function(result) {
    channel.dbCommit();
    alert("dbCommit executado.");
})
.catch(function(error) {
    channel.dbRollback();
    alert("dbRollback: " + error);
});
[code]
*/

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @advpl_function TWebChannel.getTempPath
 * 
 * @advpl_desc Recupera diretório temporário do dispositivo móvel.
 * 
 * @advpl_param callback CR Função JavaScript (callBack) disparada para retornar o diretório temporário.
 *
 * @advpl_obs Função disponível em builds superiores a 7.00.131227A. 
 *
 * @advpl_example
 * 
[code]
channel.getTempPath().then(function(result) {
    alert('Temporary Path: ' + result);
});
[code]
*/

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @advpl_function TWebChannel.vibrate
 * 
 * @advpl_desc Aciona o vibracall do dispositivo móvel.
 * 
 * @advpl_param milliseconds 	NR Tempo em Milissegundos para o disparo do vibracall.
 *
 * @advpl_obs No sistema operacional iOS (iPad/iPhone) o tempo de vibração é fixo em 400 milisegundos, devido à uma caracteristica deste
 *            sistema operacional.
 *
 * @advpl_obs Função disponível em builds superiores a 7.00.131227A. 
 *
 * @advpl_example
 * 
[code]
channel.vibrate(1000);
[code]
*/
