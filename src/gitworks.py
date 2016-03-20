import codecs
import json
import uuid
from subprocess import call

from settings_keeper import load_settings


def commit_patch(repo_path, package_name, patch_content, branch_name):
    """
    This is for saving patch file, adding it to git and pushing back to ABF.
    :param repo_path: git URL to clone from (ssh, https)
    :param package_name: package name to open spec file from
    :param patch_content: text to write to patch file
    :return: nothing
    """
    random_str = uuid.uuid4().hex.capitalize()
    settings = json.loads(load_settings())
    login = settings["abf_login"]
    password = settings["abf_password"]
    new_repo_path = repo_path[:8] + login + ":" + password + "@" + repo_path[8:]
    print(random_str)
    print(branch_name)
    call("cd /tmp/ && git clone " + new_repo_path + " " + random_str +
         " && cd " + random_str + " && git checkout " + branch_name, shell=True)
    call("ls /tmp/" + random_str, shell=True)
    call("touch /tmp/" + random_str + "/" + random_str + ".patch", shell=True)
    with codecs.open("/tmp/" + random_str + "/" + random_str + ".patch", "w", "utf-8-sig") as temp:
        for file in json.loads(patch_content):
            temp.write("+++" + file["path"] + "\n" + "@@ -0,0 +1,3 @@" + "\n")
            for line in file["strings"]:
                temp.write(line["variable_name"] + "[ru]=" + line["value"]["ru"] + "\n")

    call("cd /tmp/" + random_str + "/ && git add " + random_str + ".patch", shell=True)
    call("sed -i \"1iPatch: " + random_str + ".patch\" /tmp/" + random_str + "/" + package_name + ".spec", shell=True)
    call("cd /tmp/" + random_str + " && git commit -am \"Переведено\" && git push", shell=True)
    call("cd /tmp/ && rm -rf " + random_str, shell=True)
