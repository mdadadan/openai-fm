"use client";

import React, { useState } from "react";
import { Download } from "./ui/Icons";
import { Button } from "./ui/Button";
import { appStore } from "@/lib/store";

export default function DownloadButton() {
  const [loading, setLoading] = useState(false);

  const handleDownload = () => {
    const { selectedEntry, input, prompt, voice } = appStore.getState();

    const vibe =
      selectedEntry?.name?.toLowerCase().replace(/ /g, "-") ?? "audio";

    // ✅ /api/generate を “そのまま開く” + download=1
    //    → ブラウザ標準の保存ダイアログが出る（Blob/ServiceWorker不要）
    const url = new URL("/api/generate", window.location.origin);
    url.searchParams.set("input", input);
    url.searchParams.set("prompt", prompt);
    url.searchParams.set("voice", voice);
    url.searchParams.set("vibe", vibe);

    // generation はキャッシュ回避用（無くても動くけど、付けると安定）
    const gen =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    url.searchParams.set("generation", gen);

    url.searchParams.set("download", "1");

    setLoading(true);
    window.location.href = url.toString();
    setTimeout(() => setLoading(false), 800);
  };

  return (
    <Button color="tertiary" onClick={handleDownload} disabled={loading}>
      <Download />
      <span className="uppercase hidden md:inline pr-3">
        {loading ? "Preparing..." : "Download"}
      </span>
    </Button>
  );
}
