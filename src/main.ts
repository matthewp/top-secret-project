// Modules to control application life and create native browser window
import {app, BrowserWindow, globalShortcut, protocol} from 'electron';
import path from 'path';
import './backend/request';
import Store from 'electron-store';

interface WindowSizePreference {
  width: number;
  height: number;
}

function createWindow () {
  const store = new Store();
  const { width, height } = store.get('prefs.window.size') as WindowSizePreference ?? {
    width: 800,
    height: 600
  };

  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width,
    height,
    titleBarStyle: 'hidden',
    trafficLightPosition: { x: 20, y: 12 },
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, './preload.js')
    } 
  })

  // and load the index.html of the app.
  mainWindow.loadFile('index.html');

  mainWindow.on('resize', ev => {
    setImmediate(() => {
      let [width, height] = mainWindow.getSize();
      store.set('prefs.window.size', { width, height });
    });
  })

  // Open the DevTools.
   mainWindow.webContents.openDevTools()

  return mainWindow;
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  let mainWindow = createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      mainWindow = createWindow();
    }
  });

  app.on('window-all-closed', function () {
    if (process.platform !== "darwin") {
      app.quit();
    }
  });

  globalShortcut.register('CommandOrControl+T', () => {
    mainWindow.webContents.send('ctrl-cmd-t', {});
  });

  protocol.registerFileProtocol('browser', (request, callback) => {
    const url = new URL(request.url);
    const pth = path.normalize(`${__dirname}/../content/browser/${url.host}${url.pathname}`);
    callback({ path: pth });
  })
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
});

app.on('will-quit', () => {
  globalShortcut.unregister('CommandOrControl+T');
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.