import uuid
from subprocess import call

random_str = uuid.uuid4().hex.capitalize()
package_name = "terminology"
call("cd /tmp/ && git clone https://abf.io/import/terminology.git " + random_str, shell=True)

call("ls /tmp/" + random_str, shell=True)

call("touch /tmp/" + random_str + "/" + random_str + ".patch", shell=True)

call("sed -i \"1iPatch: " + random_str + ".patch\" /tmp/" + random_str + "/" + package_name + ".spec", shell=True)

call("cd /tmp/" + random_str + " && git commit -am \"Переведено\"", shell=True)
