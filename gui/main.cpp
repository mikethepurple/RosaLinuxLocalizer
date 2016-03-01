#include <QApplication>
#include <QGraphicsWebView>
#include <QWebInspector>
#include "html5applicationviewer.h"

#include "bridge.h"

int main(int argc, char *argv[])
{
    QApplication app(argc, argv);

    Bridge mainView;

    mainView.setOrientation(Html5ApplicationViewer::ScreenOrientationAuto);
    mainView.setMinimumHeight(768);
    mainView.setMinimumWidth(1024);
    mainView.setWindowTitle("Hansome Localizer v1.0");

    mainView.webView()->page()->settings()->setAttribute(QWebSettings::DeveloperExtrasEnabled, true);

    QWebInspector inspector;
    inspector.setPage(mainView.webView()->page());
    inspector.setVisible(true);


    mainView.showExpanded();
    mainView.loadFile(QLatin1String("html/main.html"));

    return app.exec();
}
