# inner = sys.stdin.read()
import json

from gitworks import commit_patch
from handsome import full_project_info
from list_utils import filter_input
from translation import yandex_translate

# 3 из репозитория.
# TZ 4.1.3
# Про архитектуру: модули и инструкции по расширению каждого модуля.


project_group = "import"
inner = "terminology-0.9.0-1-rosa2014.1.x86_64.rpm"
yandex_api_key = "trnsl.1.1.20160131T164826Z.1cd5efb8cc6af7a6.0d34545e70be2a8bdd261d6cf743ae3df1429d13"

assert yandex_translate(yandex_api_key, "en-ru",
                        "Lazy cat jumps over talking dog") == "Ленивый кот перепрыгивает через говорящая собака"

project_info = [full_project_info(project_group, f, ["Name", "Comment"]) for f in filter_input(inner)]
print(json.dumps(project_info))
translated_files = ""

for one in project_info:
    for f in one["desktop_files"]:
        print(str(f["path"]))
        translated_files = translated_files + f["path"] + "\n"
        for i in f["strings"]:
            translated = str(
                i["variable_name"] + "[translated_ru]=" + yandex_translate(yandex_api_key, "en-ru", i["value"]["en"]))
            translated_files = translated_files + translated + "\n"
            print(translated)

commit_patch(project_info[0]["git"], project_info[0]["package_name"], translated_files)
