import codecs
import uuid
from subprocess import call, PIPE


def commit_patch(repo_path, package_name, patch_content):
    random_str = uuid.uuid4().hex.capitalize()
    print(random_str)
    call("cd /tmp/ && git clone " + repo_path + " " + random_str, shell=True, stdout=PIPE, stderr=PIPE)
    call("ls /tmp/" + random_str, shell=True, stdout=PIPE, stderr=PIPE)
    call("touch /tmp/" + random_str + "/" + random_str + ".patch", shell=True, stdout=PIPE, stderr=PIPE)
    # here writes patch_content to ^^^^^
    with codecs.open("/tmp/" + random_str + "/" + random_str + ".patch", "w", "utf-8-sig") as temp:
        temp.write(patch_content + "\n")
    call("sed -i \"1iPatch: " + random_str + ".patch\" /tmp/" + random_str + "/" + package_name + ".spec", shell=True,
         stdout=PIPE, stderr=PIPE)
    call("cd /tmp/" + random_str + " && git commit -am \"Переведено\"", shell=True, stdout=PIPE, stderr=PIPE)
