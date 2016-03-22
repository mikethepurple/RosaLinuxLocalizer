import codecs
import json
import uuid
from os import path
from subprocess import call

from settings_keeper import load_settings


def prepare_patch(random_str, repo_path, package_name, patch_content, branch_name):
    """
    This is for saving patch file, adding it to git and pushing back to ABF.
    :param random_str:
    :param repo_path: git URL to clone from (ssh, https)
    :param package_name: package name to open spec file from
    :param patch_content: text to write to patch file
    :return: nothing
    """
    settings = json.loads(load_settings())
    login = settings["abf_login"]
    password = settings["abf_password"]
    new_repo_path = repo_path[:8] + login + ":" + password + "@" + repo_path[8:]
    print(random_str)
    print(branch_name)
    call("cd " + path.expanduser('~') + "/ && git clone " + new_repo_path + " " + random_str +
         " && cd " + random_str + " && git checkout " + branch_name, shell=True)
    call("ls " + path.expanduser('~') + "/" + random_str, shell=True)
    call("touch " + path.expanduser('~') + "/" + random_str + "/" + random_str + ".patch", shell=True)
    with codecs.open("" + path.expanduser('~') + "/" + random_str + "/" + random_str + ".patch", "w",
                     "utf-8-sig") as temp:
        for file in json.loads(patch_content):
            temp.write("+++" + file["path"] + "\n" + "@@ -0,0 +1,3 @@" + "\n")
            for line in file["strings"]:
                temp.write(line["variable_name"] + "[ru]=" + line["value"]["ru"] + "\n")
    for file in json.loads(patch_content):
        with open("" + path.expanduser('~') + "/" + random_str + "/" + "somecontainment", "w") as concrete:
            concrete.write(file["containment"])
    call("cd " + path.expanduser('~') + "/" + random_str + "/ && git add " + random_str + ".patch", shell=True)
    call("sed -i \"1iPatch: " + random_str + ".patch\" " + path.expanduser(
        '~') + "/" + random_str + "/" + package_name + ".spec", shell=True)


def push_patch(random_str):
    call("cd " + path.expanduser('~') + "/" + random_str + " && git commit -am \"Переведено\" && git push", shell=True)
    call("cd " + path.expanduser('~') + "/ && rm -rf " + random_str, shell=True)
