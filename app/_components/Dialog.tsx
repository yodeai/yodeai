"use client";
import { motion } from "framer-motion";
import * as ReactDialog from "@radix-ui/react-dialog";

interface DialogProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}
export default function Dialog({ open, onOpenChange, children }: DialogProps) {
  return (
    <ReactDialog.Root open={open} onOpenChange={onOpenChange}>
      {children}
    </ReactDialog.Root>
  );
}

export function Content({ children }: DialogProps) {
  return (
    <ReactDialog.Portal>
      <ReactDialog.Overlay className="fixed inset-0 bg-[#0003] flex items-center justify-center">
        <ReactDialog.Content asChild>
          <motion.div
            initial={{
              opacity: 0,
              translateY: 20,
              scale: 0.9,
            }}
            animate={{ opacity: 1, translateY: 0, scale: 1 }}
            className="relative max-h-[85vh] w-[90vw] max-w-[450px] rounded-lg bg-white overflow-hidden shadow-xl border"
          >
            {children}
          </motion.div>
        </ReactDialog.Content>
      </ReactDialog.Overlay>
    </ReactDialog.Portal>
  );
}

Dialog.Trigger = ReactDialog.Trigger;
Dialog.Content = Content;
Dialog.Title = ReactDialog.Title;
Dialog.Description = ReactDialog.Description;