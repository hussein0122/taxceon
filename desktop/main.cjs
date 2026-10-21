const { app, BrowserWindow, dialog, shell } = require('electron');
const path = require('node:path');

const APP_ID = 'com.husseinsead.taxialexandria3d';
app.setAppUserModelId(APP_ID);

let mainWindow;

function showFatalError(title, error) {
  const detail = error instanceof Error ? error.stack || error.message : String(error);
  console.error(title, detail);
  if (app.isReady()) {
    dialog.showMessageBox({
      type: 'error',
      title: 'تاكسي الإسكندرية 3D',
      message: title,
      detail: 'أغلق اللعبة وافتحها مرة أخرى. لو تكررت المشكلة، حدّث تعريف كارت الشاشة.\n\n' + detail,
      buttons: ['موافق']
    });
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    title: 'تاكسي الإسكندرية 3D',
    width: 1440,
    height: 900,
    minWidth: 960,
    minHeight: 640,
    show: false,
    backgroundColor: '#020617',
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true
    }
  });

  mainWindow.once('ready-to-show', () => {
    if (mainWindow && !mainWindow.isDestroyed()) mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://') || url.startsWith('http://')) {
      shell.openExternal(url).catch(error => showFatalError('تعذر فتح الرابط الخارجي', error));
    }
    return { action: 'deny' };
  });

  mainWindow.webContents.on('will-navigate', (event, url) => {
    const allowedUrl = mainWindow && url.startsWith('file://');
    const allowedDevUrl = !app.isPackaged && url.startsWith('http://127.0.0.1:3000');
    if (!allowedUrl && !allowedDevUrl) event.preventDefault();
  });

  mainWindow.webContents.on('render-process-gone', (_event, details) => {
    showFatalError(
      'توقف محرك الرسوم الخاص باللعبة',
      new Error('Renderer process ended: ' + details.reason + (details.exitCode !== undefined ? ' (code ' + details.exitCode + ')' : ''))
    );
  });

  const entryPath = path.join(__dirname, '..', 'dist', 'index.html');
  const devUrl = process.env.VITE_DEV_SERVER_URL || 'http://127.0.0.1:3000';

  const loadPromise = app.isPackaged ? mainWindow.loadFile(entryPath) : mainWindow.loadURL(devUrl);
  loadPromise.catch(error => showFatalError('تعذر تحميل ملفات اللعبة', error));

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

process.on('uncaughtException', error => showFatalError('حدث خطأ غير متوقع في التطبيق', error));
process.on('unhandledRejection', reason => showFatalError('حدث خطأ غير متوقع أثناء تشغيل اللعبة', reason));

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
}).catch(error => showFatalError('تعذر بدء التطبيق', error));

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
