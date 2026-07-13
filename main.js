const { app, BrowserWindow, globalShortcut, ipcMain, screen, Tray, Menu, nativeImage } = require('electron');
const path = require('path');

const SHORTCUT = 'CommandOrControl+Shift+T';
let win = null;
let tray = null;

function createTray() {
  tray = new Tray(nativeImage.createEmpty());
  tray.setTitle('文A'); // text-based menu bar icon
  tray.setToolTip('Translator — ⌘⇧T');
  const menu = Menu.buildFromTemplate([
    { label: 'Show / Hide  ⌘⇧T', click: toggleWindow },
    { type: 'separator' },
    { label: 'Quit', click: () => { app.isQuiting = true; app.quit(); } }
  ]);
  // left-click toggles the widget, right-click opens the menu
  tray.on('click', toggleWindow);
  tray.on('right-click', () => tray.popUpContextMenu(menu));
}

function createWindow() {
  const { width } = screen.getPrimaryDisplay().workAreaSize;
  win = new BrowserWindow({
    width: 420,
    height: 340,
    x: width - 440,
    y: 40,
    show: false,
    frame: false,
    // NSPanel: required on macOS for the window to appear over
    // other apps' fullscreen spaces instead of switching to them
    type: 'panel',
    hiddenInMissionControl: true,
    resizable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    fullscreenable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true
    }
  });

  // Float above everything, including other apps' fullscreen spaces.
  // fullScreenable must be off before setVisibleOnAllWorkspaces or the
  // visibleOnFullScreen flag is ignored.
  win.setFullScreenable(false);
  win.setAlwaysOnTop(true, 'screen-saver');
  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true, skipTransformProcessType: true });

  win.loadFile('index.html');

  // Hide instead of closing so the shortcut keeps working
  win.on('close', (e) => {
    if (!app.isQuiting) {
      e.preventDefault();
      win.hide();
    }
  });

  win.on('blur', () => win.hide());
}

function toggleWindow() {
  if (!win) return;
  if (win.isVisible()) {
    win.hide();
  } else {
    // re-assert level each show; macOS can demote it
    win.setAlwaysOnTop(true, 'screen-saver');
    win.show();
    win.focus();
    win.webContents.send('focus-input');
  }
}

app.whenReady().then(() => {
  // Keep the app out of the macOS Dock — it's a background widget.
  // Must happen before window creation for fullscreen overlay to work.
  if (process.platform === 'darwin') app.dock.hide();

  createWindow();
  createTray();

  const ok = globalShortcut.register(SHORTCUT, toggleWindow);
  if (!ok) console.error('Failed to register global shortcut', SHORTCUT);
});

app.on('will-quit', () => globalShortcut.unregisterAll());

// Don't quit when the window is hidden
app.on('window-all-closed', (e) => e.preventDefault());

ipcMain.handle('translate', async (_event, { text, from, to }) => {
  const url =
    'https://translate.googleapis.com/translate_a/single?client=gtx&sl=' +
    encodeURIComponent(from) +
    '&tl=' +
    encodeURIComponent(to) +
    '&dt=t&q=' +
    encodeURIComponent(text);
  const res = await fetch(url);
  if (!res.ok) throw new Error('Translation request failed: ' + res.status);
  const data = await res.json();
  const translated = data[0].map((seg) => seg[0]).join('');
  const detected = data[2] || from;
  return { translated, detected };
});

ipcMain.on('hide-window', () => win && win.hide());
ipcMain.on('quit-app', () => {
  app.isQuiting = true;
  app.quit();
});
