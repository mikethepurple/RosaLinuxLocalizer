import json


def load_settings():
    with open("/home/zimy/.config/handsome.json", "r") as storage:
        return storage.read()


def save_settings(settings):
    with open("/home/zimy/.config/handsome.json", "w") as storage:
        storage.write(settings)
