import json
import urllib.request


def get_project_id(group, name):
    """
    requests search of specified project group and name and returns found project id
    :param group: ABF group to use
    :param name: string like "import/project_name" to search in ABF
    :return: Project ID in ABF (number)
    """
    response = urllib.request.urlopen("https://abf.io/api/v1/search.json?type=projects&query=" + name)
    projects = json.loads(response.read().decode("UTF-8"))['results']['projects']
    return [x for x in projects if x['fullname'] == group + "/" + name][0]['id']
