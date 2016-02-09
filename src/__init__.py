# inner = sys.stdin.read()
from gitworks import commit_patch
from handsome import full_project_info
from translation import yandex_translate


def filter_input(file_names):
    """
    splits input stream onto strings
    :param file_names: slash-n-separated list of file names
    :return: list of file names [string]
    """
    return [x for x in file_names.split('\n') if ".rpm" in x]


project_group = "import"
inner = "terminology-0.9.0-1-rosa2014.1.x86_64.rpm"
yandex_api_key = "trnsl.1.1.20160131T164826Z.1cd5efb8cc6af7a6.0d34545e70be2a8bdd261d6cf743ae3df1429d13"

assert yandex_translate(yandex_api_key, "en-ru",
                        "Lazy cat jumps over talking dog") == "Ленивый кот перепрыгивает через говорящая собака"

project_info = [full_project_info(project_group, f) for f in filter_input(inner)]

for f in project_info[0][3]:
    print(str(f[0]))
    for i in f[1]:
        pair = i.split('=')
        print(str(pair[0] + "=" + pair[1]))
        print(str(pair[0] + "[ru]=" + yandex_translate(yandex_api_key, "en-ru", pair[1])))

commit_patch(project_info[0][2][1], project_info[0][1], "TRANSLATION")
