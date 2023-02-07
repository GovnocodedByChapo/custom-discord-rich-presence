const { Notification, shell, dialog, app, BrowserWindow, Menu, Tray, ipcMain } = require('electron');
const path = require('path');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 700,
    height: 470,
    webPreferences: {
      preload: path.join(__dirname, 'main.js'),
      nodeIntegration: true
    },
    resizable: false,
    show: false,
    icon: './icon.png',
    skipTaskbar: true
  });
  mainWindow.setMenu(null)
  mainWindow.loadFile(path.join(__dirname, 'index.html'));
  //mainWindow.webContents.openDevTools();
  app.whenReady().then(() => {
    dialog.showMessageBox(mainWindow, {title: 'Custom Discord RP', message: 'Started!\n(app will hide in tray)'});
    let iconPath = path.join(__dirname, 'icon.png');
    appIcon = new Tray(iconPath)
    appIcon.on('click', () => { 
      mainWindow.show() 
    })
  })
};


app.on('ready', createWindow);
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});