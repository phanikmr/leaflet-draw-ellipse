# leaflet-draw-ellipse

Adds support for drawing and editing ellipses in the Leaflet.draw plugin. 

From 
![Alt text](https://static.wixstatic.com/media/0efaf2_94a76b718ee24ca38b1fbf452b5427e9.png/v1/fill/w_243,h_67,al_c,usm_0.66_1.00_0.01/0efaf2_94a76b718ee24ca38b1fbf452b5427e9.png "BitsBlender") in association with 
![Alt text](http://employgoal-email3.com/js/company_logos/12/4d/28/124d289a739ba07ff2598f5b0137399c/wwwearccom.png "ARC Doc. Sol.") 

# Important
Leaflet.draw-ellipse 0.1.0+ requires 

+ [Leaflet 0.7](https://github.com/Leaflet/Leaflet/releases/tag/v0.7) or higher
+ [Leaflet.draw 0.2.4](https://github.com/Leaflet/Leaflet.draw/releases/tag/v0.2.4)
+ [Leaflet.ellipse](https://github.com/jdfergason/Leaflet.Ellipse)

## Usage

	<link rel="stylesheet" href="http://cdn.leafletjs.com/leaflet-0.7.2/leaflet.css" />
    <link rel="stylesheet" href="leaflet.draw.css" />
    <link rel="stylesheet" href="leaflet.draw-ellipse.css" />

	<script src="http://cdn.leafletjs.com/leaflet-0.7.2/leaflet.js"></script>
    <script src="leaflet.draw.js"></script>
    <script src="leaflet.ellipse.js"></script>
    <script src="leaflet.ellipse-draw.js"></script>

See [Leaflet.draw](https://github.com/Leaflet/Leaflet.draw#using) and [Leaflet.ellipse](https://github.com/jdfergason/Leaflet.Ellipse#usage).

## Options

You can configure the Leaflet.draw control by using the following options. They are the same as [CircleOptions](https://github.com/Leaflet/Leaflet.draw#circleoptions).

### EllipseOptions

| Option | Type | Default | Description
| --- | --- | --- | ---
| shapeOptions | [Leaflet Path options](http://leafletjs.com/reference.html#path-options) | [See code](https://github.com/Leaflet/Leaflet.draw/blob/master/src/draw/handler/Draw.Circle.js#L7) | The options used when drawing the ellipse on the map. 
| repeatMode | Bool | `false` | Determines if the draw tool remains enabled after drawing a shape.