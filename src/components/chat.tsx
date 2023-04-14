import { useState } from "react";

const Chat: React.FC<{
  messages: { name: string; message: string }[];
  submit: (message: string) => void;
  disabled: boolean;
}> = ({ messages, submit, disabled }) => {
  const [input, setInput] = useState("");
  return (
    <div className="flex h-96 w-full flex-col rounded-lg border border-slate-600">
      <div className="h-full flex-col overflow-y-scroll px-2 py-2">
        {messages.map((message, index) => (
          <div className="flex-col text-slate-100" key={index}>
            <div className="font-bold">{message.name}</div>
            <div>{message.message}</div>
          </div>
        ))}
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

export default Chat;
