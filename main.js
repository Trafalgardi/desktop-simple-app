const {app, BrowserWindow} = require('electron')

let mainWindow

function createWindow () {
  mainWindow = new BrowserWindow({
    backgroundColor: 'lightgray',
    webPreferences: {
      nodeIntegration: true,
      defaultEncoding: 'UTF-8'
    },
    minWidth: 1024,
    minHeight: 900,
    center: true,
    width: 1600,
    height: 900,
    frame: false
  })


  mainWindow.loadFile('index.html')

  mainWindow.on('closed', function () {
    mainWindow = null
  })
}

app.on('ready', createWindow)

app.on('resize', function(e,x,y){
  mainWindow.setSize(x, y);
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow()
  }
})
