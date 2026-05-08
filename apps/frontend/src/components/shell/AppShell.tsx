"use client";

import { useSandpackStore } from "@/store/sandpackStore";
import Image from "next/image";
import { Eye, Code2, Settings, LogOut } from "lucide-react";
import { useRef, useState } from "react";
import { LayoutMode } from "@/types/components";
import { ChatPanel } from "./ChatPanel";
import { PreviewPanel } from "./PreviewPanel";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { viewMode, setViewMode } = useSandpackStore();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [layoutMode, setLayoutMode] = useState<LayoutMode>("split");
  const showSplit = () => setLayoutMode("split");
  const showPreviewOnly = () => setLayoutMode("preview-only");

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-gray-50">
      <header className="relative flex h-14 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 font-semibold text-gray-900">
            <div className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100">
              <Image
                src="/next.svg"
                alt="Logo"
                fill
                priority
                className="object-cover"
                sizes="32px"
              />
            </div>
            <span>CODE-AGENT</span>
          </div>
        </div>
        <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
          <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-100 p-1">
            <button
              onClick={() => setViewMode("preview")}
              className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
                viewMode === "preview"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Eye size={16} />
              预览
            </button>
            <button
              onClick={() => setViewMode("code")}
              className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
                viewMode === "code"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Code2 size={16} />
              代码
            </button>
          </div>
        </div>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-full shadow-sm transition-all hover:shadow-md active:scale-95"
          >
            <Image
              src="/next.svg"
              alt="User Avatar"
              fill
              unoptimized
              className="object-cover"
              sizes="32px"
            />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 origin-top-right animate-in fade-in zoom-in-95 duration-200 rounded-xl border border-gray-200 bg-white p-1 shadow-lg ring-1 ring-black/5 focus:outline-none z-50">
              <button
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                onClick={() => {
                  console.log("Settings clicked");
                  setIsDropdownOpen(false);
                }}
              >
                <Settings size={16} className="text-gray-500" />
                设置
              </button>
              <button
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                onClick={() => {
                  console.log("Logout clicked");
                  setIsDropdownOpen(false);
                }}
              >
                <LogOut size={16} />
                退出登录
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden gap-4 p-4">
        {/* 左侧 Chat 面板 */}
        <div
          className={`flex flex-col shrink-0 transition-all duration-300 ease-out ${
            layoutMode === "preview-only"
              ? "w-0 opacity-0 pointer-events-none"
              : "w-[400px] opacity-100"
          }`}
        >
          <div className="flex-1 min-h-0 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <ChatPanel />
          </div>
        </div>

        {/* 右侧 Preview 面板 */}
        <div className="flex-1 relative bg-gray-50 transition-all duration-300 ease-out">
          <PreviewPanel
            layoutMode={layoutMode}
            onExitFullScreen={showSplit}
            onEnterFullScreen={showPreviewOnly}
          >
            {children}
          </PreviewPanel>
        </div>
      </main>
    </div>
  );
}
