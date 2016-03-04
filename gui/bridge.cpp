#include <QDebug>
#include <QGraphicsWebView>
#include <QWebFrame>
#include <QProcess>

#include "bridge.h"

Bridge::Bridge(QWidget *parent) : Html5ApplicationViewer(parent) {
    QObject::connect(webView()->page()->mainFrame(),
                     SIGNAL(javaScriptWindowObjectCleared()), SLOT(addToJavaScript()));
}

void Bridge::addToJavaScript() {
    webView()->page()->mainFrame()->addToJavaScriptWindowObject("Bridge", this);
}


QString scriptPath = "/home/zimy/Documents/HotProjects/RosaLinuxLocalizer/src/__init__.py";


QString Bridge::getTranslation(const QString &text) {
    qDebug() << "getTranslation: " << text;
    QString res = runPythonScript(scriptPath, "translate", text);
    return res;
}

QString Bridge::importPackages(const QString &jsonData) {
    qDebug() << "importPackages: " << jsonData;
    QString res = runPythonScript(scriptPath, "import", jsonData);
    return res;
}

QString Bridge::getSettings() {
    qDebug() << "getSettings";
    QString res = runPythonScript(scriptPath, "getSettings", "\"\"");
    return res;
}

QString Bridge::saveSettings(const QString &jsonData) {
    qDebug() << "saveSettings: " << jsonData;
    QString res = runPythonScript(scriptPath, "saveSettings", jsonData);
    return res;
}

QString Bridge::runPythonScript(const QString &path, const QString &command, const QString &data) {
    QProcess p;
    QStringList params;

    params << path + " " << " {\"command\":\""+ command +"\", \"args\":"+ data +"}";
    p.start("python3", params);
    p.waitForFinished(-1);

    QString p_stdout = p.readAll();
    return p_stdout;
}

