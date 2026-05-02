const int pins[] = {A0, A1, A2, A3, A4, A5, A6, A7};
const int pinCount = sizeof(pins) / sizeof(pins[0]);

int prev[pinCount];
int noiseTollerance[pinCount];

int windowMs = 1000;
unsigned long windowStart = 0;
bool ignoreMode = false;

void setup()
{
    Serial.begin(57600);
    for (int i = 0; i < pinCount; i++)
    {
        prev[i] = 0;
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

        String rest = line.substring(2);

        if (key == 'I')
        {
            ignoreMode = rest.toInt() != 0;
            if (!ignoreMode) windowStart = 0;
            continue;
        }

        if (key == 'W')
        {
            windowMs = rest.toInt();
            continue;
        }

        if (key != 'N') continue;

        int colonIdx = rest.indexOf(':');
        if (colonIdx == -1)
        {
            int value = rest.toInt();
            for (int i = 0; i < pinCount; i++)
                noiseTollerance[i] = value;
        }
        else
        {
            int pin = rest.substring(0, colonIdx).toInt();
            int value = rest.substring(colonIdx + 1).toInt();
            if (pin >= 0 && pin < pinCount)
                noiseTollerance[pin] = value;
        }
    }
}

void loop()
{
    readCommands();

    unsigned long now = millis();

    if (windowStart > 0 && (now - windowStart >= (unsigned long)windowMs))
        windowStart = 0;

    // while ignoring or in post-hit window, keep prev updated to avoid false triggers on resume
    if (ignoreMode || windowStart > 0)
    {
        for (int i = 0; i < pinCount; i++)
            prev[i] = analogRead(pins[i]);
        return;
    }

    for (int i = 0; i < pinCount; i++)
    {
        int current = analogRead(pins[i]);

        if (abs(current - prev[i]) > noiseTollerance[i])
        {
            Serial.print(i);
            Serial.print(":");
            Serial.println(current);
            windowStart = now;
            prev[i] = current;
            return;
        }

        prev[i] = current;
    }
}
