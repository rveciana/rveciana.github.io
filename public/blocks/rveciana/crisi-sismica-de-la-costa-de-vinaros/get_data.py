# -*- coding: utf-8 -*-
#http://jramosgarcia.wordpress.com/2013/10/01/que-es-el-proyecto-castor/
import urllib
import json
import dateutil.parser
import datetime

def get_data(url):
    filehandle = urllib.urlopen(url)
    html = filehandle.read()
    filehandle.close()

    lines = html.splitlines()

    for i in range(len(lines)):
    
        if lines[i].find('Latitud') > 0:
            lat = lines[i].strip().split(" ")[1].replace("º","")
        if lines[i].find('Longitud') > 0:
            lon = lines[i].strip().split(" ")[1].replace("º","")   
        if lines[i].find('mol del dia') > 0:
            date = lines[i + 1].strip().replace("</div>","")
        if lines[i].find('Hora origen') > 0:
            hour = lines[i].strip().split(" ")[4]                   
        if lines[i].find('Magnitud') > 0:
            magnitude = lines[i+1].strip().split(" ")[0]

    date_array  = date.split("/")
    hour_array = hour.split(":")

    date_time = datetime.datetime(int(date_array[2]),int(date_array[1]),int(date_array[0]),int(hour_array[0]), int(hour_array[1]))

    data = {'lat':lat, 'lon':lon, 'datetime': date_time.isoformat(), 'magnitude': magnitude}
    return json.dumps(data)

if __name__ == "__main__":
    url_list = [
    'http://www.igc.cat/web/gcontent/ca/sismologia/sismescomact/comhistcat/20130910175510/comact.html',
    'http://www.igc.cat/web/gcontent/ca/sismologia/sismescomact/comhistcat/20130913095842/comact.html',
    'http://www.igc.cat/web/gcontent/ca/sismologia/sismescomact/comhistcat/20130918142943/comact.html',
    'http://www.igc.cat/web/gcontent/ca/sismologia/sismescomact/comhistcat/20130920104607/comact.html',
    'http://www.igc.cat/web/gcontent/ca/sismologia/sismescomact/comhistcat/20130924091301/comact.html',
    'http://www.igc.cat/web/gcontent/ca/sismologia/sismescomact/comhistcat/20130925125029/comact.html',
    'http://www.igc.cat/web/gcontent/ca/sismologia/sismescomact/comhistcat/20130929084140/comact.html',
    'http://www.igc.cat/web/gcontent/ca/sismologia/sismescomact/comhistcat/20130929192416/comact.html',
    'http://www.igc.cat/web/gcontent/ca/sismologia/sismescomact/comhistcat/20130930005900/comact.html',
    'http://www.igc.cat/web/gcontent/ca/sismologia/sismescomact/comhistcat/20130930051316/comact.html',
    'http://www.igc.cat/web/gcontent/ca/sismologia/sismescomact/comhistcat/20131001045206/comact.html',
    'http://www.igc.cat/web/gcontent/ca/sismologia/sismescomact/comhistcat/20131001055709/comact.html',
    'http://www.igc.cat/web/gcontent/ca/sismologia/sismescomact/comhistcat/20131002121626/comact.html',
    'http://www.igc.cat/web/gcontent/ca/sismologia/sismescomact/comhistcat/20131002232928/comact.html',
    'http://www.igc.cat/web/gcontent/ca/sismologia/sismescomact/comhistcat/20131003012732/comact.html',
    'http://www.igc.cat/web/gcontent/ca/sismologia/sismescomact/comhistcat/20131003031301/comact.html',
    'http://www.igc.cat/web/gcontent/ca/sismologia/sismescomact/comhistcat/20131004113222/comact.html',
    'http://www.igc.cat/web/gcontent/ca/sismologia/sismescomact/comhistcat/20131004120323/comact.html'
    ]

    f = open("data.json","w")
    f.write("[")
    json_data = ""
    for url in url_list:
     json_data = json_data + get_data( url ) + ", "
       
    f.write(json_data[0:-2])
    f.write("]")
    f.close()
   