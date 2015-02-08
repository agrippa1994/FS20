#include "MainWindow.h"
#include "ui_MainWindow.h"
#include "DeviceList.h"

MainWindow::MainWindow(QWidget *parent) :
    QMainWindow(parent),
    ui(new Ui::MainWindow)
{
    ui->setupUi(this);

    // Connect slots
    connectAllSlots();
}

MainWindow::~MainWindow()
{
    delete ui;
}

void MainWindow::onNew()
{
    if(_addEditHouse)
        return;

    _addEditHouse = std::make_shared<AddEditHouse>();
    QObject::connect(_addEditHouse.get(), SIGNAL(cancelled()), this, SLOT(onAddEditHouseCancel()));
    QObject::connect(_addEditHouse.get(), SIGNAL(finished(QString,QString,unsigned short,unsigned short)), this, SLOT(onAddEditHouseSave(QString,QString,unsigned short,unsigned short)));
    _addEditHouse->show();
}

void MainWindow::onOpen()
{

}

void MainWindow::onSave()
{

}

void MainWindow::onSaveAs()
{

}

void MainWindow::onAddEditHouseCancel()
{
    if(!_addEditHouse)
        return;

    _addEditHouse->close();
    _addEditHouse.reset();
}

void MainWindow::onAddEditHouseSave(const QString &name, const QString &host, const unsigned short houseCode1, const unsigned short houseCode2)
{
    if(!_addEditHouse)
        return;

    auto deviceList = new DeviceList(name, host, houseCode1, houseCode2);
    deviceList->setWindowTitle(name);

    ui->mdiArea->addSubWindow(deviceList);
    deviceList->show();

    _addEditHouse->close();
    _addEditHouse.reset();
}

void MainWindow::connectAllSlots()
{
    QObject::connect(ui->actionNew, SIGNAL(triggered()), SLOT(onNew()));
    QObject::connect(ui->actionOpen, SIGNAL(triggered()), SLOT(onOpen()));
    QObject::connect(ui->actionSave, SIGNAL(triggered()), SLOT(onSave()));
    QObject::connect(ui->actionSave_as, SIGNAL(triggered()), SLOT(onSaveAs()));
}
