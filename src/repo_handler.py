import os
import urllib.request
import urllib
from urllib.parse import urljoin
import html.parser
import uuid
import posixpath
from list_utils import filter_input


class MyParser(html.parser.HTMLParser):
    aggregated_links = []

    def handle_starttag(self, tag, attributes):
        self.aggregated_links += [value for name, value in attributes if name == "href" and tag == "a"]


def list_remote_repo(repo_url):
    response = urllib.request.urlopen(repo_url)
    custom_html_parser = MyParser()
    custom_html_parser.feed(str(response.read()))
    return [(urljoin(repo_url, f), posixpath.basename(urljoin(repo_url, f))) for f in
            custom_html_parser.aggregated_links]


def download_remote_file_to_temp(new_dir, link):
    print(new_dir + "/" + link[1])
    return urllib.request.urlretrieve(link[0], new_dir + "/" + link[1])[0]


def download_all_repo_files_to_temp(repo_urls):
    random_str = uuid.uuid4().hex.capitalize()
    new_dir = "/tmp/" + random_str
    if not os.path.exists(new_dir):
        os.makedirs(new_dir)

    return [download_remote_file_to_temp(new_dir, i) for i in repo_urls if ".rpm" in i[1]]


def mirror_repo_to_tmp(repo_url):
    return download_all_repo_files_to_temp(list_remote_repo(repo_url))
