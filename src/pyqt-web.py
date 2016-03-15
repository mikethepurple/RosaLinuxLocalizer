import json
import os
import sys
from PyQt4.QtGui import QApplication, QFileDialog
from PyQt4.QtCore import QUrl, QObject, pyqtSlot
from PyQt4.QtWebKit import QWebView, QWebInspector, QWebSettings
from handsome import full_project_info
from yaml_importer import from_file_with_list
from repo_handler import list_remote_repo, download_all_repo_files_to_temp, mirror_repo_to_tmp
from settings_keeper import load_settings, save_settings
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
        return json.dumps({"value": yandex_translate(yandex_api_key, "en-ru", text)})

    @pyqtSlot(str, result=str)
    def import_packages(self, json_data):
        data = json.loads(json_data)
        if data["type"] == "files":
            values = data["values"]
            print(values)
            print(type(values))
            return json.dumps({"packages": [full_project_info("import", f, ["Name", "Comment"]) for f in values]})
        elif data["type"] == "dir":
            values = data["values"]
            return json.dumps(
                {"packages": [full_project_info("import", f, ["Name", "Comment"]) for f in os.listdir(values) if
                              ".rpm" == f[-4:] and ".src.rpm" != f[-8:]]})
        elif data["type"] == "custom":
            with_list = from_file_with_list(data["values"])
            return json.dumps(
                {"packages": [full_project_info("import", f, ["Name", "Comment"]) for f in with_list if
                              ".rpm" == f[-4:]]})
        elif data["type"] == "repo":
            values_ = data["values"][0]
            files = mirror_repo_to_tmp(values_)
            f_ = {"packages": [full_project_info("import", f, ["Name", "Comment"]) for f in files if
                               ".rpm" == f[-4:] and ".src.rpm" != f[-8:]]}
            result = json.dumps(f_)
            return result

    @pyqtSlot(result=str)
    def get_settings(self):
        return load_settings()

    @pyqtSlot(str, result=str)
    def save_settings(self, settings):
        return save_settings(settings)

    @pyqtSlot(str)
    def commit_translations_patch(self, translations):
        pass

    @pyqtSlot(int, result=str)
    def open_files(self, mode):
        a = QFileDialog()
        if mode == 1:
            v = a.getOpenFileNames(caption="Импорт файлов rpm...", filter="RPM Files (*.rpm);;Any files (*.*)")
            return json.dumps(v)
        elif mode == 2:
            directory = a.getExistingDirectory(options=QFileDialog.ShowDirsOnly)
            return json.dumps(directory)
        elif mode == 3:
            return json.dumps(a.getOpenFileName())


if __name__ == '__main__':
    app = QApplication(sys.argv)
    view = Browser()
    view.page().mainFrame().addToJavaScriptWindowObject("Bridge", view)
    view.setWindowTitle("Handsome Localizer v1.0")
    view.load(QUrl("html/main.html"))
    view.setVisible(True)
    view.setMinimumWidth(787)
    view.setMinimumHeight(70)
    view.page().settings().setAttribute(QWebSettings.DeveloperExtrasEnabled, True)
    inspector = QWebInspector()
    inspector.setPage(view.page())
    inspector.setVisible(True)
    app.exec_()
