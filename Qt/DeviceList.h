#ifndef DEVICELIST_H
#define DEVICELIST_H

#include <QWidget>

namespace Ui {
class DeviceList;
}

class DeviceList : public QWidget
{
    Q_OBJECT

public:
    explicit DeviceList(const QString& name, const QString& host, const unsigned short houseCode1, const unsigned short houseCode2, QWidget *parent = 0);

    ~DeviceList();

private:
    Ui::DeviceList *ui;
    QString _houseName;
    QString _houseHost;
    unsigned short _houseCode1;
    unsigned short _houseCode2;

    void setup();
};

#endif // DEVICELIST_H
