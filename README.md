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
