import { createContext, useContext } from "react";

export const MQTTContext = createContext<{
  publish: (topic: string, message: string) => void;
}>({
  publish: () => {},
});

export const useMQTT = () => useContext(MQTTContext);
