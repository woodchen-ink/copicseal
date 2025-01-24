import { app, shell, BrowserWindow, ipcMain } from 'electron';
import path, { join } from 'path';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import icon from '../../resources/icon.png?asset';
import puppeteer from 'puppeteer-core';
import pie from 'puppeteer-in-electron';

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  });

  mainWindow.on('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('resized', () => {
    mainWindow.webContents.send('resized');
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }

  return mainWindow;
}

pie.initialize(app);

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron');

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  // IPC test
  ipcMain.on('ping', () => console.log('pong'));

  const mainWindow = createWindow();

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  ipcMain.on('capture-div', async (_event, divSelector, viewport) => {
    console.log(divSelector, viewport);

    console.time('capture-div');
    const outputPath = path.resolve('div_screenshot.jpg'); // 保存截图路径
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const browser = await pie.connect(app, puppeteer);
    const page = await pie.getPage(browser, mainWindow);
    const vp = page.viewport();
    page.setViewport({ ...viewport, deviceScaleFactor: 2 });
    // 截取特定元素
    const element = await page.$(divSelector);
    if (element) {
      await page.screenshot({ path: outputPath, type: 'jpeg' });
      // browser.close()
    }
    page.setViewport(vp);
    console.log('截图完成', outputPath);
    console.timeEnd('capture-div');

    // // mainWindow.webContents.executeJavaScript(`alert('${outputPath}')`)
    _event.returnValue = outputPath;
    return outputPath;
    // try {
    //   mainWindow.setOpacity(0)
    //   await captureDivScreenshot(mainWindow, divSelector, outputPath)
    //   mainWindow.setOpacity(1)
    //   return { success: true, path: outputPath }
    // } catch (error) {
    //   mainWindow.setOpacity(1)
    //   return { success: false, error: (error as Error).message }
    // }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
