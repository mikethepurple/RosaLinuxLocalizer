import json

from handsome import full_project_info
from list_utils import filter_input, from_file_with_list
from settings_keeper import load_settings, save_settings
from translation import yandex_translate

project_group = "import"
inner = "/home/zimy/Documents/HotProjects/RosaLinuxLocalizer/src/terminology-0.9.0-1-rosa2014.1.x86_64.rpm"
yandex_api_key = "trnsl.1.1.20160131T164826Z.1cd5efb8cc6af7a6.0d34545e70be2a8bdd261d6cf743ae3df1429d13"

# assert yandex_translate(yandex_api_key, "en-ru",
#                         "Lazy cat jumps over talking dog") == "Ленивый кот перепрыгивает через говорящая собака"

import argparse

parser = argparse.ArgumentParser(description='Process some json.')
parser.add_argument('json_data', metavar='JSON', type=str, help='JSON')

args = parser.parse_args()

input_user = json.loads(str(args.json_data))

if input_user["command"] == "translate":
    print(yandex_translate(yandex_api_key, "en-ru", input_user["data"]))
elif input_user["command"] == "get_settings":
    print(load_settings())
elif input_user["command"] == "set_settings":
    save_settings(input_user["data"])
    print("{\"result\":\"ok\"}")
elif input_user["command"] == "import":
    data = input_user["data"]
    files = []
    if data["type"] == "files":
        files = filter_input(data["values"])
    elif data["type"] == "custom":
        files = from_file_with_list(data["values"])
    project_info = [full_project_info(project_group, f, ["Name", "Comment"]) for f in files]
    print(json.dumps(project_info))
    # commit_patch(project_info[0]["git"], project_info[0]["package_name"], translated_files)
