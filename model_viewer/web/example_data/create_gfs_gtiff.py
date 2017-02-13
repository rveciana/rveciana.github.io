import gdal
import osr
import sys
ds = gdal.Open(sys.argv[1])
gph = ds.GetRasterBand(84).ReadAsArray()
press = ds.GetRasterBand(54).ReadAsArray() / 100
temp = ds.GetRasterBand(52).ReadAsArray()
u = ds.GetRasterBand(50).ReadAsArray()
v = ds.GetRasterBand(51).ReadAsArray()

corr_press = press * (1 - (0.0065*gph/(0.0065*gph + temp  + 273.15)))**-5.257

driver = gdal.GetDriverByName('GTiff')
outRaster = driver.Create(sys.argv[2], ds.RasterXSize, ds.RasterYSize, 4, gdal.GDT_Float32)
outRaster.SetGeoTransform(ds.GetGeoTransform())

outband = outRaster.GetRasterBand(1)
outband.WriteArray(corr_press)
outband.SetMetadata({'name': 'press'})

'''
outband = outRaster.GetRasterBand(2)
outband.WriteArray(temp)
outband.SetMetadata({'name': 'temp'})

outband = outRaster.GetRasterBand(3)
outband.WriteArray(u)
outband.SetMetadata({'name': 'u'})

outband = outRaster.GetRasterBand(4)
outband.WriteArray(v)
outband.SetMetadata({'name': 'v'})
'''

outRasterSRS = osr.SpatialReference()
outRasterSRS.ImportFromEPSG(4326)
outRaster.SetProjection(outRasterSRS.ExportToWkt())
outband.FlushCache()
