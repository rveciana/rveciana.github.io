---
layout: ../../layouts/Post.astro
title: Cython with PyCharm community
pubDate: 2017-04-20
categories: python
tags: [PyCharm, cython]
teaser: pycharm-coverage.png
---

Some time ago, I explained [how to use coverage and pylint with PyCharm community][coverage]. [Cython][cython] is also covered by PyCharm professional, but not the community edition, which makes working with cython a bit uncomfortable.

Here is how I managed to do it.

## Syntax hightlighting

cython files end with _.pyx_. The syntaxis is similar to python, but the program doesn't recognize the file. Also, it has some special words that would give error in python, such as _cdef_. So a new file type must be created. Go to _File->Settings->Editor->File Types_ and add a file type:

<img src="/images/python/pycharm-cython/pyx.png"/>

Then, edit it to make it good for the cython syntax:

<img src="/images/python/pycharm-cython/cython.png"/>

Since there are many words to add, and no way to do it fast, I have exported my settings in [this file][settings], which you can import from _File->Import Settings_. I'll try to keep it updated by adding more keywords.

## Compiling the cython file

As explained in the [official cython basic tutorial][cythontutorial], the best way to compile the files is creating a _setup.py_ file with the compilation options:

```python

from distutils.core import setup
from Cython.Build import cythonize

setup(
ext_modules = cythonize("helloworld.pyx")
)

```

The compilation is then made by running:

    python setup.py build_ext --inplace

Is possible to automatize this with an _external tool_:

Open _File->Settings->Tools->External tools_ and click the _+_ button. You will get a window that has to be filled like this:

<img src="/images/python/pycharm-cython/tool.png"/>

You can run the compilation by going to _tools->External tools->cython compile_ any moment or right clicking the file name at the project pane. Then, re-run it by clicking on the play button on the lower pane.

Usually, all the cython files will be compiled at once with the _setup.py_, so there is no need for creating special configurations depending on the file.

## Links

- [The settings file][settings]
- [Coverage with Pycharm community][coverage]
- [PyCharm][pycharm]
- [Cython][cython]
- [Cython basic tutorial][cythontutorial]
- [New file types in PyCharm][filetypes]

[cython]: http://cython.org/
[cythontutorial]: http://docs.cython.org/en/latest/src/tutorial/cython_tutorial.html
[pycharm]: https://www.jetbrains.com/pycharm/
[filetypes]: https://www.jetbrains.com/help/pycharm/2016.3/new-file-type.html

[coverage]: {{ site.baseurl }}{% post_url /python/2016-02-15-code-coverage-pylint-pycharm-community %}
[settings]: /images/python/pycharm-cython/settings.jar

```

```
