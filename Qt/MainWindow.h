#ifndef MAINWINDOW_H
#define MAINWINDOW_H

#include "AddEditHouse.h"
#include <QMainWindow>
#include <memory>

namespace Ui {
class MainWindow;
}

class MainWindow : public QMainWindow
{
    Q_OBJECT

public:
    explicit MainWindow(QWidget *parent = 0);
    ~MainWindow();

private slots:
    // Menubar slots
    void onNew();
    void onOpen();
    void onSave();
    void onSaveAs();

    // AddEditHouse slots
    void onAddEditHouseCancel();
    void onAddEditHouseSave(const QString& name, const QString& host,
                            const unsigned short houseCode1, const unsigned short houseCode2
                            );

private:
    Ui::MainWindow *ui;
    std::shared_ptr<AddEditHouse> _addEditHouse;

    void connectAllSlots();
};

#endif // MAINWINDOW_H
