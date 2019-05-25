/***
  Programme basique pour tester et paramétrer les positions des Servo
****/


#include <Servo.h>


Servo myServoA;  
Servo myServoB;  
Servo myServoC;  
int pos;    // variable to store the servo position
char c;

void setup() {
  Serial.begin(9600);
  
  myServoA.attach(10);
  //myServoB.attach(30);
  //myServoC.attach(31);
}


void loop() {
  if(Serial.available() > 0) {
     c = Serial.read();
     
     if(c == 'A') {
       pos = Serial.parseInt();
       if(pos >= 0 && pos <= 180) {
         myServoA.write(pos);
         Serial.print("Position A : ");
         Serial.println(pos);
       }
       else {
         Serial.print("Position A incorrecte : ");
         Serial.println(pos);  
       }
     }
     else if(c == 'B') {
       pos = Serial.parseInt();
       if(pos >= 0 && pos <= 180) {
         myServoB.write(pos);
         Serial.print("Position B : ");
         Serial.println(pos);
       }
       else {
         Serial.print("Position B incorrecte : ");
         Serial.println(pos);  
       }
     }/*
     else if(c == 'C') {
       pos = Serial.parseInt();
       if(pos >= 0 && pos <= 180) {
         myServoC.write(pos);
         Serial.print("Position C : ");
         Serial.println(pos);
       }
       else {
         Serial.print("Position C incorrecte : ");
         Serial.println(pos);  
       }
     }*/
     /*else {
       Serial.println("Identifiant incorrect");
     }*/
  }
}
