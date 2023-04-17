import { motion } from "framer-motion";

const Tab: React.FC<{
  tabs: string[];
  selectedTab: string;
  setSelectedTab: (item: string) => void;
}> = ({ tabs, selectedTab, setSelectedTab }) => {
  return (
    <ul className="flex w-full">
      {tabs.map((item) => (
        <li
          key={item}
          className={`relative flex h-20 w-full cursor-pointer items-center justify-center bg-slate-900 py-5 ${
            item === selectedTab ? "text-slate-100" : "text-slate-300"
          }`}
          onClick={() => setSelectedTab(item)}
        >
          {item}
          {item === selectedTab && (
            <motion.div
              className="absolute -bottom-[1px] h-[1px] w-full bg-slate-100 text-slate-100"
              layoutId="underline"
            />
          )}
        </li>
      ))}
    </ul>
  );
};

export default Tab;
