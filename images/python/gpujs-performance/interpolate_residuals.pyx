#cython: boundscheck=False, wraparound=False, nonecheck=False, cdivision=True

import numpy as np
cimport numpy as np
from libc.math cimport sqrt
from libc.math cimport pow
from cpython cimport array
import array

DTYPE = np.float64
ctypedef np.float64_t DTYPE_t

def interpolate_residuals(residues, size, geotransform):
    cdef array.array da = array.array('d', [])
    array.resize(da, size[0] * size[1])
    cdef double[:] cda = da

    xpos0 = []
    ypos0 = []
    values0 = []

    for key in residues.keys():
        xpos0.append(residues[key]['x'])
        ypos0.append(residues[key]['y'])
        values0.append(residues[key]['value'])

    cdef int N
    N = len(xpos0)
    #http://cython.readthedocs.io/en/latest/src/tutorial/array.html
    cdef array.array xpos = array.array('d', xpos0)
    cdef double[:] cxpos = xpos
    cdef array.array ypos = array.array('d', ypos0)
    cdef double[:] cypos = ypos
    cdef array.array values = array.array('d', values0)
    cdef double[:] cvalues = values

    cdef int i, j
    cdef int xsize = size[1]
    cdef int ysize = size[0]
    cdef double y
    cdef double x

    cdef array.array geotransform0 = array.array('d', geotransform)
    cdef double[:] cgeotransform = geotransform0

    for j in range(ysize):
        y = cgeotransform[3] + j * cgeotransform[5]
        for i in range(xsize):
            x = cgeotransform[0] + i * cgeotransform[1]
            cda[i + j * xsize] = point_residue(x, y, cxpos, cypos, cvalues, N)

    data_array = np.array(cda)
    return data_array.reshape(size)

cdef float point_residue(double x, double y, double[:] xpos, double[:] ypos, double[:] values, int N):
    cdef int power = 2
    cdef int smoothing = 0
    cdef double numerator = 0
    cdef int i
    cdef double denominator
    denominator = 0

    for i in range(N):
        dist = sqrt((x - xpos[i]) ** 2 + (
            y - ypos[i]) ** 2 + smoothing * smoothing)

        if dist < 0.00000000001:
            return values[i]
        numerator = numerator + (values[i] / pow(dist, power))
        denominator = denominator + (1 / pow(dist, power))

    if denominator != 0:
        return numerator / denominator

