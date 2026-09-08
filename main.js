const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const si = require("systeminformation");

function createWindow() {
    console.log("流浪者正在启动！");

    const preloadPath = path.join(__dirname, "preload.js");

    console.log("preload 路径：", preloadPath);

    const win = new BrowserWindow({
        width: 400,
        height: 600,

        transparent: true,
        frame: false,
alwaysOnTop: true,

        webPreferences: {
            preload: preloadPath,
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    win.loadFile("index.html");


}


// 获取 GPU 信息
ipcMain.handle("get-system-stats", async () => {

    console.log("正在读取 GPU 信息...");

    try {

        const graphics = await si.graphics();

        const gpu = graphics.controllers?.[0];

        if (!gpu) {
            console.log("没有找到 GPU");
            return null;
        }

        const result = {
            name: gpu.model ?? "Unknown GPU",
            temperature: gpu.temperatureGpu ?? null,
            memoryUsed: gpu.memoryUsed ?? null,
            memoryTotal: gpu.memoryTotal ?? null
        };

        console.log("GPU 信息：", result);

        return result;

    } catch (error) {

        console.error("读取 GPU 信息失败：", error);

        return null;
    }
});


app.whenReady().then(() => {
    createWindow();
});