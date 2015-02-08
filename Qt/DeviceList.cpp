#include "DeviceList.h"
#include "ui_DeviceList.h"

DeviceList::DeviceList(const QString &name, const QString &host, const unsigned short houseCode1, const unsigned short houseCode2, QWidget *parent) :
    QWidget(parent),
    ui(new Ui::DeviceList),
    _houseName(name),
    _houseHost(host),
    _houseCode1(houseCode1),
    _houseCode2(houseCode2)
{
    setup();

    ui->houseNameLabel->setText(name);
    ui->houseHostLabel->setText(host);
    ui->houseCodeLabel->setText(QString().sprintf("%d %d", houseCode1, houseCode2));
}

DeviceList::~DeviceList()
{
    delete ui;
}

void DeviceList::setup()
{
    ui->setupUi(this);
}
