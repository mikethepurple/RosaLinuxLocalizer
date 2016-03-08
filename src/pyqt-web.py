import json
import sys
from PyQt4.QtGui import QApplication, QFileDialog
from PyQt4.QtCore import QUrl, QObject, pyqtSlot
from PyQt4.QtWebKit import QWebView, QWebInspector, QWebSettings
from handsome import full_project_info
from translation import yandex_translate

# noinspection PyArgumentList
class Browser(QWebView):
    def __init__(self):
        QWebView.__init__(self)
        self.loadFinished.connect(self._result_available)

    def _result_available(self, ok):
        frame = self.page().mainFrame()
        print(frame.toHtml().encode('utf-8'))

    @pyqtSlot(str, result=str)
    def get_translation(self, text):
        yandex_api_key = "trnsl.1.1.20160131T164826Z.1cd5efb8cc6af7a6.0d34545e70be2a8bdd261d6cf743ae3df1429d13"
        return yandex_translate(yandex_api_key, "en-ru", text)


    @pyqtSlot(str, result=str)
    def import_packages(self, jsonData):
        data = json.loads(jsonData)
        if data["type"] == "files":
            values = data["values"]
            print(values)
            print(type(values))
            return json.dumps([full_project_info("import", f, ["Name", "Comment"]) for f in values])

    @pyqtSlot(result=str)
    def get_settings(self):
        pass

    @pyqtSlot(str)
    def save_settings(self, settings):
        pass

    @pyqtSlot(str)
    def save_translations(self, translations):
        pass

    @pyqtSlot(int, result=str)
    def open_files(self, mode):
        a = QFileDialog()
        if mode == 1:
            v = a.getOpenFileNames(caption="Импорт файлов rpm...", filter="RPM Files (*.rpm);;Any files (*.*)")
            return json.dumps(v)
        elif mode == 2:
            return a.getExistingDirectory(options=QFileDialog.ShowDirsOnly)
        elif mode == 3:
            return a.getOpenFileName()


if __name__ == '__main__':
    app = QApplication(sys.argv)
    view = Browser()
    view.page().mainFrame().addToJavaScriptWindowObject("Bridge", view)
    view.setWindowTitle("Handsome Localizer v1.0")
    view.load(QUrl("html/main.html"))
    view.setVisible(True)
    view.setMinimumWidth(768)
    view.setMinimumHeight(70)
    view.page().settings().setAttribute(QWebSettings.DeveloperExtrasEnabled, True)
    inspector = QWebInspector()
    inspector.setPage(view.page())
    inspector.setVisible(True)
    app.exec_()
