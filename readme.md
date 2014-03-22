# vi-analytics #

vi-analytics aims to understand how users behave when learning or working with interactive videos. Therefore I consider individual users as well group interactions. 
For that purposes vi-analytics combines a bunch of tools to analyse user behavior and video usage from log files. The library is written for node.js. 
Video usage mining techniques can be applied in order to generate D3.js visualizations. 


## Use Cases ##

- what parts of an video have been whatched how often and by whom?
- what learning paths can be found within a collection of videos?
- what usage patterns appear regarding a single video?
- Analyse effectiv group interactions in collaborative learning scenarios.
Calvani, A., Fini, A., Molino, M., & Ranieri, M. (2010). Visualizing and monitoring effective interactions in online collaborative groups. British Journal of Educational Technology, 41(2), 213–226. doi:10.1111/j.1467-8535.2008.00911.x

So fare this library has been used to analyses a few field studies:
- IWRM education
- CSCL-Scripts for Peer Assessment and Peer Annotation in a video-based Learning Environment
- Comparison of open and script-based collaboration in a video-based Learning Environment

### Demo ###
comming soon 

## Installation ##
Dependencies:
- gauss
- fs
- csv

Run:
```
node vi-analytics.js
```
## Manual ##
(comming soon)

1. Read logdata from csv. Therefore the csv field need to be manually mapped to the purposes JSON keys. 

2. Data Preparation 

3. Visualize the output as SVG by using D3.js



Structure of a typical csv input:
```
...
```

JSON data model for further procedures:
```
							utc: // [integer] unix time stamp, 
							date: // pre-calculated date for faster processing 
							time: 
							ip: // user IP address 
							location: // [object] derived location   
								{...}
							video: // [string] 
							group: [integer] 
							user: [integer] 
							action: [string], 
							action_details: [object] 
								{command:'', value:'', referring:''}, // xxx
							user_agent: [string];
```

### Function reference ###
...


## Included D3 Plots##
- CORDTRA diagram
- ...


## Road Map ##
- fully include gauss package
- csv data consistency check
- Include meta data descriptors for data sets in order to pre pare them for publishing in open science data shops
- UI 
* uploading data sets 
* mapping from csv to JSON
* select analyses procedures
- mboston like output of rendered D3/SVG graphics including a general and specific description of the plot type and visualized data
 
