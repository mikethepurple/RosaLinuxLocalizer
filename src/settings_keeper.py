from os import path
import json

file_name = path.expanduser('~') + "/.config/handsome.json"


def load_settings():
    if not path.isfile(file_name):
        with open(file_name, "w") as storage:
            storage.write("")
        return json.dumps({
            "yandex_api_key": "not set",
            "abf_projects_group": "import",
            "abf_login": "login",
            "abf_password": "password",
            "branches": [
            ],
            "variables": [
                {
                    "name": "Name",
                    "last": False
                },
                {
                    "name": "Comment",
                    "last": True
                }
            ]
        })
    else:
        with open(file_name, "r") as storage:
            return storage.read()


def save_settings(settings):
    with open(file_name, "w") as storage:
        storage.write(settings)
    return settings
