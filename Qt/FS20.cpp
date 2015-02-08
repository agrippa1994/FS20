#include "FS20.h"

bool isValidHouseOrAddressCode(const QString &code)
{
    bool valid = false;
    int c = code.toInt(&valid);

    return valid ? isValidHouseOrAddressCode(c) : false;
}


bool isValidHouseOrAddressCode(const int &code)
{
    if(code < 1111 || code > 4444)
        return false;

    int c = code;
    for(int i = 1; i <= 4; i++, c /= 10) {
        if(c % 10 < 1 || c % 10 > 4)
            return false;
    }

    return true;
}


int convertHouseOrAddressCodeToHex(const QString &code)
{
    bool valid = false;
    int c = code.toInt(&valid);

    return valid ? convertHouseOrAddressCodeToHex(c) : false;
}


int convertHouseOrAddressCodeToHex(const int &code)
{
    if(!isValidHouseOrAddressCode(code))
        return -1;

    for(int i = 1111, hexValue = 0x0; i <= 4444; i++) {
        if(!isValidHouseOrAddressCode(i))
            continue;

        if(hexValue == i)
            return hexValue;

        hexValue ++;
    }

    return -1;
}
