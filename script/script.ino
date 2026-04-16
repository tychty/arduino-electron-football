const int pin = A0;

int prev = 0;
int peak = 0;

unsigned long lastActivity = 0;
const int debounceMs = 200;
const int noiseTollerance = 5;

void setup()
{
    Serial.begin(9600);
}

void loop()
{
    int current = analogRead(pin);
    unsigned long now = millis();

    // detect meaningful change (signal active)
    if (abs(current - prev) > noiseTollerance)
    {
        lastActivity = now;

        if (current > peak)
        {
            peak = current;
        }
    }

    // if signal has been quiet long enough → finalize peak
    if (peak > 0 && (now - lastActivity > debounceMs))
    {
        Serial.print("peak: ");
        Serial.println(peak);

        peak = 0;
    }

    prev = current;
}