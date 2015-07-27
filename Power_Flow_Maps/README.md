# Power Flow Maps
## Mapping import-export flows between countries with GeoJSON/topoJSON in Lumira

*The code in this repository is provided as-is. This uses a require.js trick to pull in the external libraries that is no longer recommended. Development of extensions is moving from VizPacker to WebIDE with its own conventions. Note also that this pulls in d3_v3, which given your Lumira version (and VizPacker/WebIDE) may no longer be necessary. *

The code and supporting files in this branch are further documented in this [SCN article](http://scn.sap.com/community/lumira/blog/2015/05/21/mapping-import-export-flows-between-countries-with-geojsontopojson-in-lumira), where you will find a walk-through of some tricky aspects of the code, as well as how  require.js was used to pull in external libraries like GeoJSON and topoJSON, as well as the map itself. It also pulls in D3_v3 since topojson requires it, and when this was first built Lumira still used d3_v2. Most likely, you can remove this library from the require config.

Mapping data to maps in my opinion is very much tied to the data set, so I would strongly encourage to look at the code, rather than try to just reuse the extension as-is, and modify it so it works for you. As you can see from the article, the vizualization piece is quite generic, and I built a world map of migration flows mostly by changing the map file and some colors, modified the legend a bit, etc. There is likely room for improvement in this code as well, as this was one of my first attempts at geojson/topojson. However, most of this code should be re-usable, and certainly should be able to illustrate how to use geojson/topojson in Lumira extensions.

## Map file
The easiest way I found to pull in this map JSON file was to assign the data in it to a variable in the file, rename the JSON file to a JavaScript file, then call that variable. You can likely also just pull in the JSON, but this worked well, so I left it that way. Of course, you can generate maps of different parts of the world, so you're not restricted to just middle-Europe by any means. As the blog article shows, I reused this code easily to create a world map.

## File Structure
I built this within the Lumira folder structure: Inside the Lumira Desktop folder, I created a folder called "tests". In this, I dropped an "empty" VizPacker project after setting up canvas, data file, etc. then copy that into this tests folder. Within this I have:
- comsapsvcseuropowermap
  - bundles
    - comsapsvcseuropowermap
      - comsapsvcseuropowermap-src
        - js
          - dataMapping.js
          - flow.js
          - module.js
          - render.js
        - resources
          - templates
            - ...
        - style
          - default.css
      - libs
        - d3.v3.js
        - mideurope.json.js
        - topojson.v1.min.js
      - comsapsvcseuropowermap-bundle.js
  - examples
    - example-comsapsvcseuropowermap.html
  - features
    - comsapsvcseuropowermap
      - comsapsvcseuropowermap-feature.json


## Resources
- Blog [SCN: Mapping import-export flows between countries with GeoJSON/topoJSON in Lumira](http://scn.sap.com/community/lumira/blog/2015/05/21/mapping-import-export-flows-between-countries-with-geojsontopojson-in-lumira)
