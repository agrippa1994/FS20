#include "AddEditHouse.h"
#include "FS20.h"
#include "ui_AddEditHouse.h"

#include <QUrl>
#include <QMessageBox>

AddEditHouse::AddEditHouse(QWidget *parent) :
    QWidget(parent),
    ui(new Ui::AddEditHouse)
{
    setup();
}

AddEditHouse::AddEditHouse(const QString &name, const QString &host, const unsigned short houseCode1, const unsigned short houseCode2, QWidget *parent) :
    QWidget(parent),
    ui(new Ui::AddEditHouse)
{
    setup();

    ui->nameLineEdit->setText(name);
    ui->hostLineEdit->setText(host);
    ui->houseCode1LineEdit->setText(QString().sprintf("%d", houseCode1));
    ui->houseCode2LineEdit->setText(QString().sprintf("%d", houseCode2));
}

AddEditHouse::~AddEditHouse()
{
    delete ui;
}

void AddEditHouse::onOK()
{
    auto name = ui->nameLineEdit->text();
    auto host = ui->hostLineEdit->text();
    auto hc1 = ui->houseCode1LineEdit->text();
    auto hc2 = ui->houseCode2LineEdit->text();

    if(name.isEmpty() || host.isEmpty() || hc1.isEmpty() || hc2.isEmpty()) {
        QMessageBox::warning(this, "Warning", "One or more of the entered data is empty", "OK");
        return;
    }

    if(!isValidHouseOrAddressCode(hc1) || !isValidHouseOrAddressCode(hc2))
    {
        QMessageBox::warning(this, "Warning", "One or more of the entered house codes is invalid!", "OK");
        return;
    }

    if(!isValidURL(host))
    {
        QMessageBox::warning(this, "Warning", "The entered host isn't a valid URL!", "OK");
        return;
    }

    emit finished(name, host, hc1.toInt(), hc2.toInt());
}

void AddEditHouse::onCancel()
{
    emit cancelled();
}

void AddEditHouse::setup()
{
    ui->setupUi(this);

    QObject::connect(ui->okButton, SIGNAL(clicked()), SLOT(onOK()));
    QObject::connect(ui->cancelButton, SIGNAL(clicked()), SLOT(onCancel()));
}

bool AddEditHouse::isValidURL(const QString &url)
{
    QUrl u(url, QUrl::StrictMode);
    return u.isValid();
}
