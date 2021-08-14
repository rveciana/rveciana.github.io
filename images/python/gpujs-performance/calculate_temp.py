import matplotlib.pyplot as plt
from sklearn.linear_model import LinearRegression
from json import load
from numpy import linspace
from numpy import array
from numpy import meshgrid
from numpy import reshape
from scipy.interpolate import Rbf
from scipy.spatial import distance_matrix
import gdal
from time import time

from idw import tree
from interpolate_residuals import interpolate_residuals


'''
https://stackoverflow.com/questions/3104781/inverse-distance-weighted-idw-interpolation-with-python
https://github.com/paulbrodersen/inverse_distance_weighting

'''


def calculate_regression(data_file):
    regr = LinearRegression()

    with open(data_file) as f_p:
        data = load(f_p)
        temps = []
        predictors = []
        lats = []
        lons = []
        for station_data in data:
            temps.append(station_data['temp'])
            predictors.append([station_data['alt'], station_data['dist']])
            lats.append(station_data['lat'])
            lons.append(station_data['lon'])

        regr.fit(predictors, temps)
        score = regr.score(predictors, temps)
        residuals = regr.predict(predictors) - temps

        print("Multiple linear regression score: {}".format(score))
        return {'coefs': regr.coef_, 'intercept': regr.intercept_,
                'residuals': array(residuals),
                'lats': array(lats), 'lons': array(lons)}


def create_regression_field(regression, vars_file):
    d_s = gdal.Open(vars_file)
    distances = d_s.GetRasterBand(1).ReadAsArray()
    altitudes = d_s.GetRasterBand(2).ReadAsArray()
    temperature = (regression['intercept'] +
                   altitudes * regression['coefs'][0] +
                   distances * regression['coefs'][1])
    # plt.matshow(temperature)
    # plt.show()
    return temperature


def rbf(regression, dimensions):
    xi = linspace(regression['lons'].min(), regression['lons'].max(),
                  dimensions[1])
    yi = linspace(regression['lats'].min(), regression['lats'].max(),
                  dimensions[0])
    xi, yi = meshgrid(xi, yi)
    xi, yi = xi.flatten(), yi.flatten()
    interp = Rbf(regression['lons'], regression['lats'],
                 regression['residuals'], function='linear')

    residuals_field = interp(xi, yi).reshape(dimensions)
    return residuals_field


def idw(regression, dimensions):
    X1 = array(list(zip(regression['lons'], regression['lats'])))

    idw_tree = tree(X1, regression['residuals'])

    xi = linspace(regression['lons'].min(), regression['lons'].max(),
                  dimensions[1])
    yi = linspace(regression['lats'].min(), regression['lats'].max(),
                  dimensions[0])
    X2 = meshgrid(xi, yi)
    X2 = reshape(X2, (2, -1)).T
    z2 = idw_tree(X2)

    return z2.reshape(dimensions)


def cython_id(regression, dimensions):
    
    data = {}
    
    for i in range(len(regression['lons'])):
        data[i] = {'x': regression['lons'][i],
                   'y': regression['lats'][i],
                   'value': regression['residuals'][i]}
    
    geotransform = [min(regression['lons']),
        (max(regression['lons']) - min(regression['lons']))/dimensions[1],
        0,
        max(regression['lats']),
        0,
        (min(regression['lats']) - max(regression['lats']))/dimensions[0]
    ]

    result = interpolate_residuals(data, dimensions, geotransform)
    return result
   
def calculate_final_field(temperature, residuals_field):
    return temperature - residuals_field


def calculate_temp(vars_file, data_file, method=rbf):
    ini_time = time()
    regression = calculate_regression(data_file)
    t_reg = time()
    temperature = create_regression_field(regression, vars_file)
    t_temp = time()
    residuals_field = method(regression, temperature.shape)
    t_res = time()
    final_field = calculate_final_field(temperature, residuals_field)
    t_final = time()

    plt.matshow(final_field)
    plt.savefig(method.__name__ + ".png")
    t_draw = time()

    print("""-------
Regression time: {:.0f} ms
Temperature field time: {:.0f} ms
Residuals field time: {:.0f} ms
Final field time: {:.0f} ms
Drawing time: {:.0f} ms
-------
Total time: {:.0f} ms"""
           .format(1000*(t_reg - ini_time),
            1000*(t_temp - t_reg),
            1000*(t_res - t_temp),
            1000*(t_final - t_res),
            1000*(t_draw - t_final),
            1000*(t_draw - ini_time)))


if __name__ == '__main__':
    calculate_temp('vars.tiff', 'station_data.json', rbf)
    calculate_temp('vars.tiff', 'station_data.json', idw)
    calculate_temp('vars.tiff', 'station_data.json', cython_id)
