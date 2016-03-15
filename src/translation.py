import json
import urllib.request


def translate(api_key, lang, text):
    """
    Translates string using Yandex.translate kit
    :param api_key: required to be passed to Yandex
    :param lang: text like "en-ru" which describes targeted translation direction
    :param text: text to translate. 1 million per day, 10 millions per month
    :return: translated text
    """
    return json.loads(urllib.request.urlopen(
        "https://translate.yandex.net/api/v1.5/tr.json/translate?key=" + api_key + "&lang=" + lang + "&text=" + text
    ).read().decode("UTF-8"))['text'][0]
