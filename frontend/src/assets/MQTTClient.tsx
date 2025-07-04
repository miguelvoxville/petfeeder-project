import { useEffect, useRef, useState } from "react";
import mqtt from "mqtt";

export default function MQTTClient() {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);
  const clientRef = useRef<mqtt.MqttClient | null>(null);

  useEffect(() => {
    const clientId = "webapp_" + Math.random().toString(16).substr(2, 8);
    const host = "wss://ha86020d.ala.eu-central-1.emqxsl.com:8084/mqtt";

    const options: mqtt.IClientOptions = {
      clientId,
      username: "cd95199d", // ← App ID
      password: "W*mY6bGmUJimi2mI", // ← App Secret
      reconnectPeriod: 1000,
      connectTimeout: 30 * 1000,
      clean: true,
    };

    const client = mqtt.connect(host, options);
    clientRef.current = client;

    client.on("connect", () => {
      setIsConnected(true);
      console.log("🟢 Ligado ao broker MQTT");

      client.subscribe("petfeeder/command", (err) => {
        if (!err) console.log("📡 Subscreveste ao tópico petfeeder/command");
      });
    });

    client.on("error", (err) => {
      console.error("❌ Erro na ligação:", err);
      client.end();
    });

    client.on("message", (topic, message) => {
      console.log(`📥 ${topic}: ${message.toString()}`);
      setMessages((prev) => [...prev, `${topic}: ${message.toString()}`]);
    });

    return () => {
      client.end();
    };
  }, []);

  const enviarSuspender = () => {
    if (clientRef.current) {
      clientRef.current.publish("petfeeder/command", JSON.stringify({ suspend: true }));
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Estado da ligação: {isConnected ? "🟢 Ligado" : "🔴 Desligado"}</h2>
      <button onClick={enviarSuspender}>Suspender Funcionamento</button>

      <h3>Mensagens Recebidas:</h3>
      <ul>
        {messages.map((msg, i) => (
          <li key={i}>{msg}</li>
        ))}
      </ul>
    </div>
  );
}
