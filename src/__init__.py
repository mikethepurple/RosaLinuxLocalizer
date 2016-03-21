# inner = sys.stdin.read()
import json

from gitworks import prepare_patch
from handsome import full_project_info
from list_utils import filter_input
from translation import translate
import uuid

# 3 из репозитория.
# TZ 4.1.3
# Про архитектуру: модули и инструкции по расширению каждого модуля.

import argparse

parser = argparse.ArgumentParser(description='Process some integers.')
parser.add_argument('integers', metavar='N', type=int, nargs='+',
                    help='an integer for the accumulator')
parser.add_argument('--sum', dest='accumulate', action='store_const',
                    const=sum, default=max,
                    help='sum the integers (default: find the max)')

args = parser.parse_args()
print(args.accumulate(args.integers))

project_group = "import"
yandex_api_key = "trnsl.1.1.20160131T164826Z.1cd5efb8cc6af7a6.0d34545e70be2a8bdd261d6cf743ae3df1429d13"

assert translate(yandex_api_key, "en-ru",
                 "Lazy cat jumps over talking dog") == "Ленивый кот перепрыгивает через говорящая собака"

for f in filter_input(inner):
    print(full_project_info(project_group, f, ["Name", "Comment"]))
project_info = [full_project_info(project_group, f, ["Name", "Comment"]) for f in filter_input(inner)]
print(json.dumps(project_info))
translated_files = ""

for one in project_info:
    for f in one["desktop_files"]:
        print(str(f["path"]))
        translated_files = translated_files + f["path"] + "\n"
        for i in f["strings"]:
            translated = str(
                i["variable_name"] + "[translated_ru]=" + translate(yandex_api_key, "en-ru", i["value"]["en"]))
            translated_files = translated_files + translated + "\n"
            print(translated)

random_str = uuid.uuid4().hex.capitalize()

prepare_patch(random_str, project_info[0]["git"], project_info[0]["package_name"], translated_files)
