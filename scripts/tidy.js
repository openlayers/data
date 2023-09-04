import esMain from 'es-main';
import yargs from 'yargs';
import {each} from 'geofunc';
import {hideBin} from 'yargs/helpers';
import {readFile} from 'node:fs/promises';

/**
 * @param {Array<import("geojson").Position>} ring The ring to rewind.
 * @param {boolean} clockwise Wind the ring clockwise.
 *
 * Borrowed from https://github.com/mapbox/geojson-rewind.
 */
function rewindRing(ring, clockwise) {
  let area = 0;
  let err = 0;
  for (let i = 0, len = ring.length, j = len - 1; i < len; j = i++) {
    const k = (ring[i][0] - ring[j][0]) * (ring[j][1] + ring[i][1]);
    const m = area + k;
    err += Math.abs(area) >= Math.abs(k) ? area - m + k : k - m + area;
    area = m;
  }
  if (area + err >= 0 !== clockwise) {
    ring.reverse();
  }
}

/**
 * @param {Array<Array<import("geojson").Position>>} rings The rings to rewind.
 */
function rewindRings(rings) {
  if (rings.length === 0) {
    return;
  }

  rewindRing(rings[0], false);
  for (let i = 1; i < rings.length; i++) {
    rewindRing(rings[i], true);
  }
}

/**
 * @param {import("geojson").Polygon} polygon The Polygon to rewind.
 */
function rewindPolygon(polygon) {
  rewindRings(polygon.coordinates);
}

/**
 * @param {import("geojson").MultiPolygon} multi The MultiPolygon to rewind.
 */
function rewindMultiPolygon(multi) {
  for (const polygon of multi.coordinates) {
    rewindRings(polygon);
  }
}

/**
 * @param {number} n The input number.
 * @param {number} decimals The maximum number of decimal digits.
 * @return {number} The input number with a limited number of decimal digits.
 */
function toFixed(n, decimals) {
  const factor = Math.pow(10, decimals);
  return Math.round(n * factor) / factor;
}

/**
 * @param {number} decimals The maximum number of decimal digits.
 * @return {import("geofunc").CoordinateCallback} A callback that limits the number of digits.
 */
function limitPrecision(decimals) {
  return function (coordinate) {
    coordinate[0] = toFixed(coordinate[0], decimals);
    coordinate[1] = toFixed(coordinate[1], decimals);
  };
}

/**
 * @param {string} [include] The comma delimited list of properties to include.
 * @return {import("geofunc").Callback<import("geojson").Feature>|undefined} A callback that limits the feature properties.
 */
function limitProperties(include) {
  if (include === undefined) {
    return;
  }
  const includeSet = new Set();
  for (const value of include.split(',')) {
    includeSet.add(value.trim());
  }
  return function (feature) {
    const properties = feature.properties;
    if (!properties) {
      return;
    }
    for (const key in properties) {
      if (!includeSet.has(key)) {
        delete properties[key];
      }
    }
  };
}

/**
 * @typedef {Object} Options
 * @property {string} input Path to a GeoJSON file.
 * @property {number} precision The number of decimal digits to retain.
 * @property {string} [properties] The comma delimited list of properties to retain.
 */

/**
 * Tidy a GeoJSON file.
 * @param {Options} options The tidy options.
 */
async function main(options) {
  const input = await readFile(options.input, 'utf8');
  const data = JSON.parse(input);

  const tidy = each({
    Coordinate: limitPrecision(options.precision),
    Feature: limitProperties(options.properties),
    Polygon: rewindPolygon,
    MultiPolygon: rewindMultiPolygon,
  });
  tidy(data);

  const output = JSON.stringify(data);
  process.stdout.write(output + '\n');
}

if (esMain(import.meta)) {
  const options = yargs(hideBin(process.argv))
    .option('input', {
      describe: 'Path to a GeoJSON file',
      type: 'string',
    })
    .demandOption('input')
    .option('precision', {
      describe:
        'The number of decimal digits to retain.  Three digits is roughly 111 meters at the equator.',
      type: 'number',
      default: 3,
    })
    .option('properties', {
      describe:
        'A comma delimited list of properties to include.  To strip all properties, use --properties="".',
      type: 'string',
    })
    .parseSync();

  main(options).catch((err) => {
    process.stderr.write(`${err.stack}\n`, () => process.exit(1));
  });
}
