#include <QDebug>
#include <QGraphicsWebView>
#include <QWebFrame>
#include <QProcess>
#include <QFileDialog>

#include "bridge.h"

bool useStubs = false;

Bridge::Bridge(QWidget *parent) : Html5ApplicationViewer(parent) {
    QObject::connect(webView()->page()->mainFrame(),
                     SIGNAL(javaScriptWindowObjectCleared()), SLOT(addToJavaScript()));
}

void Bridge::addToJavaScript() {
    webView()->page()->mainFrame()->addToJavaScriptWindowObject("Bridge", this);
}

/* ======= Начало: работа с API библиотеки ======= */

QString scriptPath = "/home/zimy/Documents/HotProjects/RosaLinuxLocalizer/src/__init__.py";


QString Bridge::getTranslation(const QString &text) {
    qDebug() << "getTranslation: " << text;
    if (useStubs) { return text; }

    QString res = runPythonScript(scriptPath, "translate", text);
    return res;
}

QString Bridge::importPackages(const QString &jsonData) {
    qDebug() << "importPackages: " << jsonData;
    if (useStubs) { return jsonData; }

    QString res = runPythonScript(scriptPath, "import", jsonData);
    return res;
}

QString Bridge::getSettings() {
    qDebug() << "getSettings";
    if (useStubs) { return ""; }
    QString res = runPythonScript(scriptPath, "getSettings", "\"\"");
    return res;
}

QString Bridge::saveSettings(const QString &jsonData) {
    qDebug() << "saveSettings: " << jsonData;
    if (useStubs) { return jsonData; }

    QString res = runPythonScript(scriptPath, "saveSettings", jsonData);
    return res;
}

QString Bridge::saveTranslations(const QString &jsonData) {
    qDebug() << "saveTranslations: " << jsonData;
    if (useStubs) { return jsonData; }

    QString res = runPythonScript(scriptPath, "saveTranslations", jsonData);
    return res;
}

QString Bridge::runPythonScript(const QString &path, const QString &command, const QString &data) {
    QProcess p;
    QStringList params;

    params << path + " " << "{\"command\":\""+ command +"\", \"args\":"+ data +"}";
    qDebug() << "params: " << params;
    p.start("python3", params);
    p.waitForFinished(-1);

    QString p_stdout = p.readAll();
    return p_stdout;
}

/* ======= Конец: работа с API библиотеки ======= */

QStringList Bridge::openFiles(int mode) {
    qDebug() << "openFiles" << mode;
    QStringList res;
    switch (mode) {
        case 1: {//обычные .rpm-файлы
            QStringList fileNames = QFileDialog::getOpenFileNames(this, tr("Импорт файлов rpm..."),"",tr("RPM Files (*.mp3);;Any files (*.*)"));
            qDebug() << fileNames;
            res = fileNames;
            break;
        }
        case 2: {//директория
            //QFileDialog dialog;
            //dialog.setFileMode(QFileDialog::Directory);
            //dialog.setOption(QFileDialog::ShowDirsOnly);
            //QString dirName = dialog.getOpenFileName(this, tr("Выберите директорию..."),"",tr("(*.*)"));
            QString dirName = QFileDialog::getExistingDirectory(this, tr("Выберите директорию..."),
                                                     "",
                                                     QFileDialog::ShowDirsOnly
                                                     | QFileDialog::DontResolveSymlinks);
            qDebug() << dirName;
            res.append(dirName);
            break;
        }
        case 3: {//текстовый файл
            QString fileName = QFileDialog::getOpenFileName(this, tr("Открыть файл..."),"",tr("Yaml file (*.yaml);;Text files (*.txt);;Any files (*.*)"));
            qDebug() << fileName;
            res.append(fileName);
            break;
        }
    }

    return res;
}

























