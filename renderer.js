//Make Node.js API calls in this file
'use strict'
const remote = require('electron').remote
var win = remote.getCurrentWindow()

document.getElementById('headerClose').addEventListener('click', () => {
	win.close()
});
document.getElementById('minimize').addEventListener('click', () => {
	win.minimize()
});
document.getElementById('maximize').addEventListener('click', () => {
	win.isMaximized() ? win.unmaximize() : win.maximize() 
});