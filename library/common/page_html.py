import requests

DEFAULT_RETRY_ATTEMTES = 5

def getPageHtmlCode(url) -> str:
    for i in range(DEFAULT_RETRY_ATTEMTES):
        response = requests.get(url)
        if response.status_code == 200:
            return response.text
    return None
