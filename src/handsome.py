#!/usr/bin/python3
import os
import shutil
import uuid
from os import walk
from subprocess import call, Popen, PIPE

from abf_interface import get_project_id


def read_desktop(dir_name, file):
    """

    :param dir_name:
    :param file:
    :return:
    """
    va = []
    with open(dir_name + file) as d:
        va.extend(d.read().split("\n"))
    return [one for one in va if ("Name=" in one or "Comment=" in one) and one[0] != '#']


def read_rpm_file(filename):
    """
    reads desktop file from supplied filename and yields list of desktop files here,
    for each desktop file yields list of strings to be localized
    :param filename: file to read desktop files from
    :return: [desktop_file_name, [pair, pair]]
    """
    random_str = uuid.uuid4().hex.capitalize()
    basename = os.path.basename(filename)
    dir_name = "/tmp/" + random_str + "/"
    new_name = dir_name + basename
    os.mkdir(r"/tmp/" + random_str)
    shutil.copy(filename, new_name)

    call_string = "cd " + dir_name + " && rpm2cpio " + basename + " | cpio -idmv"
    call(call_string, shell=True, stderr=PIPE)
    os.remove(new_name)

    f = []
    for (dir_path, dir_names, file_names) in walk(dir_name):
        f.extend([(dir_path + "/" + x)[len(dir_name):] for x in file_names if ".desktop" in x])

    desktop_file_entries = [(line, read_desktop(dir_name, line)) for line in f]

    shutil.rmtree(dir_name)

    return desktop_file_entries


def get_rpm_project_name(filename):
    """
    executes rpm command against specified file to obtain ABF project name
    :param filename:  file to execute command against
    :return: ABF project name string
    """
    process = Popen("rpm -qp --qf=\"%{SOURCERPM}\" " + filename + "| rev | cut -f3- -d- | rev", shell=True, stderr=PIPE,
                    stdout=PIPE)
    out, err = process.communicate()
    return out.decode("UTF-8")[:-1]


def full_project_info(group, filename):
    """

    :param group:
    :param filename:
    :return:
    """
    project_name = get_rpm_project_name(filename)
    return filename, project_name, get_project_id(group, project_name), read_rpm_file(filename)
