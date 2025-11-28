"use client";

import { useEffect, useState } from "react";
import { useAtom } from "jotai";
import { bootCompleteAtom } from "@/store/atoms";
import { AnimatePresence, motion } from "framer-motion";

export function BootAnimation() {
  const [bootComplete, setBootComplete] = useAtom(bootCompleteAtom);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    if (bootComplete) return;

    const bootSequence = [
      "Booting AnuragOS...",
      "Loading modules: MERN, AI/ML, DSA...",
      "Initializing UI...",
      "System Ready.",
    ];

    let delay = 0;
    const timeouts: NodeJS.Timeout[] = [];

    bootSequence.forEach((log, index) => {
      delay += Math.random() * 800 + 500;
      const timeout = setTimeout(() => {
        setLogs((prev) => [...prev, log]);
        if (index === bootSequence.length - 1) {
          const finalTimeout = setTimeout(() => setBootComplete(true), 1000);
          timeouts.push(finalTimeout);
        }
      }, delay);
      timeouts.push(timeout);
    });

    return () => timeouts.forEach(clearTimeout);
  }, [bootComplete, setBootComplete]);

  return (
    <AnimatePresence>
      {!bootComplete && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-50 bg-black text-green-500 font-mono p-8 flex flex-col justify-end"
        >
          {logs.map((log, i) => (
            <div key={i}>{log}</div>
          ))}
          <div className="mt-4 animate-pulse">_</div>
          <button
            onClick={() => setBootComplete(true)}
            className="absolute top-4 right-4 text-xs text-zinc-500 hover:text-zinc-300 border border-zinc-800 px-2 py-1 rounded cursor-pointer"
          >
            SKIP BOOT
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
