"""
This code is used to calculate the values for the ASHREA 55 2017 standard.
This code uses as input the results from the MRT tool. In order to enable this feature, please set the variable output_data_for_ASHRAE_table to true.
Each time the code will run the MRT will output four files, each containing the following parameters: x, y, z (coordinates) and results of calculations (e.g. PMV)
The files will generally be saved automatically in the download folder. Copy and paste them in the directory ASHRAE 55 Tables/Output_MRT_tool.
Then run the code below

@author Federico Tartarini <federico.tartarini@bears-berkeley.sg>
"""

import pandas as pd
import glob
import os
import matplotlib.pyplot as plt
from pprint import pprint


def interpolation(data_frame, value=7.5, axis='x', variable='PMV'):
    """This functions interpolates between two array, it is used to calculate the value of PMV in the center of the room"""
    unique_values = data_frame[axis].unique()  # get the coordinates in the axis
    upper = [x for x in unique_values if x > value][0]  # find the closest values to the one selected
    lower = [x for x in unique_values if x < value][-1]
    array_upper = data_frame.loc[data_frame[axis] == upper, variable]  # extract the two arrays that will be used to calculate the interpolated values
    array_lower = data_frame.loc[data_frame[axis] == lower, variable]
    result = []
    for y_low, y_up in zip(array_lower, array_upper):
        result.append((value - upper) / (lower - upper) * (y_low - y_up) + y_up)

    return result  # return results of interpolation


plt.close('all')

# directory containing input files
dir_files = os.path.join(os.getcwd(), 'ASHRAE 55 Tables', 'Output MRT tool')
variable_of_interest = 'PMV'
axis_along_which_window_is_installed = 'x'
center_of_the_wall = 7.5  # value in meters

# check how many calculaitons where performed, for each set of input 4 files are outputted by the code
runs = []
for file in glob.glob(os.path.join(dir_files, "*.txt")):
    runs.append(file.split('_', 2)[2].split('.txt')[0])
runs = set(runs)

# store all the results in one single Pandas data frame
df_runs = pd.DataFrame()
for run in runs:
    df_run = pd.DataFrame()
    for ix, file in enumerate(glob.glob(os.path.join(dir_files, f"*{run}.txt"))):
        df = pd.read_csv(os.path.join(dir_files, file), sep=',', header=None).transpose()
        if ix == 0:
            df_run[file.split('_')[1]] = df.values[:, 0]
        else:
            df_run[file.split('_')[1]] = df.values

        df_run['Run'] = file.split('_', 2)[2].split('.txt')[0]
    df_runs = df_runs.append(df_run)

# plt the results and calculate the minimum distance from the window. this value is calculated in the center of the room
cm = plt.cm.get_cmap('RdYlBu_r')
results = dict()
for run in runs:
    df_results = pd.DataFrame()
    df_run = df_runs[df_runs.Run == run]

    df_results[variable_of_interest] = interpolation(df_run, value=center_of_the_wall, axis=axis_along_which_window_is_installed, variable=variable_of_interest)
    df_results['distance'] = df_run.z.unique()
    df_results['x'] = center_of_the_wall

    plt.figure()
    sc = plt.scatter(x=df_run.x, y=df_run.z, c=df_run.PMV, cmap=cm, vmin=0.501, vmax=0.7, marker='s', s=150)
    plt.scatter(x=df_results['x'], y=df_results['distance'], c=df_results[variable_of_interest], cmap=cm, vmin=0.5, vmax=0.7, marker='s', s=150)
    plt.ylim(0, 5)
    plt.colorbar(sc, extend='both')
    plt.title(run)
    plt.savefig(os.path.join(os.getcwd(), 'ASHRAE 55 Tables', 'Figures', f'{run}.png'), dpi=300)
    plt.close('all')

    # calculate the min distance from the wall
    min_distance = df_results.loc[df_results[variable_of_interest] <= 0.5, 'distance'].min()
    results[run] = round(min_distance, 2)

pprint(results)

# save results in a cvs
df_min_distances = pd.DataFrame([results]).T.reset_index()
df_min_distances['fbes'] = df_min_distances['index'].str.split('_', expand=True)[1]
df_min_distances['posture'] = df_min_distances['index'].str.split('_', expand=True)[3]
df_min_distances['winTemp'] = df_min_distances['index'].str.split('_', expand=True)[5]
df_min_distances['tsol'] = df_min_distances['index'].str.split('_', expand=True)[7]
df_min_distances.drop(columns=['index'], inplace=True)
df_min_distances.rename(columns={0: 'Min Distance [m]'}, inplace=True)
df_min_distances.to_csv('results_min_distances.csv', index=False)
