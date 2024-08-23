function verificarCredenciales(usuario, contrasena) {
  if (!usuario || !contrasena) {
    Logger.log('Usuario o contrasena están indefinidos.');
    return null;
  }
  
  var hojaUsuarios = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Usuarios");
  var datos = hojaUsuarios.getDataRange().getValues();
  
  usuario = usuario.trim().toLowerCase();
  contrasena = contrasena.trim();
  
  for (var i = 1; i < datos.length; i++) {
    var usuarioHoja = datos[i][1].trim().toLowerCase();
    var contrasenaHoja = datos[i][2].trim();
    
    if (usuarioHoja === usuario && contrasenaHoja === contrasena) {
      return {
        nombre: datos[i][0],
        rol: datos[i][5]
      };
    }
  }
  return null;
}

function verificarCredencialesPorQR(qrCodeContent) {
  var hojaAccesos = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Accesos");
  var datos = hojaAccesos.getDataRange().getValues();
  
  for (var i = 1; i < datos.length; i++) {
    if (datos[i][0] === qrCodeContent) {
      return verificarCredenciales(datos[i][0], datos[i][1]);
    }
  }
  return null;
}
