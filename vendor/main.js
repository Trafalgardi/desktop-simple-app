let canvas = document.getElementById("chart");
let chart;

let timerId;
let stove_temperature = document.getElementById("stove-temperature");
let inductance = document.getElementById("inductance");
let isInductanceActived = false;

//Табличные данные
//Число витков
let n = 1;
let D = 2.5;
let d = 1.5;
//М- магнитнитная проницаемость из экспериментальных данных
let m = 60;
//М0- начальная магнитная проницаемость
let m0 = 80;
//l-Длина средней линии
let l = 0;
//s- площадь поперечного сечения
let s = 0;

let option;

init(1)

function init(variant){
  document.getElementById("n").value = n
  lCalc();
  sCalc();
}

//#region Calc
//Индуктивность L= M * M0 * n^2 * S / l

function InductanceCalc(temperature) {
  let one = m * m0;
  let two = one * Math.pow(n, 2);
  let three = two * s / l;
  setData("inductance", three.toFixed(2))
  inductance.innerHTML = three.toFixed(2);
}
//l-Длина средней линии - (D+d/2)pi
function lCalc() {
  let one = d / 2;
  let two = D + one;
  let three = two / Math.PI;
  console.log(three)
  l = three;
  document.getElementById("l").value = three.toFixed(3)
}
//S- площадь поперечного сечения (pi*d^2/4)
function sCalc() {
  let one = Math.pow(d, 2);
  let two = Math.PI * one;
  let three = two / 4;
  console.log(three)
  s = three;
  document.getElementById("s").value = three.toFixed(3)
}
//#endregion

function changeOption(select) {
  var selected = select.options[select.selectedIndex].value;
  document.getElementById("option").style.display = "none"
  document.getElementById("main").style.display = ""
  document.getElementById("title").innerHTML = `Вариант ${selected}`
  option = selected
}

function stove_toggle(isActived) {
  clearInterval(timerId)
  if (isActived) {
    startTimer(stove_on)
  } else {
    startTimer(stove_off)
  }
}

function inductance_toggle(bool) {
  isInductanceActived = bool
  var value = parseInt(getData("stove-temperature"), 10)
  var element = document.getElementById("inductance_disabled");

  if (isInductanceActived) {
    element.classList.remove("disabled");
    InductanceCalc(value) 
  }else{
    element.classList.add("disabled");
  }
}
const step = 1;
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

function startTimer(func) {
  timerId = setInterval(() => func(), 5000);
}

function getData(element_id) {
  var el = document.getElementById(element_id)
  console.log(el.dataset.innerdata);
  return el.dataset.innerdata
}

function setData(element_id, data) {
  var el = document.getElementById(element_id)
  el.dataset.innerdata = data;
  return data
}



//#region function for buttons
let indexRow = 0;
let table = document.getElementById("table")
let temps = [0]
let dataCharts = [0]

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

function clearData() {
  indexRow = 0;
  temps = [0]
  dataCharts = [0]
  table.innerHTML = "";
}

function createChart() {
  let data = {
    labels: dataCharts,
    datasets: [{
      label: "",
      data: temps,
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

function saveTable() {
  const doc = new jsPDF();
  
  doc.setFont('Roboto-Regular', 'normal');
  doc.setFontSize(40);

  doc.text(`Bap: ${option}`, 35, 25);

  doc.text("Table", 35, 50);

  var columns = ["#", "T, oC", "R, Om"]
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

