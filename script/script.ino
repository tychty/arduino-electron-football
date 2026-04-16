const int pins[] = {A0};
const int pinCount = sizeof(pins) / sizeof(pins[0]);

int prev[pinCount];
int peak[pinCount];
unsigned long lastActivity[pinCount];

int debounceMs[pinCount];
int noiseTollerance[pinCount];

void setup()
{
    Serial.begin(57600);
    for (int i = 0; i < pinCount; i++)
    {
        prev[i] = 0;
        peak[i] = 0;
        lastActivity[i] = 0;
        debounceMs[i] = 200;
        noiseTollerance[i] = 5;
    }
}

void readCommands()
{
    while (Serial.available() > 0)
    {
        String line = Serial.readStringUntil('\n');
        line.trim();
        if (line.length() < 3) continue;

        char key = line.charAt(0);
        if (line.charAt(1) != ':') continue;
        if (key != 'D' && key != 'N') continue;

        String rest = line.substring(2);
        int colonIdx = rest.indexOf(':');

        if (colonIdx == -1)
        {
            // global: D:200 or N:5
            int value = rest.toInt();
            for (int i = 0; i < pinCount; i++)
            {
                if (key == 'D') debounceMs[i] = value;
                else noiseTollerance[i] = value;
            }
        }
        else
        {
            // per-pin: D:0:200 or N:0:5
            int pin = rest.substring(0, colonIdx).toInt();
            int value = rest.substring(colonIdx + 1).toInt();
            if (pin >= 0 && pin < pinCount)
            {
                if (key == 'D') debounceMs[pin] = value;
                else noiseTollerance[pin] = value;
            }
        }
    }
}

void loop()
{
    readCommands();

    unsigned long now = millis();

    for (int i = 0; i < pinCount; i++)
    {
        int current = analogRead(pins[i]);

        // detect meaningful change above noise floor
        if (abs(current - prev[i]) > noiseTollerance[i])
        {
            // only extend debounce window when a new peak is found
            if (current > peak[i])
            {
                peak[i] = current;
                lastActivity[i] = now;
            }
        }

        // signal has been quiet long enough → finalize peak
        if (peak[i] > 0 && (now - lastActivity[i] > (unsigned long)debounceMs[i]))
        {
            Serial.print(i);
            Serial.print(":");
            Serial.println(peak[i]);

            peak[i] = 0;
        }

        prev[i] = current;
    }
}
