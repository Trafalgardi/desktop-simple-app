let canvas = document.getElementById("chart");
let chart;

let timerId;
let stove_temperature = document.getElementById("stove-temperature");
let inductance = document.getElementById("inductance");
let inductance_size = document.getElementById("inductance_size");
let isInductanceActived = false;
let genry_table = document.getElementById("genry_table")
let input_d = document.getElementById("d");
let input_D = document.getElementById("D");
let input_H = document.getElementById("H");

let x = [20, 30, 50, 76, 100, 117, 123, 128, 133, 139, 144, 147, 149, 150]
//let x = [20, 30, 40, 50, 70, 80, 90, 94, 98, 100, 106, 110, 114, 120, 130, 140, 150]
//М- магнитнитная проницаемость из экспериментальных данных
let y = [4000, 4320, 4600, 4900, 5350, 5810, 5980, 5820, 5000, 3000, 1000, 150, 40, 25]
//let y = [210, 211, 212, 218, 238, 254, 263, 264, 258, 250, 200, 145, 95, 37, 7, 3, 2]
//Табличные данные
//Число витков
let n = 10;
let D = 2.5;
let d = 1.5;
let H = 1.5;
//М0- магнитная  постоянная
let m0 = 200;

//l-Длина средней линии
let l = 0;
//s- площадь поперечного сечения
let s = 0;
let genry = false;
//Выбор варианты
function init(variant) {
  var json = JSON.parse(variant)
  if(json.v === 0){
    genry = false;
    genry_table.innerHTML = "L, мГн"
    x = [20, 30, 40, 50, 70, 80, 90, 94, 98, 100, 106, 110, 114, 120, 130, 140, 150];
    y = [210, 211, 212, 218, 238, 254, 263, 264, 258, 250, 200, 145, 95, 37, 7, 3, 2];
    m0 = 200;
  }else{
    genry = true;
    genry_table.innerHTML = "L, Гн"
    x = [20, 30, 50, 76, 100, 117, 123, 128, 133, 139, 144, 147, 149, 150];
    y = [4000, 4320, 4600, 4900, 5350, 5810, 5980, 5820, 5000, 3000, 1000, 150, 40, 25];
    m0 = 4000;
  }
  n = json.n
  d = json.d
  D = json.D

  input_d.value = json.d
  input_D.value = json.D
  input_H.value = json.H

  document.getElementById("n").value = n
  inductance_size.innerHTML = ""
  inductance.innerHTML = "";
  
  lCalc();
  sCalc();
  document.getElementById("record").disabled = true;
}

//#region Calc
//Индуктивность L= M * M0 * n^2 * S / l

//Подсчет интерполяции
function interpolation(temperature, i) {
  const nearestBelow = (input, lookup) => lookup.reduce((prev, curr) => input >= curr ? curr : prev);
  let x0 = nearestBelow(i, x);

  let x1 = x[x.indexOf(nearestBelow(i, x)) + 1];
  let y0 = y[x.indexOf(nearestBelow(i, x))];
  let y1 = y[x.indexOf(nearestBelow(i, x)) + 1];
  let Y = y0 + (temperature - x0) * ((y1 - y0) / (x1 - x0));

  return Y
}
//Подсчет индукции
function InductanceCalc(temperature) {

  let M = 0;
  if (x.indexOf(temperature) == -1) {

    M = interpolation(temperature, temperature)
    console.log(M)
  } else {
    M = y[x.indexOf(temperature)]
    console.log(M)
  }
  let one = M * m0;
  let two = one * Math.pow(n, 2);
  let three = two * s / l;

  let random;
  let four;
  if (randomInteger(1, 2) == 1) {
    random = randomInteger(1, 2);
    let procent = three / 100 * random
    four = three + procent
  } else {
    random = randomInteger(1, 2);
    let procent = three / 100 * random
    four = three - procent
  }
  if(genry){
    setData("inductance", (four / 1000000000).toFixed(4))
    inductance.innerHTML = (four / 1000000000).toFixed(4);
  }else{
    setData("inductance", (four / 1000000).toFixed(4))
    inductance.innerHTML = (four / 1000000).toFixed(4);
  }
  
}
//l-Длина средней линии - (D+d/2)pi
function lCalc() {
  let one = (D + d) / 2;
  let three = one * Math.PI;
  console.log(three)
  l = three;
  //document.getElementById("l").value = three.toFixed(3)
}
//S- площадь поперечного сечения (pi*d^2/4) new ((D-d) / 2) * H
function sCalc() {
  let one = D - d;
  let two = one / 2;
  let three = two * H;
  console.log(three)
  s = three;
  //document.getElementById("s").value = three.toFixed(3)
}
//рандом между двумя целачислиными числами
function randomInteger(min, max) {
  let rand = min - 0.5 + Math.random() * (max - min + 1);
  return Math.round(rand);
}

