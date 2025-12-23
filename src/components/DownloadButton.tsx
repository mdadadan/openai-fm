"use client";

import { useState } from "react";
import { Download } from "./ui/Icons";
import { Button } from "./ui/Button";
import { appStore } from "@/lib/store";

export default function DownloadButton() {
  const [loading, setLoading] = useState(false);

  const handleDownload = () => {
    // ✅ PLAY が直前に作ったURL（=実際に再生した音）を使う
    const latestAudioUrl = appStore.getState().latestAudioUrl;

    // まだ再生してないなら何もしない
    if (!latestAudioUrl) return;

    const url = new URL(latestAudioUrl);
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
