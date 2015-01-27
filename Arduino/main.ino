// aJson is a required library for JSON encoding and decoding
// You can find the repository here: https://github.com/interactive-matter/aJson
#include <aJSON.h>
#include <SoftwareSerial.h>

#define MSG_INITIALIZER 0
#define MSG_FS20 1

#define SENDER_ALL -1

#define RX_PIN 10
#define TX_PIN 11

#define TIMEOUT 1000

SoftwareSerial fs_serial(RX_PIN, TX_PIN);
aJsonStream serial_stream(&Serial);

bool initialized = false;

void initialize_serial();
void writeFS20(const int sender, const int bytes[4]);

void setup() {
	initialized = false;

	Serial.begin(115200);
	fs_serial.begin(9600);

	while(!Serial);

	initialize_serial();
}

void onMessage(int sender, int message_id, aJsonObject *params)
{
	if (message_id == MSG_INITIALIZER)
	{
		initialized = true;
		return;
	}

	if(message_id == MSG_FS20)
	{
		if(aJson.getArraySize(params) <= 0)
			return;

		// Write data to the fs20 modul
		for(int i = 0; i < aJson.getArraySize(params); i++)
		{
			aJsonObject *val = aJson.getArrayItem(params, i);

			if(val == NULL)
				return;

			if(val->type != aJson_Int)
				return;

			fs_serial.write(val->valueint);
		}

		// Read fs20 data
		int readCount = 0;
		int readBytes[4];
		int startTime = millis();

		memset(readBytes, -1, sizeof(readBytes));

		while(readCount < 4)
		{
			if((startTime + TIMEOUT) < millis())
				break;

			int readByte = fs_serial.read();
			if(readByte == -1)
				continue;

			// Check if the FS20 module is sending unreadable data
			if(readByte != 0x2 && (readCount == 0 || readCount == 1))
				continue;

			readBytes[readCount++] = readByte;
		}

		writeFS20(sender, readBytes);
	}
}

void onJSON(aJsonObject *msg)
{
	aJsonObject *sender = aJson.getObjectItem(msg, "sender");
	aJsonObject *id = aJson.getObjectItem(msg, "id");
	aJsonObject *params = aJson.getObjectItem(msg, "params");

	if(sender == 0 || id == 0 || params == 0)
		return;

	if(sender->type != aJson_Int || id->type != aJson_Int || params->type != aJson_Array)
		return;

	onMessage(sender->valueint, id->valueint, params);
}

void initialize_serial()
{
	aJsonObject *root = aJson.createObject();
	if(root == NULL)
		return;

	aJson.addNumberToObject(root, "sender", SENDER_ALL);
	aJson.addNumberToObject(root, "id", MSG_INITIALIZER);

	aJsonObject *array = aJson.createArray();

	aJson.addItemToObject(root, "params", array);

	serial_stream.printObject(root);
	Serial.println();

	aJson.deleteItem(root);
}

void writeFS20(const int sender, const int *bytes)
{
	if(bytes == NULL)
		return;

	aJsonObject *root = aJson.createObject();

	if(root == NULL)
		return;

	aJson.addNumberToObject(root, "sender", sender);
	aJson.addNumberToObject(root, "id", MSG_FS20);

	aJsonObject *array = aJson.createArray();

	for(int i = 0; i < 4; i++)
		aJson.addItemToArray(array, aJson.createItem(bytes[i]));

	aJson.addItemToObject(root, "params", array);

	serial_stream.printObject(root);
	Serial.println();

	aJson.deleteItem(root);
}

void serialEvent()
{
	if (serial_stream.available())
		serial_stream.skip();

	if (serial_stream.available()) {
		aJsonObject *msg = aJson.parse(&serial_stream);

		if(msg) {
			onJSON(msg);
		}

		aJson.deleteItem(msg);
	}
}

void loop() { }