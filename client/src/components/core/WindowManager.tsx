import { useAtom } from "jotai";
import { windowsAtom } from "@/store/atoms";
import { Window } from "./Window";
import { AnimatePresence, motion } from "framer-motion";

export function WindowManager() {
  const [windows] = useAtom(windowsAtom);

  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      <AnimatePresence>
        {windows.map((windowState) => (
          <motion.div
            key={windowState.id}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-auto absolute inset-0"
          >
            <Window windowState={windowState} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
