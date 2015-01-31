#include <SoftwareSerial.h>

#define RX_PIN 10
#define TX_PIN 11

SoftwareSerial SerialFS20(RX_PIN, TX_PIN);

void setup() {
	Serial.begin(38400);
	SerialFS20.begin(38400);
}

void serialEvent() {
	SerialFS20.write(Serial.read());
}

void loop() {
	int i = SerialFS20.read();
	if(i != -1) {
		Serial.write(i & 0xFF);
	}
}