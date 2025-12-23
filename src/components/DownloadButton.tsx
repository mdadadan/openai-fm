"use client";

import React, { useState } from "react";
import { Download } from "./ui/Icons";
import { Button } from "./ui/Button";
import { appStore } from "@/lib/store";

const PlayingWaveform = ({
  // eslint / ts の unused 対策（使わないなら _ を付ける）
  _audioLoaded,
  amplitudeLevels,
}: {
  _audioLoaded: boolean;
  amplitudeLevels: number[];
}) => (
  <div className="w-[36px] h-[16px] relative left-[4px]">
    {amplitudeLevels.map((level, idx) => {
      const height = `${Math.min(Math.max(level * 30, 0.2), 1.9) * 100}%`;
      return (
        <div
          key={idx}
          className="absolute bottom-0 w-[4px] rounded-sm bg-current opacity-80"
          style={{
            left: `${idx * 6}px`,
            height,
          }}
        />
      );
    })}
  </div>
);

export default function DownloadButton({
  amplitudeLevels,
}: {
  amplitudeLevels: number[];
}) {
  const [loading, setLoading] = useState(false);

  const handleDownload = () => {
    const { selectedEntry, input, prompt, voice } = appStore.getState();

    const vibe =
      selectedEntry?.name?.toLowerCase().replace(/ /g, "-") ?? "audio";

    const url = new URL("/api/generate", window.location.origin);
    url.searchParams.set("input", input);
    url.searchParams.set("prompt", prompt);
    url.searchParams.set("voice", voice);
    url.searchParams.set("vibe", vibe);

    // crypto.randomUUID が環境で無いと落ちることがあるので安全に
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
      {loading ? (
        <PlayingWaveform
          _audioLoaded={false}
          amplitudeLevels={
            amplitudeLevels?.length
              ? amplitudeLevels
              : [0.04, 0.04, 0.04, 0.04, 0.04]
          }
        />
      ) : (
        <Download />
      )}
      <span className="uppercase hidden md:inline pr-3">Download</span>
    </Button>
  );
}
