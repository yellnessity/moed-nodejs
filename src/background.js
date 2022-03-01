import { app, protocol, BrowserWindow, ipcMain } from "electron";
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";
import installExtension, { VUEJS_DEVTOOLS } from "electron-devtools-installer";
import { fourier } from "./utils/fourier";
import { amplify } from "./utils/amplifyPicture";
import { restore } from "./utils/restorePicture";
import { convolution } from "./utils/convolution";
import { bsf } from "./models";

const fs = require("fs");
var dgram = require("dgram");
const { Readable } = require("stream");
const BinaryFile = require("binary-file");
const sharp = require("sharp");
const cv = require("opencv4nodejs");

const isDevelopment = process.env.NODE_ENV !== "production";

var client;

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: "app", privileges: { secure: true, standard: true } },
]);

async function getRawData(buffer) {
  const { data, info } = await sharp(buffer)
    .raw()
    .toBuffer({ resolveWithObject: true });
  const array = new Array(data.length);
  for (let i = 0; i < data.length; i = i + 1) array[i] = data[i];

  return { data: array, info };
}

async function getBuffer(data, info) {
  const typedArray = new Uint8Array(data);
  const { width, height, channels } = info;
  const res = await sharp(typedArray, { raw: { width, height, channels } })
    .jpeg()
    .toBuffer();

  return res;
}

function swap16(val) {
  return ((val & 0xff) << 8) | ((val & 0xff00) >> 8);
}

function swap32(val) {
  var x =
    ((val & 0xff) << 24) |
    ((val & 0xff00) << 8) |
    ((val >> 8) & 0xff00) |
    ((val >> 24) & 0xff);
  if (x < 0) x = (x & 0x7fffffff) + 0x80000000;
  return x;
}

function swap(b, n, m) {
  const i = b[n];
  b[n] = b[m];
  b[m] = i;
}

async function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 1500,
    height: 700,
    title: "VKR-client",
    webPreferences: {
      nodeIntegration: true,
      webSecurity: false,
    },
  });

  win.maximize();

  win.setTitle("VKR-client");

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
  } else {
    createProtocol("app");
    // Load the index.html when not in development
    win.loadURL("app://./index.html");
  }
}

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS_DEVTOOLS);
    } catch (e) {
      console.error("Vue Devtools failed to install:", e.toString());
    }
  }
  createWindow();
  client = dgram.createSocket("udp4");
});

ipcMain.on("fourier-process", (event, arg) => {
  console.log("call fourier " + arg[1]);
  try {
    const res = fourier(arg[0]);
    event.reply("on-fourier", [res, arg[1]]);
    console.log("fourier success");
  } catch (error) {
    console.log(error);
  }
});

ipcMain.on("read-file", async (event, buffer) => {
  const SIZE_X = 1024;
  const SIZE_Y = 1024;
  
  console.log(buffer);
  let dataView = new DataView(buffer.buffer);
  let byteNum = 0;
  for (let i = 0; i < buffer.length; i++) {
    dataView.setInt16(byteNum, buffer[i], false);
    byteNum += Int16Array.BYTES_PER_ELEMENT;
  }

  let croppedBuffer = buffer.slice(buffer.length - SIZE_X * SIZE_Y);
  console.log(croppedBuffer);

  // let sharedBuffer = Buffer.from(croppedBuffer);
  // let newBuffer = sharedBuffer.swap16();
  // console.log(newBuffer);

  event.reply("on-read-file", croppedBuffer);
});

ipcMain.on("show-filter", (event) => {
  event.reply("on-show-filter", bsf(10, 80, 64, 0.002));
});

ipcMain.on("get-convolution", (event, arg) => {
  console.log("call convolution " + arg[2]);
  try {
    event.reply("on-convolution", [convolution(arg[0], arg[1]), arg[2]]);
    console.log("convolution success");
  } catch (error) {
    console.log(error);
  }
});

ipcMain.on("process-image", async (event, buffer) => {
  const { data, info } = await getRawData(buffer);

  const amplifiedData = await amplify(data);
  const restoredData = await restore(amplifiedData);

  const res = [
    await getBuffer(amplifiedData, info),
    await getBuffer(restoredData, info),
  ];

  event.reply("on-image-process", res);
});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === "win32") {
    process.on("message", (data) => {
      if (data === "graceful-exit") {
        client.close();
        app.quit();
      }
    });
  } else {
    process.on("SIGTERM", () => {
      client.close();
      app.quit();
    });
  }
}
