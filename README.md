MRT
===
A graphical tool for modeling the spatial resolution of mean radiant temperature (MRT) within a space. The latest version of the tool is found [here](http://centerforthebuiltenvironment.github.io/mrt). 

Using the tool
==============
When the tool loads, you will see a rectangular box and a blue plane. To rotate the box, click and drag the mouse. To pan, use the directional arrows on your keyboard.

On the right of the screen is a set of dropdown menus. These are the controls for configuring the dimensions of the box, the properties of the surfaces and windows, the occupant's position, solar parameters, and comfort parameters.

The "display" selectbox allows you to display different values on the blue plane. By default, MRT is shown, which includes both longwave and shortwave contributions. You can view shortwave delta MRT (dMRT) and longwave MRT independently, the constituent parts of shortwave dMRT, or the PMV.

The "update view factors" button needs to be pressed when the geometry of the space or the occupant's position changes. The visualization plane will turn white and a warning will appear when the view factors need updating. Updating the view factors takes 10-20 seconds. Parameters that will require an update of view factors when changed will be listed below in **bold**.

The "autoscale" checkbox is checked by default. This means that the minimum and maximum values of the colorscale will be calculated automatically to reflect the minimum and maximum MRT (or other value) in the space. This makes it easy to see the spatial resolution of the output. If you wish to fix the range of the colorscale, simply uncheck the box, and choose the minimum and maximum values with the scaleMin and scaleMax sliders.

Room
----
This menu contains the **width** (m), **depth** (m), and **height** (m) of the space.

Surfaces
--------
This menu contains all of the parameters for each of the walls, floor and ceiling. Each menu contains a *temperature* (C), *emissivity*, and a menu for a subsurface.

A subsurface is any surface contained in the wall, including a window, skylight, radiant panel, or otherwise. Its parameters are *temperature* (C), *emissivity*, **width** (m), **height** (m), **xposition** (m), **yposition** (m), **active**, **window**, and *tsol*.

The **xposition** and **yposition** parameters are the coordinates of the lower-left corner of the subsurface. If the subsurface is a window, **yposition** could also be thought of as the sill height.

When **active** is selected, the subsurface will be added to the room. Note that the subsurface geometry parameters require view factors to be updated, but only when the subsurface is active.

When **window** is selected, shortwave solar radiation can be admitted to the space, and SolarCal parameters will apply.

If **window** is active, the *tsol* parameter will also apply. This is the solar transmittance of the window being modeled. If **window** is not selected, *tsol* can be ignored.

Occupant
--------
This menu contains parameters relating to the occupant's position. This includes **posture** (seated or standing), and **azimuth** (degrees clockwise from north).

SolarCal
--------
For modeling the effects of shortwave radiation, use the SolarCal section and subsurfaces to include windows. For a detailed explanation of these parameters, see [Arens et al.](https://escholarship.org/uc/item/89m1h2dg)

- *window surface*: determines which of the subsurfaces to be treated as a window. 
- *alt* (degrees from horizontal): solar altitude.
- *az* (degrees clockwise from north): solar azimuth.
- *fbes*: fraction of body exposed to sun.
- *asa*: average shortwave absorptivity.
- *Rfloor*: floor reflectivity.

SolarCal also requires Tsol, the solar transmittance of the window through which radiation is being admitted. This is a property of each window surface.

Thermal Comfort
---------------
This tool also includes the basic PMV model of the [CBE Thermal Comfort Tool](http://comfort.cbe.berkeley.edu). 

- *ta* (C): air temperature.
- *rh* (%): relative humidity.
- *vel* (m/s): air velocity.
- *met* (met): metabolic rate.
- *clo* (clo): clothing level.

Running locally (advanced)
========================
For those that want to work with the source code or run the tool locally, start by cloning this repo:

    git clone https://github.com/centerforthebuiltenvironment/mrt.git
    cd mrt

Initialize and update submodules:

    git submodule init
    git submodule update

Open index.html in a browser with WebGL, such as the latest version of Chrome.
