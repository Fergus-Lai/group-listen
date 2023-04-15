import { AnimatePresence, motion } from "framer-motion";
import { useState, forwardRef, type ForwardedRef } from "react";

interface Props {
  messages: { name: string; message: string }[];
  submit: (message: string) => void;
  disabled: boolean;
}

const Chat: React.ForwardRefRenderFunction<HTMLDivElement, Props> = (
  { messages, submit, disabled },
  ref: ForwardedRef<HTMLDivElement>
) => {
  const [input, setInput] = useState("");
  return (
    <div className="flex h-96 w-full flex-col rounded-lg border border-slate-600">
      <div className="h-full flex-col overflow-y-scroll px-2 py-2" ref={ref}>
        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div
              className="flex-col text-slate-100"
              key={index}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 20, opacity: 0 }}
            >
              <div className="font-bold">{message.name}</div>
              <div>{message.message}</div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <div className="p-2 text-right text-slate-100">{input.length}/200</div>
      <input
        type="text"
        className="w-full bg-slate-600 p-2 text-slate-100"
        value={input}
        disabled={disabled}
        onChange={(e) => setInput(e.target.value)}
        maxLength={200}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            submit(input);
            setInput("");
          }
        }}
      />
    </div>
  );
};

export default forwardRef(Chat);
