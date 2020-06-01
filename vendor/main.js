let canvas = document.getElementById("chart");
let chart;

let timerId;
let stove_temperature = document.getElementById("stove-temperature");
let ommetr = document.getElementById("ommetr");
let isOmmetrActived = false;
//удельное сопративление TODO временно
let p = 0.016;
let option;

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

function ommetr_toggle(bool) {
  isOmmetrActived = bool
  var value = parseInt(getData("stove-temperature"), 10)
  if (isOmmetrActived) ommetrCalc(value)
}

function stove_on() {
  var value = parseInt(getData("stove-temperature"), 10)
  if (value === 150) {
    clearInterval(timerId)
    return
  }
  value += 5;
  setData("stove-temperature", value)
  stove_temperature.innerHTML = value;
  if (isOmmetrActived) ommetrCalc(value)
}

function stove_off() {
  var value = parseInt(getData("stove-temperature"), 10)
  if (value === 20) {
    clearInterval(timerId)
    return
  }
  value -= 5;
  setData("stove-temperature", value)
  stove_temperature.innerHTML = value;
  if (isOmmetrActived) ommetrCalc(value)
}

function startTimer(func) {
  timerId = setInterval(() => func(), 3000);
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

//#region Calc
function ommetrCalc(temperature) {
  var r = getRandomInt(temperature, temperature + 10)
  setData("ommetr", r)
  ommetr.innerHTML = r;
}

function rZeroCalc() {
  let L = parseInt(document.getElementById("lenght").value, 10)
  var R = (p * L) / sCalc()
  return R
}

function sCalc() {
  let D = parseFloat(document.getElementById("diametr").value, 10)
  var S = (Math.PI * Math.pow(D, 2)) / 4;
  return S
}

//#endregion


function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //Максимум не включается, минимум включается
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
    <td>${getData("ommetr")}</td>
  </tr>`;
  temps.push(getData("stove-temperature"))
  dataCharts.push(getData("ommetr"))
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
      pointStyle: 'rectRounded'
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
  //doc.addFont("vendor/PTSans.ttf", "PTSans", "normal");
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

function Base64Encode(str, encoding = 'utf-8') {
  var bytes = new (TextEncoder || TextEncoderLite)(encoding).encode(str);        
  return base64js.fromByteArray(bytes);
}

