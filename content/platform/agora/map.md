An interactive layered map built on the **MapLibre and Deck.gl** 3D map renderer, using **PMTiles** map tiles served from **Cloud CDN**.

## Displays

- Spacetime-H3 hexagon heatmaps at several resolutions.
- Candidate site markers.
- Model predictions over time.

## Data flow

```mermaid
flowchart LR
  CDN["Cloud CDN"] -->|"basemap PMTiles"| ML["MapLibre basemap"]
  RA["Report agent"] -->|"MapLayer JSON"| ST[("Project store: reports")]
  ST -->|"GET layers, with token"| LS["Layer store in browser"]
  LS --> DK["deck.gl layers"]
  TS["Time slider"] --> DK
  DK --> ML
  DK -->|"click a cell"| TT["Tooltip and evidence link"]
  TT --> RV["Report section"]
```

## UI components

- **Map canvas:** pan, zoom, tilt for 3D extruded hexagons.
- **Layer panel:** toggle and reorder layers, opacity slider.
- **Legend:** colour scale per layer, with units.
- **Time slider:** steps through time buckets and prediction horizons, with play.
- **Cell tooltip:** H3 cell values and a link to the evidence in the report.
- **Compare mode:** split view, for example today against a scenario.

## Software components

- **MapLibre GL JS** with the **pmtiles** protocol, **Protomaps** basemap.
- **deck.gl** `H3HexagonLayer` and `ScatterplotLayer`, via `@deck.gl/mapbox` overlay.
- **h3-js** for cell maths in the browser.

## Configuration and metadata

- Basemap PMTiles in a public Cloud Storage bucket behind Cloud CDN, cached 30 days. Holds no customer data.
- Project layers are never on the CDN; they come from Merlin with the user's token.
- Each `MapLayer`: ID, kind, H3 resolution, cell values, colour scale, legend, evidence IDs.

## Low-level design

```mermaid
classDiagram
  class LayeredMap {
    <<component>>
    +layers List~MapLayer~
    +time
  }
  class LayerPanel {
    <<component>>
  }
  class Legend {
    <<component>>
  }
  class TimeSlider {
    <<component>>
  }
  class CellTooltip {
    <<component>>
  }
  class LayerFactory {
    +toDeck(layer, time) DeckLayer
  }
  class useMapLayers {
    <<hook>>
    +layers
    +visible
    +toggle(id)
  }
  LayeredMap --> LayerPanel
  LayeredMap --> Legend
  LayeredMap --> TimeSlider
  LayeredMap --> CellTooltip
  LayeredMap --> LayerFactory
  LayeredMap --> useMapLayers
```

- `LayerFactory` turns each `MapLayer` kind into the right deck.gl layer, so new kinds are one new case.
