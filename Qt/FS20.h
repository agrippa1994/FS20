#ifndef FS20_H
#define FS20_H

#include <QString>

bool isValidHouseOrAddressCode(const QString& code);
bool isValidHouseOrAddressCode(const int& code);

// Returns -1 if the convertion failed otherwise a value between 0 and 255
int convertHouseOrAddressCodeToHex(const QString& code);
int convertHouseOrAddressCodeToHex(const int& code);

#endif // FS20_H

