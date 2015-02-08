#-------------------------------------------------
#
# Project created by QtCreator 2015-02-08T20:11:07
#
#-------------------------------------------------

QT       += core gui

QMAKE_CXXFLAGS += -std=c++11

greaterThan(QT_MAJOR_VERSION, 4): QT += widgets

TARGET = FS20
TEMPLATE = app


SOURCES += main.cpp\
        MainWindow.cpp \
    AddEditHouse.cpp \
    FS20.cpp \
    DeviceList.cpp

HEADERS  += MainWindow.h \
    AddEditHouse.h \
    FS20.h \
    DeviceList.h

FORMS    += MainWindow.ui \
    AddEditHouse.ui \
    DeviceList.ui
