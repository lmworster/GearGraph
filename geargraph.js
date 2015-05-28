/**************************************************
 * GearGraph
 * A JavaScript implementation to create geometric drawings.
 **************************************************/

var canvas
var context
var imgData
var radius
var tracerLookup = new Map()
var drawHistory = []

function setPoint(imgData, x, y, r, g, b) {
 // Does not set points outside the image area.
 if (x < imgData.width && y < imgData.height) {
   var i = 4*(x + imgData.width*y)
   imgData.data[i]   = r
   imgData.data[i+1] = g
   imgData.data[i+2] = b
 }
}

// Traces a circle.
var linearTracer = function (imgData, theta, r, gearRatio, red, grn, blue) {
 var x = 256 + Math.round(r*Math.cos(theta))
 var y = 256 + Math.round(r*Math.sin(theta))
 setPoint(imgData, x, y, red, grn, blue)
}

// Traces a sinusiod around a circle.
// The sinusoid is defined by rDelta.
var sinusoidTracer = function (imgData, theta, r, gearRatio, red, grn, blue) {
 var rDelta = r - Math.round(r/gearRatio*(Math.cos(theta*gearRatio)+1))
 var x = 256 + Math.round(rDelta*Math.cos(theta))
 var y = 256 + Math.round(rDelta*Math.sin(theta))
 setPoint(imgData, x, y, red, grn, blue)
}

// Traces an epicycloid around a circle.
// The epicycloid is defined by rDelta and tPrime.
var epicycloidTracer = function (imgData, theta, r, gearRatio, red, grn, blue) {
 var rDelta = r - Math.round(r/gearRatio*(1 - Math.cos(theta*gearRatio)))
 var tPrime = theta - (Math.sin(theta*gearRatio) / gearRatio)
 var x = 256 + Math.round(rDelta*Math.cos(tPrime))
 var y = 256 + Math.round(rDelta*Math.sin(tPrime))
 setPoint(imgData, x, y, red, grn, blue)
}

function trace(imgData, r, tracingFunction, laps, gearRatio, red, grn, blue) {
 var circumference = 2*Math.PI*r
 for(var i = 0; i < circumference*laps; i++) {
   // Theta is in radians.
   var theta = 2*Math.PI*i/circumference
   tracingFunction(imgData, theta, r, gearRatio, red, grn, blue)
 }
}

function geargraphInit() {
  canvas = document.getElementById("canvas")
  context = canvas.getContext("2d")
  context.fillStyle = "#FFFFFF"
  context.fillRect(0,0,canvas.width,canvas.height)
  imgData = context.getImageData(0,0,canvas.width,canvas.height)
  if (canvas.width <= canvas.height) {
    radius = Math.floor((canvas.width-1)/2)
  } else {
    radius = Math.floor((canvas.height-1)/2)
  }
  trace(imgData, radius, linearTracer, 1, 0, 0, 0, 0)
  context.putImageData(imgData,0,0)
  tracerLookup.set("sinusoid", sinusoidTracer)
  tracerLookup.set("epicycloid", epicycloidTracer)
}

function makeDelButton() {
  var delButton = document.createElement("input")
  delButton.setAttribute("type", "button")
  delButton.setAttribute("onclick", "delTrace(this)")
  delButton.setAttribute("value", "del")
  return delButton
}

function addHistory(style, cycles, ratio, red, green, blue, traceNumber) {
  drawHistory.push({style:style, cycles:cycles, ratio:ratio,
                    red:red, green:green, blue:blue})
  var delButton = makeDelButton()
  var rgbColor = "rgb(" + red + "," + green + "," + blue + ")"

  var history = document.getElementById("history")
  var insHistory = history.insertRow(drawHistory.length)
  insHistory.insertCell(0).appendChild(delButton)
  insHistory.insertCell(1).innerHTML = style
  //insHistory.insertCell(2).innerHTML = "&nbsp;"
  insHistory.insertCell(3).innerHTML = cycles
  insHistory.insertCell(4).innerHTML = ratio

  var histCells = history.rows[drawHistory.length].cells
  histCells[2].style.background = rgbColor
}

function draw(style, cycles, ratio, red, green, blue) {
 imgData = context.getImageData(0,0,canvas.width,canvas.height)
 trace(imgData, radius, tracerLookup.get(style), cycles, ratio, red, green, blue)
 context.putImageData(imgData,0,0)
}

function drawButton() {
  var drpdwn = document.getElementById("drpdwn")
  var style  = drpdwn.options[drpdwn.selectedIndex].text.toLowerCase()
  var red    = document.getElementById("penred").value
  var green  = document.getElementById("pengrn").value
  var blue   = document.getElementById("penblue").value
  var cycles = document.getElementById("cycles").value
  var ratio  = document.getElementById("ratio").value

  draw(style, cycles, ratio, red, green, blue)
  addHistory(style, cycles, ratio, red, green, blue, drawHistory.length)
}

function clearCanvas() {
 context.fillStyle = "#FFFFFF"
 context.fillRect(0,0,canvas.width,canvas.height)
 imgData = context.getImageData(0,0,canvas.width,canvas.height)
 trace(imgData, radius, linearTracer, 1, 0, 0, 0, 0)
 context.putImageData(imgData,0,0)
}

function clearHistory() {
  drawHistory = []

  for(var i = 1; i < tbl.length; i++) {
    document.getElementById("history").deleteRow(i)
  }
}

function delTrace(row) {
  var traceNumber = row.parentNode.parentNode.rowIndex - 1
  drawHistory.splice(traceNumber,1)
  clearCanvas()
  imgData = context.getImageData(0,0,canvas.width,canvas.height)
  for(var i = 0; i < drawHistory.length; i++) {
    var line = drawHistory[i]
    trace(imgData, radius, tracerLookup.get(line.style), line.cycles, line.ratio, line.red, line.green, line.blue)
  }
  context.putImageData(imgData,0,0)
  document.getElementById("history").deleteRow(traceNumber + 1)
}
