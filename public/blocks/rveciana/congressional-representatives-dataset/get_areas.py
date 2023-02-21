from osgeo import ogr

def get_length(geom):
    length = 0.0
    if geom.GetGeometryName() == 'POLYGON':
        length += get_polygon_length(geom)
    else:
        for polygon in geom:
            length += get_polygon_length(polygon)
    return length

def get_polygon_length(polygon):
    length = 0.0
    for ring in polygon:
        length += ring.Length()
    return length

driver = ogr.GetDriverByName("ESRI Shapefile")
dataSource = driver.Open("cgd114p010g.shp", 1)
layer = dataSource.GetLayer()
new_field = ogr.FieldDefn("Area", ogr.OFTReal)
new_field.SetWidth(32)
new_field.SetPrecision(2) #added line to set precision
layer.CreateField(new_field)

for feature in layer:

    geom = feature.GetGeometryRef()
   
    area = geom.GetArea() 
    print feature.GetFieldAsString(0), area, get_length(geom)
    feature.SetField("Area", area)
    layer.SetFeature(feature)


dataSource = None 

