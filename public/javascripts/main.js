import Map from "https://js.arcgis.com/4.23/@arcgis/core/Map.js";
import MapView from "https://js.arcgis.com/4.23/@arcgis/core/views/MapView.js";
import Legend from "https://js.arcgis.com/4.23/@arcgis/core/widgets/Legend.js";
import esriConfig from "https://js.arcgis.com/4.23/@arcgis/core/config.js";
import GeoJSONLayer from "https://js.arcgis.com/4.23/@arcgis/core/layers/GeoJSONLayer.js";
import Graphic from "https://js.arcgis.com/4.23/@arcgis/core/Graphic.js";

esriConfig.apiKey =
  "AAPK3bfe112d384e4764bb55ba884d5a5c249hBz6_CJFt44js9lBjUQLC1u8dyiac2N5Iw28TNSjmk5JYmUm7p3zf5dwT96D4SS";

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const queries = urlParams.get("queries");
const year_input = urlParams.get("year_input");

let pm25Data = {};
let graphic = {};

if (queries == "d") {
  pm25Data = (await getPM25point()).result;

  const area = (await getPM25point()).polygon.geometry;

  const fillSymbol = {
    type: "simple-fill", 
    color: [230, 249, 255, 0.5],
    outline: {
      color: [255, 0, 0],
      width: 1,
    },
  };

  graphic = new Graphic({
    geometry: area,
    symbol: fillSymbol,
  });


  console.log(area);
} else {
  pm25Data = await getPM25point();
}

const blob = await new Blob([JSON.stringify(pm25Data)], {
  type: "application/json",
});
const url = await URL.createObjectURL(blob);

const pm25config = {
  title: "PM 2.5 Info",
  content:
    "{Country}, {City} in {year} | PM25: {Pm25} | {Wbinc16_text}",
  fieldInfos: [
    {
      fieldName: "time",
      format: {
        dateFormat: "short-date-short-time",
      },
    },
  ],
};

const renderer = {
  type: "simple",
  field: "Pm25",
  symbol: {
    type: "simple-marker",
    color: [250, 250, 250],
    outline: {
      color: "white",
    },
  },

  visualVariables: [
    {
      type: "color",
      field: "Pm25",
      stops: [
        { value: 1, color: "#009966" },
        { value: 50, color: "#FFDE33" },
        { value: 100, color: "#FF9933" },
        { value: 150, color: "#CC0033" },
        { value: 200, color: "#660099" },
      ],
    },
  ],
};

const Layer = new GeoJSONLayer({
  url: url,
  copyright: "GIS ",
  popupTemplate: pm25config,
  renderer: renderer,
  orderBy: {
    field: "Pm25" * 0.1,
  },
});

const map = new Map({
  basemap: "arcgis-newspaper", 
  layers: [Layer],
});

const view = new MapView({
  map: map,
  center: [100.9925, 15.8700],
  zoom: 5, 
  container: "viewDiv",
  constraints: {
    snapToZoom: true,
    minZoom: 2,
  },
  extent: {
    spatialReference: 4326,
  },
});

view.ui.add(
  new Legend({
    view: view,
  }),
  "bottom-right"
);

view.graphics.add(graphic);

async function getPM25point() {
  try {
    if (queries === null && year_input === null) {
      const data = await axios.get("/pm25multipoint");
      return data.data.result;
    }
    else if (queries == "d") {
      const data = await axios.get(
        `/pm25multipoint?queries=${queries}&year_input=${year_input}`
      );
      return { result: data.data.result, polygon: data.data.polygon };
    }
    else {
      const data = await axios.get(
        `/pm25multipoint?queries=${queries}&year_input=${year_input}`
      );
      return data.data.result;
    }
  } catch (error) {
    return [];
  }
}
