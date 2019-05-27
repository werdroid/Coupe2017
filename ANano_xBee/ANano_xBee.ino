/*!!!!!!!!!!!!!!
 !! ATTENTION !!
 !!!!!!!!!!!!!!!
 Choisir Type de Carte = Arduino Uno (et non Nano !)
 pour le téléversement !
 */
 

const uint8_t PIN_MOTOR = 2;
const uint8_t PIN_LED = 13;


void setup() {
  
  Serial.begin(9600);
  
  pinMode(PIN_LED, OUTPUT);    // sets the digital pin 13 as output
  pinMode(PIN_MOTOR, OUTPUT); 

  delay(200);
  
  digitalWrite(PIN_MOTOR, LOW);
  delay(200);
  
  //test_activer_experience();
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
      case '7':
        Serial.print('A');
        break;
      case '9':
        activer_experience();
        break;
    }
  }
}


void activer_experience() {
  Serial.print('!');
  digitalWrite(PIN_MOTOR, HIGH);
  delay(60000);
  digitalWrite(PIN_MOTOR, LOW);
  Serial.print('.');
}


void allumerLED(bool allumer) {
  if(allumer)
    digitalWrite(PIN_LED, HIGH);
  else
    digitalWrite(PIN_LED, LOW);
}

void test_activer_experience() {
  delay(1000);
  allumerLED(true);
  delay(200);
  allumerLED(false);
  delay(200);
  allumerLED(true);
  delay(200);
  allumerLED(false);
  delay(200);
  allumerLED(true);
  delay(200);
  allumerLED(false);
  delay(200);
  activer_experience();
}