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
    qDebug() << "getTranslation: " << text;
    return QString("Переведенный текст на русском!");
}

QString Bridge::importPackages(const QString &jsonData) {
    qDebug() << "importPackages: " << jsonData;
    return QString("[{\"project_id\":91836,\"rpm\":\"terminology-0.9.0-1-rosa2014.1.x86_64.rpm\",\"package_name\":\"terminology\",\"git\":\"https://abf.io/import/terminology.git\",\"desktop_files\":[{\"path\":\"usr/share/applications/terminology.desktop\",\"strings\":[{\"variable_name\":\"Name\",\"value\":{\"en\":\"Terminology\",\"ru\":\"Терминология\"}},{\"variable_name\":\"Comment\",\"value\":{\"en\":\"Terminal emulator\",\"ru\":\"Эмулятор терминала\"}}]}],\"status\":\"4\"},{\"project_id\":378627,\"rpm\":\"pidgin-1.0-rosa2014.1.i586.rpm\",\"package_name\":\"pidgin\",\"git\":\"https://abf.io/import/pidgin.git\",\"desktop_files\":[{\"path\":\"usr/share/applications/pidgin.desktop\",\"strings\":[{\"variable_name\":\"Name\",\"value\":{\"en\":\"Pidgin\"}},{\"variable_name\":\"Comment\",\"value\":{\"en\":\"Another comment about this package.\"}}]},{\"path\":\"usr/share/desc/info.desktop\",\"strings\":[{\"variable_name\":\"Comment\",\"value\":{\"en\":\"Console application for educational purposes.\"}}]}],\"status\":\"2\"}]");
}



