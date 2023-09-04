# OpenLayers Data

This repository includes data used for examples hosted at openlayers.org.  The contents of the `docs` directory in this repo will be published at http://openlayers.org/data/.

When adding new GeoJSON data, use the `scripts/tidy.js` script to tidy up the data first.

For example, to remove all the properties, ensure that polygon rings are properly oriented, and to limit coordinate precision:

```bash
npm install
node scripts/tidy.js --input path/to/downloaded/input.json --properties '' > docs/vector/output.json
```

## https://openlayers.org/data/vector/ecoregions.json

RESOLVE Ecoregions 2017

 * [Report](https://academic.oup.com/bioscience/article/67/6/534/3102935)
 * [Original with properties](https://storage.googleapis.com/teow2016/Ecoregions2017.zip)
 * [Simplified without properties](https://ecoregions.appspot.com/ecoregions2017c.json)

### Terms of Use

This dataset is licensed under [CC-BY 4.0](https://creativecommons.org/licenses/by/4.0/).

## https://openlayers.org/data/vector/us-states.json

United States boundaries.  Downloaded from https://github.com/PublicaMundi/MappingAPI.

## https://openlayers.org/data/vector/ocean.json

Ocean polygons.  Downloaded from http://geojson.xyz/ (https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_ocean.geojson).  Processed to limit precision, wind rings following the right-hand rule, and remove properties.
