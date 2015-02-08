#ifndef ADDEDITHOUSE_H
#define ADDEDITHOUSE_H

#include <QWidget>

namespace Ui {
class AddEditHouse;
}

class AddEditHouse : public QWidget
{
    Q_OBJECT

public:
    explicit AddEditHouse(QWidget *parent = 0);
    explicit AddEditHouse(const QString& name, const QString& host, const unsigned short houseCode1, const unsigned short houseCode2, QWidget *parent = 0);
    ~AddEditHouse();

signals:
    void finished(const QString& name, const QString& host, const unsigned short houseCode1, const unsigned short houseCode2);
    void cancelled();

private slots:
    void onOK();
    void onCancel();

private:
    Ui::AddEditHouse *ui;

    void setup();
    bool isValidURL(const QString& url);
};

#endif // ADDEDITHOUSE_H
