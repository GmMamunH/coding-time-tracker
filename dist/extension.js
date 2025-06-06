"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
// src/extension.ts
const vscode = __importStar(require("vscode"));
let codingSeconds = 0;
let timer;
let inactivityTimeout;
let lastActivityTime = Date.now();
let today = new Date().toDateString();
const idleThresholdKey = "codingTimeTracker.idleThreshold";
const notificationShownKey = "codingTimeTracker.notificationShown";
function activate(context) {
    const config = vscode.workspace.getConfiguration();
    const idleThreshold = config.get(idleThresholdKey, 60); // in seconds
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    statusBarItem.backgroundColor = new vscode.ThemeColor("statusBarItem.warningBackground");
    statusBarItem.text = `$(clock) Coding Time: 0s`;
    statusBarItem.show();
    const updateStatusBar = () => {
        statusBarItem.text = `$(clock) Coding Time: ${formatTime(codingSeconds)}`;
    };
    const resetDailyIfNeeded = () => {
        const currentDay = new Date().toDateString();
        if (currentDay !== today) {
            codingSeconds = 0;
            today = currentDay;
        }
    };
    const checkInactivity = () => {
        const now = Date.now();
        if (now - lastActivityTime >= idleThreshold * 1000) {
            stopTimer();
        }
    };
    const startTimer = () => {
        if (!timer) {
            timer = setInterval(() => {
                resetDailyIfNeeded();
                codingSeconds++;
                updateStatusBar();
                if (codingSeconds % 3600 === 0 &&
                    !context.globalState.get(notificationShownKey)) {
                    vscode.window.showInformationMessage("🎉 You've coded for 1 hour today!");
                    context.globalState.update(notificationShownKey, true);
                }
            }, 1000);
        }
    };
    const stopTimer = () => {
        if (timer) {
            clearInterval(timer);
            timer = undefined;
        }
    };
    const handleActivity = () => {
        lastActivityTime = Date.now();
        context.globalState.update(notificationShownKey, false);
        startTimer();
        if (inactivityTimeout) {
            clearTimeout(inactivityTimeout);
        }
        inactivityTimeout = setTimeout(checkInactivity, idleThreshold * 1000);
    };
    vscode.workspace.onDidChangeTextDocument(handleActivity);
    // Register a command to show sidebar report
    const provider = new ReportViewProvider(context);
    context.subscriptions.push(vscode.window.registerWebviewViewProvider("codingTimeTracker.reportView", provider));
    context.subscriptions.push(statusBarItem);
    context.subscriptions.push({
        dispose() {
            stopTimer();
            if (inactivityTimeout)
                clearTimeout(inactivityTimeout);
        },
    });
}
function formatTime(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return [h > 0 ? `${h}h` : "", m > 0 ? `${m}m` : "", `${s}s`]
        .filter(Boolean)
        .join(" ");
}
function deactivate() { }
class ReportViewProvider {
    constructor(context) {
        this.context = context;
    }
    resolveWebviewView(webviewView, context, token) {
        webviewView.webview.options = {
            enableScripts: true,
        };
        webviewView.webview.html = this.getHtml();
    }
    getHtml() {
        return `
      <html>
      <body>
        <h2>📊 Coding Time Report</h2>
        <p>Weekly and monthly views will be available in the next update.</p>
      </body>
      </html>
    `;
    }
}