//#endregion
//смена окон между выбором варианта и основным окном 
function changeOption(select) {
  var selected = select.options[select.selectedIndex].value;
  document.getElementById("option").style.display = "none"
  document.getElementById("main").style.display = ""
  //document.getElementById("title").innerHTML = `Вариант ${selected}`
  init(selected)
}
//Нажатия на кнопку печки
function stove_toggle(isActived) {
  clearInterval(timerId)
  let indecator = document.getElementById("Indicator");
  let cap = document.getElementById("Cap")
  if (isActived) {
    startTimer(stove_on)
    cap.style.display = ""
    indecator.innerHTML = '<img src="vendor/images/IndicatorON.png">';
  } else {
    indecator.innerHTML = '<img src="vendor/images/IndicatorOFF.png">';
    cap.style.display = "none"
    startTimer(stove_off)
  }
}
//Нажатия на кнопку индукции
function inductance_toggle(bool) {

  isInductanceActived = bool
  var value = parseInt(getData("stove-temperature"), 10)
  var element = document.getElementById("inductance_disabled");

  if (isInductanceActived) {
    element.classList.remove("disabled");
    
    if(genry)
      {
        genry_table.innerHTML = "L, Гн";
        inductance_size.innerHTML = " Гн";
      }
      else
      {
        genry_table.innerHTML = "L, мГн";
        inductance_size.innerHTML = " мГн";
      }
    document.getElementById("record").disabled = false;
    InductanceCalc(value)
  } else {
    inductance_size.innerHTML = "";
    inductance.innerHTML = "";
    element.classList.add("disabled");
    document.getElementById("record").disabled = true;
  }
}
const step = 1;
//Включение печки
function stove_on() {
  var value = parseInt(getData("stove-temperature"), 10)
  if (value === 150) {
    clearInterval(timerId)
    return
  }
  value += step;
  setData("stove-temperature", value)
  stove_temperature.innerHTML = value;
  if (isInductanceActived) InductanceCalc(value)
}
//Выключение печки
function stove_off() {
  var value = parseInt(getData("stove-temperature"), 10)
  if (value === 20) {
    clearInterval(timerId)
    return
  }
  value -= step;
  setData("stove-temperature", value)
  stove_temperature.innerHTML = value;
  if (isInductanceActived) InductanceCalc(value)
}
//Таймер печки
function startTimer(func) {
  timerId = setInterval(() => func(), 1000);
}
//Получение данных по id элемента
function getData(element_id) {
  var el = document.getElementById(element_id)
  console.log(el.dataset.innerdata);
  return el.dataset.innerdata
}
//Запись данных по id элемента
function setData(element_id, data) {
  var el = document.getElementById(element_id)
  el.dataset.innerdata = data;
  return data
}



//#region function for buttons
let indexRow = 0;
let table = document.getElementById("table")
let temps = []
let dataCharts = []
//Кнопка записать данные
function recordData() {
  indexRow++;
  var data = `
  <tr>
    <th scope="row">${indexRow}</th>
    <td>${getData("stove-temperature")}</td>
    <td>${getData("inductance")}</td>
  </tr>`;
  temps.push(getData("stove-temperature"))
  dataCharts.push(getData("inductance"))
  table.insertAdjacentHTML("beforeend", data)
}
//Кнопка очистить данные
function clearData() {
  indexRow = 0;
  temps = [0]
  dataCharts = [0]
  table.innerHTML = "";
}
//labels: temps,
//      data: dataCharts,
//Создание графика
function createChart() {
  let data = {
    labels: temps,
    datasets: [{
      label: "",
      data: dataCharts,
      lineTension: 0,
      fill: false,
      borderColor: 'orange',
      backgroundColor: 'transparent',
      borderDash: [5, 5],
      pointBorderColor: 'orange',
      pointBackgroundColor: 'rgba(255,150,0,0.5)',
      pointRadius: 5,
      pointHoverRadius: 10,
      pointHitRadius: 30,
      pointBorderWidth: 2,
      pointStyle: 'rectRounded',
      cubicInterpolationMode: "monotone"
    }]
  };

  let chartOptions = {
    legend: {
      display: false,
      position: 'top',
      labels: {
        boxWidth: 80,
        fontColor: 'black'
      }
    }
  };

  chart = new Chart(canvas, {
    type: 'line',
    data: data,
    options: chartOptions
  });
}
//Сохранение pdf
function saveTable() {
  const doc = new jsPDF();

  doc.setFont('Roboto-Regular', 'normal');
  doc.setFontSize(40);

  //doc.text(`Bap: ${option}`, 35, 25);

  doc.text("Table", 35, 50);
  var columns = ["#", "T, C°", "L, Gn"]
  if(genry){
    columns = ["#", "T, C°", "L, Gn"]
  }else{
    columns = ["#", "T, C°", "L, mGn"]
  }

  var rows = []
  for (let i = 1; i < dataCharts.length; i++) {
    let t = [i, temps[i], dataCharts[i]]
    rows.push(t)
  }

  doc.autoTable(columns, rows, {
    theme: 'grid',
    styles: {
      cellPadding: 0.5,
      fontSize: 12
    },
    margin: {
      top: 75
    }
  });

  var canvas = document.querySelector('#chart');
  var canvasImg = canvas.toDataURL("image/png", 1.0);
  doc.addPage("a4", "landscape");
  doc.text("Chart", 35, 25);
  doc.addImage(canvasImg, 'PNG', 40, 40, 225, 112.5);

  doc.save('table.pdf')
}