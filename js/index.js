//La fecha de hoy
let date = new Date();
//Obtenemos el mes de la fecha actual
let month = date.getMonth();
//Obtenemos el año de la fecha actual
let year = date.getFullYear();
//Los meses dentro de un arreglo
const months = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
//Arreglo que contendrá todas las filas de la hoja
let generalArray = [];
//Variable que contiene el nombre de la región
let region = 'Norte';
let eElements = ['Allende','Gral. Terán','Hualahuises','Linares','Montemorelos','Rayones','San Pedro Garza García','Monterrey','Santiago','Santa Catarina'];
let neElements = ['Los Aldamas','China','Dr. Coss','Gral. Bravo','Los Herreras','Los Ramones','Guadalupe','Juárez','Cadereyta Jiménez','Apodaca','Agualeguas','Cerralvo','Dr. González','Gral. Treviño','Higueras','Melchor Ocampo','Parás','Marín','Pesquería'];
let nElements = ['García','Gral. Escobedo','San Nicolás de los Garza','Abasolo','Anáhuac','Bustamante','El Carmen','Hidalgo','Lampazos de Naranjo','Mina','Sabinas Hidalgo','Salinas Victoria','Vallecillo','Villaldama','Ciénega de Flores','Gral. Zuazua'];
let sElements = ['Aramberri','Dr. Arroyo','Galeana','Gral. Zaragoza','Iturbide','Mier y Noriega'];
//Arreglos para las columnas separadas
let eRows = [];
let neRows = [];
let nRows = [];
let sRows = [];
//El nombre del archivo Excel a leer
let fileName = 'Calendario de asambleas.xlsx';

//Función para llenar los cuadros, pero acomodados correctamente
const fillCalendar = () => {
    //el html vacío que contendrá los recuadros
    let htmlForCalendar='';
    //Los días del mes en número
    let daysOfTheMonth = new Date(year,month+1,0).getDate();
    //El día en que comienza el mes, por ejemplo miércoles = 3
    let startDay = new Date(year,month,1).getDay();
    
    //Llenamos de cuadros vacíos si es necesario, si se comienza en domingo no
    for(i=0;i<startDay;i++){
        let element = `<div class="calendar-day">
                        </div>`;
        htmlForCalendar+=element; 
    }

    //llenamos los cuadros con números
    for(i=1;i<daysOfTheMonth+1;i++){
        let element = `<div class="calendar-day">
                            <div class="day-number"><p>${i}</p></div>
                            <div id="${i}${month+1}${year}first" class="first-section">9:00-12:00</div>
                            <div id="${i}${month+1}${year}second" class="second-section">16:00-19:00</div>
                        </div>`;
        htmlForCalendar+=element;                
    }

    //Se le asigna el contenido que creamos, al contenedor
    document.querySelector('.calendar-body').innerHTML = htmlForCalendar;
}

//Para aumentar un mes
const nextMonth = () => {
    if(month==11){
        year++;
        month=0;
    }else{
        month++;
    }
    document.querySelector('.calendar-month').innerHTML = `${months[month]} - ${year}`;
    fillCalendar();
    putDataInCalendar();
}

//Para ir un mes atrás
const lastMonth = () => {
    if(month==0){
        if(year>2000){
            year--;
            month=11;
        }
    }else{
        month--;
    }
    document.querySelector('.calendar-month').innerHTML = `${months[month]} - ${year}`;
    fillCalendar();
    putDataInCalendar();
}

//Método que se ejecuta cada que se cambia de región
const changeRegion = (number) => {
    htmlForRegion = '';
    switch(number){
        case 1:
            region = 'Norte'
        break;
        case 2:
            region = 'Noreste'
        break;
        case 3:
            region = 'Este'
        break;
        case 4:
            region = 'Sur'
        break;      
    }
    document.querySelector('.region-name').innerHTML = `Región: ${region}`;
    fillCalendar();
    putDataInCalendar();
}

//Método para obtener el archivo
const getFile = () => {
    return new Promise((res, rej) => {
        fetch(fileName)
        .then(result => {
            if(result.ok){
                result.blob().then(blob => {
                    let file = new File([blob], "excelFile", {
                        type: blob.type,
                    });
                    document.querySelector('.data-advise').style.display="none";
                    res(file)
                })
            }else{
                console.log('Error en la respuesta');
                document.querySelector('.data-advise').style.display="inline-block";
            }
        })
        .catch(error =>{
            console.log('Error al hacer fetch: ' + error.message);
            document.querySelector('.data-advise').style.display="inline-block";
        })
    })
}

//Método para separar los registros por municipio
const separateRows = () => {
    generalArray.forEach(row => { 
        if(nElements.includes(row['Municipio'])){
            nRows.push(row);
        }else if(neElements.includes(row['Municipio'])){
            neRows.push(row);
        }else if(sElements.includes(row['Municipio'])){
            sRows.push(row);
        }else if(eElements.includes(row['Municipio'])){
            eRows.push(row);
        }   
    })
}

//Método para la lectura del archivo Excel
var excelToJSON = function() {
    this.parseExcel = function(file) {
      var reader = new FileReader();

      reader.onload = function(e) {
        var data = e.target.result;
        var workbook = XLSX.read(data, {
          type: 'binary'
        });
        workbook.SheetNames.forEach(function(sheetName) {
          var XL_row_object = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
          var json_object = JSON.stringify(XL_row_object);
          generalArray = JSON.parse(json_object);
        })
        separateRows();
        putDataInCalendar();
      };
      reader.onerror = function(ex) {
        console.log(ex);
      };
      reader.readAsBinaryString(file);
    };
  };

//Se lee el archivo obteniendolo y luego parseandolo a formato JSON
const readFile = () =>{
    var xl2json = new excelToJSON();
    getFile()
    .then(file => xl2json.parseExcel(file))
    .catch(reason => document.querySelector('.data-advise').style.display="inline-block");
}

//Método para colorear correctamente los cuadros de las fechas ocupadas
const putDataInCalendar = () =>{
    let currentRegion = [];
    switch(region){
        case 'Norte':
            currentRegion = nRows;
        break;
        case 'Sur':
            currentRegion = sRows;
        break;
        case 'Noreste':
            currentRegion = neRows;
        break;
        case 'Este':
            currentRegion = eRows;
        break;
    }
    currentRegion.forEach(row => {
        //Datos de la fecha
        let dateDivided = row['Fecha de celebración de la Asamblea'].split('/');
        let rowDay = parseInt(dateDivided[1]);
        let rowMonth = parseInt(dateDivided[0]);
        let rowYear = parseInt(dateDivided[2])+2000;
        //Datos de la hora
        let hourDivided = row['Hora celebración de la Asamblea'].split(':');
        let rowHours = parseInt(hourDivided[0]);
        let rowMinutes = parseInt(hourDivided[1]);
        let rowTime = (rowHours*60)+rowMinutes;
        
        if(rowMonth==month+1 && rowYear == year){
            if(rowTime>=540 && rowTime<=720){
                var elemento = document.getElementById(`${rowDay}${rowMonth}${rowYear}first`);
                elemento.className += " busy";
            }else{ 
                //if(rowTime>=900 && rowTime<=1140)
                var elemento = document.getElementById(`${rowDay}${rowMonth}${rowYear}second`);
                elemento.className += " busy";
            } 
        }
    })
}

//Colocamos en la página el mes y el año actual
document.querySelector('.calendar-month').innerHTML = `${months[month]} - ${year}`;

//Se llama por primera vez al método para llenar el calendario de recuadros
fillCalendar();

//Se colorean los recuadros ocupados
readFile();