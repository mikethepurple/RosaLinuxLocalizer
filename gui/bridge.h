#ifndef BRIGE_H
#define BRIGE_H

#include "html5applicationviewer/html5applicationviewer.h"

class Bridge : public Html5ApplicationViewer
{
    Q_OBJECT

    public:
        explicit Bridge(QWidget *parent=0);
    private slots:
        void addToJavaScript();
    public slots:
        QString getTranslation(const QString &text);
        QString importPackages(const QString &jsonData);
};

#endif // BRIGE_H
