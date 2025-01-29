import { app, BrowserWindow } from 'electron';
import path, { join } from 'path';
import pie from 'puppeteer-in-electron';
import puppeteer from 'puppeteer-core';
import { is } from '@electron-toolkit/utils';

interface Output {
  path: string;
  type?: 'jpeg' | 'png';
  quality?: number;
  width: number;
  height: number;
  scale?: number;
}

export interface CaptureOptions {
  html: string;
  output: Output[] | Output;
}

let mainWindow: BrowserWindow | null = null;
let timer: ReturnType<typeof setTimeout> | null = null;
export async function handleCapture({ html, output }: CaptureOptions) {
  if (!Array.isArray(output)) {
    output = [output];
  }
  if (!output.length) {
    return [];
  }

  const currentOutput = output[0];

  console.time('capture-div');
  if (!mainWindow) {
    mainWindow = await createWindow();
  }
  if (timer) {
    clearTimeout(timer);
  }
  if (!mainWindow.isVisible()) {
    mainWindow.show();
    mainWindow.blur();
  }

  mainWindow.webContents.executeJavaScript(`
        document.head.innerHTML = '';
        document.body.innerHTML = \`${html}\`;
        `);

  const outputPath = currentOutput.path; // 保存截图路径
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const browser = await pie.connect(app, puppeteer);
  const page = await pie.getPage(browser, mainWindow);
  const vp = page.viewport();
  page.setViewport({
    deviceScaleFactor: currentOutput.scale,
    width: currentOutput.width,
    height: currentOutput.height
  });
  // 截取特定元素
  await page.screenshot({
    path: outputPath,
    type: currentOutput.type,
    quality: currentOutput.quality
  });
  page.setViewport(vp);
  console.log('截图完成', outputPath);
  console.timeEnd('capture-div');
  timer = setTimeout(() => {
    mainWindow?.hide();
  }, 1000);

  return [outputPath, ...(await handleCapture({ html, output: output.slice(1) }))].filter(Boolean);
}

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1,
    height: 1,
    show: true,
    autoHideMenuBar: true,
    frame: false,
    opacity: 0, // 窗口不透明度
    focusable: false, // 窗口不可聚焦
    skipTaskbar: true, // 窗口不显示在任务栏中
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  });

  mainWindow.setPosition(0, 0);

  mainWindow.blur();

  // 加载原有页面防止 blob url 图片跨域
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }
  return new Promise<BrowserWindow>((resolve) => {
    mainWindow.webContents.on('did-finish-load', () => {
      resolve(mainWindow);
    });
  });
}
