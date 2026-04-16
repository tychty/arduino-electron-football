const int pins[] = {A0};
const int pinCount = sizeof(pins) / sizeof(pins[0]);

int prev[pinCount];
int peak[pinCount];
unsigned long lastActivity[pinCount];

int debounceMs = 200;
int noiseTollerance = 5;

void setup()
{
    Serial.begin(57600);
    for (int i = 0; i < pinCount; i++)
    {
        prev[i] = 0;
        peak[i] = 0;
        lastActivity[i] = 0;
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
        int value = line.substring(2).toInt();

        if (key == 'D') debounceMs = value;
        else if (key == 'N') noiseTollerance = value;
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
        if (abs(current - prev[i]) > noiseTollerance)
        {
            // only extend debounce window when a new peak is found
            if (current > peak[i])
            {
                peak[i] = current;
                lastActivity[i] = now;
            }
        }

        // signal has been quiet long enough → finalize peak
        if (peak[i] > 0 && (now - lastActivity[i] > (unsigned long)debounceMs))
        {
            Serial.print(i);
            Serial.print(":");
            Serial.println(peak[i]);

            peak[i] = 0;
        }

        prev[i] = current;
    }
}
