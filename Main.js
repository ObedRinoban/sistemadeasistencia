//VARIABLES GLOBALES
//URL ID GOOGLE SHEET USUARIOS
//var SS = SpreadsheetApp.openById('1agmJXg6i2ee_r2ga4dfIR1yIXHQG-BOj3sYD4yfyJMM');
//URL ID DE AUDIO
//var sonidoMp3 = '1g9FwEWCYg6B-s2i1mqPqUzyEx_8Vwb_Z';
//Ahora vamos a trabajar este proyecto desde el Net Code

function registrarAsistencia(usuario, tipoRegistro, dispositivo) {
  var hojaRegistros = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("DBregistros");
  var fechaHoraActual = new Date();
  
  hojaRegistros.appendRow([fechaHoraActual.toDateString(), fechaHoraActual.toTimeString(), usuario, tipoRegistro, dispositivo]);
  
  return "Registro de " + tipoRegistro + " completado para " + usuario;
}

function obtenerUsuarios() {
  var hojaUsuarios = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Usuarios");
  var lastRow = hojaUsuarios.getLastRow();
  
  // Verificar si hay más de una fila de datos
  if (lastRow > 1) {
    var datos = hojaUsuarios.getRange(2, 1, lastRow - 1, hojaUsuarios.getLastColumn()).getValues();
    return datos;
  } else {
    return []; // Devolver una lista vacía si no hay datos
  }
}


function registrarAsistenciaAutomatica(usuario) {
  var hojaRegistros = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("DBregistros");
  var fechaHoraActual = new Date();
  var fechaHoy = fechaHoraActual.toDateString();
  
  var registros = hojaRegistros.getDataRange().getValues();
  var ultimoRegistro = null;

  // Buscar el último registro del usuario en la fecha actual
  for (var i = registros.length - 1; i >= 0; i--) {
    if (registros[i][2] === usuario && registros[i][0] === fechaHoy) {
      ultimoRegistro = registros[i];
      break;
    }
  }

  // Determinar si registrar entrada o salida
  var tipoRegistro = "entrada";
  if (ultimoRegistro && ultimoRegistro[3] === "entrada") {
    tipoRegistro = "salida";
  }

  // Registrar la asistencia
  hojaRegistros.appendRow([fechaHoy, fechaHoraActual.toTimeString(), usuario, tipoRegistro, "Laptop/Móvil"]);
  
  return "Registro de " + tipoRegistro + " completado para " + usuario;
}


function anadirUsuario(nombre, usuario, contrasena, area, cargo, rol) {
  var hojaUsuarios = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Usuarios");
  hojaUsuarios.appendRow([nombre, usuario, contrasena, area, cargo, rol]);
  
  var urlQR = generarYGuardarQR(usuario);

  return "Usuario añadido correctamente con código QR almacenado en la hoja 'Accesos'.";
}

function editarUsuario(fila, nombre, usuario, contrasena, area, cargo, rol) {
  var hojaUsuarios = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Usuarios");
  var hojaAccesos = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Accesos");

  // Actualizar el usuario en la hoja Usuarios
  hojaUsuarios.getRange(fila + 2, 1, 1, 6).setValues([[nombre, usuario, contrasena, area, cargo, rol]]);

  // Buscar el registro en la hoja Accesos basado en el antiguo nombre de usuario y actualizarlo
  var dataAccesos = hojaAccesos.getDataRange().getValues();
  for (var i = 1; i < dataAccesos.length; i++) {
    if (dataAccesos[i][0] === usuario) { // Comparar el antiguo nombre de usuario
      hojaAccesos.getRange(i + 1, 1, 1, 1).setValue(usuario); // Actualizar el nombre de usuario
      break;
    }
  }

  return "Usuario editado correctamente.";
}


function verificarCredencialesPorQR(qrCodeContent) {
  const hojaUsuarios = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Usuarios");
  const hojaRegistros = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("DBregistros");
  const datos = hojaUsuarios.getDataRange().getValues();
  let result = null;

  for (var i = 1; i < datos.length; i++) {
    if (datos[i][1].trim().toLowerCase() === qrCodeContent.trim().toLowerCase()) {
      const registros = hojaRegistros.getDataRange().getValues();
      let fechaEntrada = "Sin Registro", horaEntrada = "Sin Registro", fechaSalida = "Sin Registro", horaSalida = "Sin Registro";

      for (var j = registros.length - 1; j >= 0; j--) {
        if (registros[j][2] === datos[i][1]) {
          if (registros[j][3] === "entrada") {
            fechaEntrada = registros[j][0];
            horaEntrada = registros[j][1];
          } else if (registros[j][3] === "salida") {
            fechaSalida = registros[j][0];
            horaSalida = registros[j][1];
            break; // Exit loop after finding the latest salida
          }
        }
      }

      result = {
        nombre: datos[i][0],
        fechaEntrada: fechaEntrada,
        horaEntrada: horaEntrada,
        fechaSalida: fechaSalida,
        horaSalida: horaSalida
      };
      break;
    }
  }

  return result;
}

function obtenerRegistrosPrevios(nombreUsuario) {
  var hojaRegistros = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("DBregistros");
  var registros = hojaRegistros.getDataRange().getValues();
  var entrada = null;
  var salida = null;

  for (var i = registros.length - 1; i >= 0; i--) {
    if (registros[i][2] === nombreUsuario) {
      if (registros[i][3] === "entrada" && !entrada) {
        entrada = { fecha: registros[i][0], hora: registros[i][1] };
      } else if (registros[i][3] === "salida" && !salida) {
        salida = { fecha: registros[i][0], hora: registros[i][1] };
      }

      if (entrada && salida) break;
    }
  }

  return { entrada: entrada, salida: salida };
}

function eliminarUsuario(fila) {
  var hojaUsuarios = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Usuarios");
  hojaUsuarios.deleteRow(fila + 2);
  return "Usuario eliminado correctamente.";
}

function doGet() {
  let template = HtmlService.createTemplateFromFile('Index');
  let html = template.evaluate().setTitle('Control de Asistencia');

  html.setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  html.addMetaTag('viewport', 'width=device-width, initial-scale=1');

  return html;
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}
