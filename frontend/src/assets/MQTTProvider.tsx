// File: src/assets/MQTTProvider.tsx
import { useEffect, useState } from "react";
import type { ReactNode, FC } from "react";
import type { MqttClient } from "mqtt";
import { MQTTContext } from "./MQTTContext";
// importa o UMD (vai estar em node_modules/mqtt/dist/mqtt.js)
import mqtt from "mqtt";

interface MQTTProviderProps {
  children: ReactNode;
}

const MQTTProvider: FC<MQTTProviderProps> = ({ children }) => {
  const [client, setClient] = useState<MqttClient | null>(null);

  useEffect(() => {
    const mqttClient: MqttClient = mqtt.connect("wss://ha86020d.ala.eu-central-1.emqxsl.com:8084/mqtt", {
      clientId: "mqttjs_" + Math.random().toString(16).substr(2, 8),
      clean: true,
      connectTimeout: 4000,
      username: "mrhormigo",
      password: "Hormigo23888",
    });

    mqttClient.on("connect", () => console.log("✅ Ligado ao EMQX"));
    mqttClient.on("error", (err) => console.error("❌ Erro MQTT:", err));

    setClient(mqttClient);
    return () => {
     mqttClient.end(true);
   };
  }, []);

  const publish = (topic: string, message: string) => {
    if (client) client.publish(topic, message);
    else console.warn("MQTT client não disponível");
  };

  return (
    <MQTTContext.Provider value={{ publish }}>
      {children}
    </MQTTContext.Provider>
  );
};

export default MQTTProvider;
