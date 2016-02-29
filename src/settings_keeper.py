import json


def load_settings():
    with open("~/.confog/handsome.json", "w") as storage:
        return json.loads(storage.readlines())


def save_settings(settings):
    with open("~/.config/handsome.json", "w") as storage:
        storage.write(json.dumps(settings))
