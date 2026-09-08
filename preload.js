const { contextBridge, ipcRenderer } = require("electron");

console.log("PRELOAD 已经加载！");

contextBridge.exposeInMainWorld("systemInfo", {

    getStats: () => {
        console.log("PRELOAD 收到 getStats 请求！");
        return ipcRenderer.invoke("get-system-stats");
    }

});