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
const vscode = __importStar(require("vscode"));
class CodingTimeTracker {
    constructor() {
        this.codingSeconds = 0;
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
        this.statusBarItem.text = `$(clock) Coding Time: 0s`;
        // Text color দিয়ে ব্যাকগ্রাউন্ডের মতো ইফেক্ট দিতে পারি (উদাহরণ: লাল)
        this.statusBarItem.color = "#FFFFFF"; // Text color (সাদা)
        // Note: VS Code doesn’t support direct background color for status bar items.
        // তোমার থিম অনুযায়ী রং পরিবর্তন করতে পারো।
        this.statusBarItem.backgroundColor = new vscode.ThemeColor("statusBarItem.errorBackground");
        // এই লাইন VS Code 1.64+ থেকে ব্যাকগ্রাউন্ড কাস্টমাইজেশন সাপোর্ট করে, চাইলে ব্যবহার করো।
        this.statusBarItem.show();
        vscode.workspace.onDidChangeTextDocument(() => this.onUserActivity());
    }
    onUserActivity() {
        if (!this.timer) {
            this.startTimer();
        }
        this.resetInactivityTimeout();
    }
    startTimer() {
        this.timer = setInterval(() => {
            this.codingSeconds++;
            this.statusBarItem.text = `$(clock) Coding Time: ${this.formatTime(this.codingSeconds)}`;
        }, 1000);
    }
    resetInactivityTimeout() {
        if (this.inactivityTimeout) {
            clearTimeout(this.inactivityTimeout);
        }
        this.inactivityTimeout = setTimeout(() => {
            this.stopTimer();
        }, 60000); // 60 seconds inactivity
    }
    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = undefined;
        }
    }
    dispose() {
        this.statusBarItem.dispose();
        this.stopTimer();
        if (this.inactivityTimeout) {
            clearTimeout(this.inactivityTimeout);
        }
    }
    formatTime(seconds) {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        if (h > 0)
            return `${h}h ${m}m ${s}s`;
        if (m > 0)
            return `${m}m ${s}s`;
        return `${s}s`;
    }
    // Optional: Getters for external use (e.g., commands)
    getCodingSeconds() {
        return this.codingSeconds;
    }
}
function activate(context) {
    const tracker = new CodingTimeTracker();
    context.subscriptions.push(tracker);
}
function deactivate() { }
