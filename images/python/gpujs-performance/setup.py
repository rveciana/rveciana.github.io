from distutils.core import setup
from Cython.Build import cythonize

# Run python setup.py build_ext --inplace
setup(name="interpolate_residuals",
      ext_modules=cythonize('interpolate_residuals.pyx'),
      requires=['numpy'])