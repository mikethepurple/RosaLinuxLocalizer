# inner = sys.stdin.read()
import json

import settings_keeper
from gitworks import prepare_patch
from handsome import full_project_info
from list_utils import filter_input
from translation import translate
import uuid

import argparse

from yaml_importer import from_file_with_list

parser = argparse.ArgumentParser(description='Translate some packages')
parser.add_argument('--git-branch')
group = parser.add_mutually_exclusive_group()
group.add_argument('--prepare', dest='target', action='store_const', const='prepare')
group.add_argument('--translate', dest='target', action='store_const', const='translate')
group.add_argument('--commit', dest='target', action='store_const', const='commit')
parser.add_argument('file', metavar='filename.yml', type=str,
                    help='an integer for the accumulator')
args = parser.parse_args()
settings = settings_keeper.load_settings()
project_group = settings["abf_projects_group"]
yandex_api_key = settings["yandex_api_key"]

assert translate(yandex_api_key, "en-ru",
                 "Lazy cat jumps over talking dog") == "Ленивый кот перепрыгивает через говорящая собака"

for f in from_file_with_list(args.file):
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
