![image](https://github.com/user-attachments/assets/712fe52d-aa97-4563-a182-6d9866436fe2)


# 🐾 Projeto PetFeeder com Tasmota + A4988 + NEMA 17

Configuração para controlar um motor de passo NEMA 17 com driver A4988 usando Tasmota num ESP8266. Este guia baseia-se no esquema elétrico fornecido.

---

## 📌 Ligações entre ESP8266 e A4988

| Função     | Pino A4988 | GPIO ESP8266 | Tasmota Função | Observações                      |
|------------|------------|---------------|----------------|----------------------------------|
| **EN**     | 10         | GPIO12        | `Relay1i`      | Ativo em LOW (usar versão invertida) |
| **DIR**    | 20         | GPIO16        | `Relay3`       | Direção do motor                |
| **STEP**   | 17         | GPIO14        | `PWM1`         | Pulso para avanço               |
| **RST/SLP**| 15 / 16    | Ligados entre si | —            | Manter ligados a 3.3V para ativar |
| **MS1-3**  | 11-13      | GPIO15 / GPIO0 / GPIO2 | —    | Microstepping (ligar a 3.3V conforme necessário) |

---

## 🔘 Botão físico

- **GPIO5** ligado a um botão com pull-up → define como `Button1`

---

## 💡 LED indicador

- **GPIO13** → define como `Led1` ou `LedLink` (para estado de WiFi)

---

## ⚙️ Configuração recomendada no Tasmota

### Módulo
Selecionar: `Generic (18)`

### GPIO Mapping (via *Configure Module*)

| GPIO   | Função Tasmota |
|--------|----------------|
| GPIO5  | Button1        |
| GPIO12 | Relay1i        |
| GPIO13 | Led1           |
| GPIO14 | PWM1           |
| GPIO16 | Relay3         |
| Outros | None           |

---

## ⚡ Comandos para Console

```bash
SetOption80 1
ShutterMode 4
ShutterRelay1 1
ShutterFrequency 1000
```

## 🧪 Testes de Movimento
```bash
ShutterOpen1     # Roda o motor num sentido
ShutterClose1    # Roda no sentido inverso
ShutterStop1     # Para o movimento
```

Inverter direção (se necessário):
```bash
ShutterInvert1
```




✅ Notas
Usa Relay1i porque o EN do A4988 é ativo em LOW.

PWM1 é usado para STEP.

ShutterMode 4 é ideal para motores de passo (usa apenas STEP e DIR).




Na consola Tasmota:

bash
Copy
Edit
Backlog SetOption132 1; MqttFingerprint1 00; MqttFingerprint2 00; Restart 1
SetOption132 1 - muda de verificação por CA para fingerprint

00… faz o Tasmota aprender a fingerprint no 1.º “hello” TLS




Aqui tens os payloads de exemplo prontos a copiar-colar para o tópico petfeeder/command:

Acção	Payload “bonito”	Payload minificado (cabe bem nos 512 bytes)
Alimentar já	json { "command": "feed", "steps": 300, "speed": 800 }	{"command":"feed","steps":300,"speed":800}
Guardar 4 horários	json { "schedules": [ { "hour": 8, "minute": 0, "steps": 200, "speed": 1000 }, { "hour": 12, "minute": 30, "steps": 250, "speed": 900 }, { "hour": 17, "minute": 45, "steps": 300, "speed": 800 }, { "hour": 21, "minute": 15, "steps": 350, "speed": 700 } ] }	{"schedules":[{"hour":8,"minute":0,"steps":200,"speed":1000},{"hour":12,"minute":30,"steps":250,"speed":900},{"hour":17,"minute":45,"steps":300,"speed":800},{"hour":21,"minute":15,"steps":350,"speed":700}]}
Suspender agendamentos	json { "suspend": true }	{"suspend":true}
Retomar agendamentos	json { "resume": true }	{"resume":true}



{"schedules":[{"hour":8,"minute":0,"steps":200,"speed":1000},{"hour":12,"minute":30,"steps":250,"speed":900},{"hour":17,"minute":45,"steps":300,"speed":800},{"hour":21,"minute":15,"steps":350,"speed":700}]}


	{"suspend":true}
 	{"resume":true}

  {"command":"feed","steps":300,"speed":800}
