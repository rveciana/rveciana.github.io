---
layout: ../../layouts/Post.astro
title: Code coverage and pylint with PyCharm community
pubDate: 2016-02-15
categories: python
tags: [PyCharm, coverage, lint]
teaser: pycharm-coverage.png
---

I've using Eclipse and [PyDev][pydev] for some years now, but I always wanted to switch to [PyCharm][pycharm]. The main problem I found was the integration with coverage.py and pylint, which are very easy in Pydev, but not available with the Community version of PyCharm.

This is the solution for both tools using PyCharm 5 in a python3 project:

# pylint

Let's do the easier one first. PyCharm comes with the _pep8.py_ and other syntax checks, but I like [pylint][pylint] because it gives some indications about number of class methods, variables in a function, etc.

Install pylint if you don't have it in your system:
{% highlight bash %}
sudo pip install pylint
{% endhighlight %}
Then, open _File->Settings->Tools->External tools_ and click the _+_ button. You will get a window that has to be filled like this:

<img src="{{ site.baseurl }}/images/python/pycharm-coverage/pylint.png"/>

- Remember to check the _Show console when a message is printed to standard output stream_ and the same with errors. If not, the [pylint][pylint] output won't be shown.
- _Program_ is the path to the program to be executed. No parameters can be passed here
- The _params_ section gives the parameters to the executed program. _$FilePath$_ is a _macro_. All the available macros can be selected with the right button. _$FilePath$_ is changed to the selected file path when the fuinction is launched
- The _working directory_ section indicates the directory the order will be executed from. I've set it with a macro to the project root path

You can run the pylint script by going to _tools->External tools->pylint_ when you have a file open or right clicking the file name at the project pane.

# coverage

[coverage.py][coverage.py] is a tool to check if all the lines are executed in a module when a test for this module is run. With it is easy to know if all the coded possibilities have been tested. We could use the script directly, but since PyCharm uses [nose][nose] to run the tests and gives a nice output and nose can [integrate the coverage.py script][nose coverage], I've configured the later to give the test result and coverage at once.

To run the test with the coverage option, some flags have to be applied (all the options [here][nose coverage]):

- --with-coverage enables the coverage
- --cover-package restricts the coverage to the specified packages (more than one can be specified separating with commas). When the flag is not enable, all the dependencies will be checked, with all the libraries used, so the result can be difficult to read. This is the point that gave me some troubles
- --cover-tests Covers the modules and tests. Can be useful to check if all the test has been run (if you use some condition inside them, for instance)
- --cover-erase Reset the results before running the tests. If tests are not erased, the output results can be confusing if the changed code is not covered but it was in a previous version

I didn't find a really satisfactory way to integrate coverage in PyCharm community, so I'll show three ways to do it:

## Modifying the run parameters

Once a test is created, go to _Run->Edit Configurations_ and find the configuration for the test you want to use. Edit it and add to the _params_ text box:

_--with-coverage --cover-erase --cover-package package_name_

Now, when running the test, the console will output the coverage result

- Pros: The output keeps the test result view
- Cons: You have to configure it for each test. The package name has to be changed each times

## Adding an external tool

As in the pylint case, an external tool can be set: Open _File->Settings->Tools->External tools_ and click the _+_ button.

<img src="{{ site.baseurl }}/images/python/pycharm-coverage/coverage1.png"/>

- The program is _nosetests3_ in my case, since I'm running a python3 project
- The parameters are the same as in the other case, but calling the macro _$Prompt$_ to give the name of the packages. This will open a window to ask which packages to check

You can call the coverage script using _tools->External tools->noseCoverage_

- Pros: The tool can be called from any test
- Cons: The package name has to be written every time. The output is only at the console, without the test pane.

## Calling a script from an external tool

The external tool way could be improved if the packages where automatically called instead of opening a window. Unfortunately, I haven't been able to execute code inside the _parameters_ field, so the solution is creating an external file with the following command:
{% highlight bash %}
nosetests3 --with-coverage --cover-erase --cover-tests --cover-package `echo */|sed 's/\///g'|sed 's/ /,/g'`
{% endhighlight %}
And then, create the _external tool_ this way:

<img src="{{ site.baseurl }}/images/python/pycharm-coverage/coverage2.png"/>

- All the available packages are passed to the _--cover-package_ option so no prompt is needed
- Since the _working directory_ is set to the project root, the paths are at the correct point

I haven't been able to pass the _echo_ part inside the parameters field, PyCharm avoids executing it.

- Pros: The most automatic way I have found to do it
- Cons: Requires an external script, which I don't like

[pycharm]: https://www.jetbrains.com/pycharm/
[pydev]: http://www.pydev.org/
[pylint]: https://www.pylint.org/
[coverage.py]: https://coverage.readthedocs.org/en/coverage-4.0.3/
[nose]: https://nose.readthedocs.org/en/latest/
[nose coverage]: http://nose.readthedocs.org/en/latest/plugins/cover.html
