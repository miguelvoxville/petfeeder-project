![image](https://github.com/user-attachments/assets/712fe52d-aa97-4563-a182-6d9866436fe2)


📦 Botão físico
O teu botão está ligado a GPIO5 → define como Button1

Tens pull-up interno ativo via resistor → configuração correta para Tasmota.

💡 LED indicador
LED ligado a GPIO13 → define como Led1 (ou LedLink se quiseres feedback de WiFi)

🛠️ Configuração sugerida no Tasmota
📍 Módulo
Seleciona Module Type: Generic (18)

  📍 GPIO Mapping (via Configure Module)
  GPIO	Tasmota Function
  GPIO5	Button1
  GPIO12	Relay1i
  GPIO13	Led1
  GPIO14	PWM1
  GPIO16	Relay3
  Outros	None
