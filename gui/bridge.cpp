#include <QDebug>
#include <QGraphicsWebView>
#include <QWebFrame>

#include "bridge.h"

Bridge::Bridge(QWidget *parent) : Html5ApplicationViewer(parent) {
    QObject::connect(webView()->page()->mainFrame(),
            SIGNAL(javaScriptWindowObjectCleared()), SLOT(addToJavaScript()));
}

void Bridge::addToJavaScript() {
    webView()->page()->mainFrame()->addToJavaScriptWindowObject("Bridge", this);
}

QString Bridge::getTranslation(const QString &text) {
    qDebug() << "from javascript " << text;
    return QString("Переведенный текст на русском!");
}

QString Bridge::getPackages() {
    qDebug() << "QString Bridge::getPackages() ";
    return QString("{\"packages\":[{\"rpm\":\"terminology-0.9.0-1-rosa2014.1.x86_64.rpm\",\"name\":\"terminology\",\"git\":\"https://abf.io/import/terminology.git\",\"desktop_location\":\"usr/share/applications/terminology.desktop\",\"strings_en\":[{\"Name\":\"Terminology\",\"Comment\":\"Terminal emulator\"}],\"strings_ru\":[{\"Name\":\"Терминология\",\"Comment\":\"Эмулятор терминала\"}],\"status\":\"4\"},{\"rpm\":\"pidgin-1.0-rosa2014.1.i586.rpm\",\"name\":\"pidgin\",\"git\":\"https://abf.io/import/pidgin.git\",\"desktop_location\":\"usr/share/applications/pidgin.desktop\",\"strings_en\":[{\"Name\":\"Pidgin\"}],\"status\":\"2\"}]}");
}




