"use client";

import { useAtom } from "jotai";
import { windowsAtom } from "@/store/atoms";
import { Window } from "./Window";

export function WindowManager() {
  const [windows] = useAtom(windowsAtom);

  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      {windows.map((windowState) => (
        <div key={windowState.id} className="pointer-events-auto">
            <Window windowState={windowState} />
        </div>
      ))}
    </div>
  );
}
