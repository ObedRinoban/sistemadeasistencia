function generarYGuardarQR(usuario) {
  var urlQR = "https://image-charts.com/chart?chs=250x250&cht=qr&choe=UTF-8&chl=" + encodeURIComponent(usuario);
  var formulaQR = '=IMAGE("' + urlQR + '")';
  
  var hojaAccesos = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Accesos");
  var fila = hojaAccesos.getLastRow() + 1;
  
  hojaAccesos.appendRow([usuario, formulaQR]);

  return formulaQR;
}

function obtenerQRs() {
  var hojaAccesos = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Accesos");
  var datos = hojaAccesos.getDataRange().getValues();
  var qrData = {};

  for (var i = 1; i < datos.length; i++) {
    var usuario = datos[i][0];
    var qrCode = datos[i][1];
    if (usuario) {
      qrData[usuario] = qrCode;
    }
  }
  return qrData;
}
