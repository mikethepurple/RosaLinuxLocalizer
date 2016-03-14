from os import path


def load_settings():
    with open(path.expanduser('~')+"/.config/handsome.json", "r") as storage:
        return storage.read()


def save_settings(settings):
    with open(path.expanduser('~')+"/.config/handsome.json", "w") as storage:
        storage.write(settings)
    return settings
