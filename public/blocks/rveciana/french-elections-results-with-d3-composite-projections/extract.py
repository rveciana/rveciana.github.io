# -*- coding: utf-8 -*-
import urllib
import urllib2
from bs4 import BeautifulSoup
import re
import json

remove_chars = re.compile(r'[^\d.]+')

results = {}

url = "https://fr.wikipedia.org/wiki/R%C3%A9sultats_par_d%C3%A9partement_de_l%27%C3%A9lection_pr%C3%A9sidentielle_fran%C3%A7aise_de_2017"
response = urllib2.urlopen(url)
html = response.read()
soup = BeautifulSoup(html)

for lel in soup.select("a"):
    if lel.text in [u"Marine Le Pen",
        u"Emmanuel Macron",
        u"François Fillon",
        u"Jean-Luc Mélenchon",
        u"Nicolas Dupont-Aignan",
        u"Benoît Hamon",
        u"François Asselineau",
        u"Jean Lassalle",
        u"Philippe Poutou",
        u"Nathalie Arthaud",
        u"Jacques Cheminade"]:


        depart = lel.find_previous('span', attrs={"class": "mw-headline"}).text.encode('utf-8')
        td1=lel.find_next("td")
        td2=td1.find_next("td")
        td3=td2.find_next("td")
        if td3 is not None:
            td4=td3.find_next("td")
        else:
            td4=td3

        result1 = remove_chars.sub('', td1.text)
        result2 = td2.text.replace(",",".")

        if hasattr(td4, 'text') and hasattr(td3, 'text'):
            result3 = remove_chars.sub('', td3.text)
            result4 = td4.text.replace(",",".")
            try:
                result3 = float(result3)
            except ValueError:
                result3 = 0
            try:
                result4 = float(result4)
            except ValueError:
                result4 = 0
        else:
            result3 = 0
            result4 = 0

        if not depart in results:
            results[depart] = {}
        results[depart][lel.text] = {"votes": result1, "percent": result2, "votes2": result3, "percent2": result4}
        #print(depart, lel.text, "->", result1,",",result2, ",", result3,",",result4)

out_string = json.dumps(results).decode('unicode-escape').encode('utf8')

with open('results.json', 'w') as outfile:
    outfile.write(out_string)
