"use client";

import React, { useState } from "react";
import { Download } from "./ui/Icons";
import { Button } from "./ui/Button";
import { appStore } from "@/lib/store";

export default function DownloadButton() {
  const [loading, setLoading] = useState(false);

  const handleDownload = () => {
    // ✅ 直前に PLAY で生成・再生した“同じ音”のURLを使う
    const { latestAudioUrl } = appStore.getState() as any;

    // まだ一度も再生していない場合は何もしない（必要ならアラートにしてもOK）
    if (!latestAudioUrl) return;

    const url = new URL(latestAudioUrl, window.location.origin);
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
