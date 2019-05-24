

const uint8_t PIN_MOTOR = 2;
const uint8_t PIN_LED = 13;


void setup() {
  
  Serial.begin(9600);
  
  pinMode(PIN_LED, OUTPUT);    // sets the digital pin 13 as output

  delay(200);
}

void loop() {
  char c;
  
  
  if(Serial.available() > 0) {
    c = Serial.read();
    switch(c) {
      case '1':
        allumerLED(true);
        break;
      case '0':
        allumerLED(false);
        break;
      case '9':
        Serial.print('A');
        break;
    }
  }
}


void activer_experience() {
  digitalWrite(PIN_MOTOR, HIGH);
  delay(3000);
  digitalWrite(PIN_MOTOR, LOW);
}


void allumerLED(bool allumer) {
  if(allumer)
    digitalWrite(PIN_LED, HIGH);
  else
    digitalWrite(PIN_LED, LOW);
}