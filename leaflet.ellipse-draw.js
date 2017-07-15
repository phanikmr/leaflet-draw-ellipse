/*
	Leaflet.draw-ellipse, a plugin that adds ellipse drawing and editing tools to Leaflet powered maps.
	(c) 2017, Phani Kumar Palaparthi

	https://github.com/phanikmr/leaflet-draw-ellipse
	https://github.com/Leaflet/Leaflet.draw
	http://leafletjs.com
	https://github.com/phanikmr
*/
(function(window, document, undefined) {
    /*
     * Leaflet.draw-ellipse assumes that you have already included the Leaflet, Leaflet-draw, and Leaflet-ellipse libraries.
     */

    L.drawLocal.draw.toolbar.buttons.ellipse = 'Draw an ellipse';

    L.drawLocal.draw.handlers.ellipse = {
        tooltip: {
            start: 'Click and drag to draw ellipse.'
        },
        radius: 'Radius'
    };

    L.SimpleShape = {};
    /**
     * @class L.Draw.SimpleShape
     * @aka Draw.SimpleShape
     * @inherits L.Draw.Feature
     */
    L.Draw.SimpleShape = L.Draw.Feature.extend({
        options: {
            repeatMode: false
        },

        // @method initialize(): void
        initialize: function(map, options) {
            this._endLabelText = L.drawLocal.draw.handlers.simpleshape.tooltip.end;

            L.Draw.Feature.prototype.initialize.call(this, map, options);
        },

        // @method addHooks(): void
        // Add listener hooks to this handler.
        addHooks: function() {
            L.Draw.Feature.prototype.addHooks.call(this);
            if (this._map) {
                this._mapDraggable = this._map.dragging.enabled();

                if (this._mapDraggable) {
                    this._map.dragging.disable();
                }

                //TODO refactor: move cursor to styles
                this._container.style.cursor = 'crosshair';

                this._tooltip.updateContent({ text: this._initialLabelText });

                this._map
                    .on('mousedown', this._onMouseDown, this)
                    .on('mousemove', this._onMouseMove, this)
                    .on('touchstart', this._onMouseDown, this)
                    .on('touchmove', this._onMouseMove, this);
            }
        },

        // @method removeHooks(): void
        // Remove listener hooks from this handler.
        removeHooks: function() {
            L.Draw.Feature.prototype.removeHooks.call(this);
            if (this._map) {
                if (this._mapDraggable) {
                    this._map.dragging.enable();
                }

                //TODO refactor: move cursor to styles
                this._container.style.cursor = '';

                this._map
                    .off('mousedown', this._onMouseDown, this)
                    .off('mousemove', this._onMouseMove, this)
                    .off('touchstart', this._onMouseDown, this)
                    .off('touchmove', this._onMouseMove, this);

                L.DomEvent.off(document, 'mouseup', this._onMouseUp, this);
                L.DomEvent.off(document, 'touchend', this._onMouseUp, this);

                // If the box element doesn't exist they must not have moved the mouse, so don't need to destroy/return
                if (this._shape) {
                    this._map.removeLayer(this._shape);
                    delete this._shape;
                }
            }
            this._isDrawing = false;
        },

        _getTooltipText: function() {
            return {
                text: this._endLabelText
            };
        },

        _onMouseDown: function(e) {
            this._isDrawing = true;
            this._startLatLng = e.latlng;
            this._startLatLngCopy = e.latlng;
            this._xlatlng = L.latLng(e.latlng.lat, 0);
            this._ylatlng = L.latLng(0, e.latlng.lng);
            L.DomEvent
                .on(document, 'mouseup', this._onMouseUp, this)
                .on(document, 'touchend', this._onMouseUp, this)
                .preventDefault(e.originalEvent);
        },

        _onMouseMove: function(e) {
            var latlng = e.latlng;

            this._tooltip.updatePosition(latlng);
            if (this._isDrawing) {
                this._tooltip.updateContent(this._getTooltipText());
                this._drawShape(latlng);
            }
        },

        _onMouseUp: function() {
            if (this._shape) {
                this._fireCreatedEvent();
            }

            this.disable();
            if (this.options.repeatMode) {
                this.enable();
            }
        }
    });

    L.Draw.Ellipse = L.Draw.SimpleShape.extend({
        statics: {
            TYPE: 'ellipse'
        },

        options: {
            shapeOptions: {
                stroke: true,
                color: '#3388ff',
                weight: 4,
                opacity: 0.5,
                fill: true,
                fillColor: null, //same as color by default
                fillOpacity: 0.2,
                clickable: true
            },
            showRadius: true,
            // metric: true, // Whether to use the metric measurement system or imperial
            // feet: true, // When not metric, use feet instead of yards for display
            // nautic: false // When not metric, not feet use nautic mile for display
        },

        // @method initialize(): void
        initialize: function(map, options) {
            // Save the type so super can fire, need to do this as cannot do this.TYPE :(
            this.type = L.Draw.Ellipse.TYPE;
            this._initialLabelText = L.drawLocal.draw.handlers.ellipse.tooltip.start;
            L.Draw.SimpleShape.prototype.initialize.call(this, map, options);
            var radius;
        },

        _drawShape: function(latlng) {
            let curent_x = L.latLng(latlng.lat, 0);
            let current_y = L.latLng(0, latlng.lng);
            radius = [this._ylatlng.distanceTo(current_y), this._xlatlng.distanceTo(curent_x)];
            if (!this._shape) {
                this._shape = new L.Ellipse(this._startLatLng, radius, 0, this.options.shapeOptions);
                this._map.addLayer(this._shape);
            } else {
                this._shape.setRadius(radius);
            }
        },

        _fireCreatedEvent: function() {
            var ellipse = new L.Ellipse(this._startLatLng, [this._shape._mRadiusX, this._shape._mRadiusY], 0, this.options.shapeOptions);
            L.Draw.SimpleShape.prototype._fireCreatedEvent.call(this, ellipse);
        },

        _onMouseMove: function(e) {
            var latlng = e.latlng,
                showRadius = this.options.showRadius,
                useMetric = this.options.metric;

            this._tooltip.updatePosition(latlng);
            if (this._isDrawing) {
                this._drawShape(latlng);
                let curent_x = L.latLng(latlng.lat, 0);
                let current_y = L.latLng(0, latlng.lng);
                radius = [this._ylatlng.distanceTo(current_y), this._xlatlng.distanceTo(curent_x)];
                this._tooltip.updateContent({
                    text: this._endLabelText,
                    subtext: showRadius ? L.drawLocal.draw.handlers.ellipse.radius + ': ' + L.GeometryUtil.readableDistance(radius[0], useMetric) + "  " + L.GeometryUtil.readableDistance(radius[1], useMetric) : ''
                });
            }
        }
    });

    L.Edit = L.Edit || {};

    L.Edit.Ellipse = L.Edit.SimpleShape.extend({
        options: {
            moveIcon: new L.DivIcon({
                iconSize: new L.Point(8, 8),
                className: 'leaflet-div-icon leaflet-editing-icon leaflet-edit-move'
            }),
            resizeIcon: new L.DivIcon({
                iconSize: new L.Point(8, 8),
                className: 'leaflet-div-icon leaflet-editing-icon leaflet-edit-resize'
            }),
            rotateIcon: new L.DivIcon({
                iconSize: new L.Point(8, 8),
                className: 'leaflet-div-icon leaflet-editing-icon leaflet-edit-rotate'
            })
        },

        _initMarkers: function() {
            if (!this._markerGroup) {
                this._markerGroup = new L.LayerGroup();
            }

            // Create center marker
            this._createMoveMarker();

            // Create edge marker
            this._createResizeMarker();

            // Create rotate Marker();
            this._createRotateMarker();
        },

        _createMoveMarker: function() {
            var center = this._shape.getLatLng();

            this._moveMarker = this._createMarker(center, this.options.moveIcon);
        },

        _createResizeMarker: function() {
            var center = this._shape.getLatLng(),
                resizemarkerPointX1 = this._getResizeMarkerPointX1(center),
                resizemarkerPointX2 = this._getResizeMarkerPointX2(center),
                resizemarkerPointY1 = this._getResizeMarkerPointY1(center),
                resizemarkerPointY2 = this._getResizeMarkerPointY2(center);

            this._resizeMarkers = [];
            this._resizeMarkers.push(this._createMarker(resizemarkerPointX1, this.options.resizeIcon));
            this._resizeMarkers.push(this._createMarker(resizemarkerPointX2, this.options.resizeIcon));
            this._resizeMarkers.push(this._createMarker(resizemarkerPointY1, this.options.resizeIcon));
            this._resizeMarkers.push(this._createMarker(resizemarkerPointY2, this.options.resizeIcon));
            this._resizeMarkers[0]._isX = true;
            this._resizeMarkers[1]._isX = true;
            this._resizeMarkers[2]._isX = false;
            this._resizeMarkers[3]._isX = false;
        },

        _createRotateMarker: function() {
            var center = this._shape.getLatLng(),
                rotatemarkerPoint = this._getRotateMarkerPoint(center);

            this._rotateMarker = this._createMarker(rotatemarkerPoint, this.options.rotateIcon);
        },

        _getResizeMarkerPointX1: function(latlng) {
            var tilt = 0;
            var radius = this._shape._radiusX;
            var xDelta = radius * Math.cos(tilt);
            var yDelta = radius * Math.sin(tilt);
            var point = this._map.project(latlng);
            return this._map.unproject([point.x + xDelta, point.y + yDelta]);
        },

        _getResizeMarkerPointX2: function(latlng) {
            var tilt = 0;
            var radius = this._shape._radiusX;
            var xDelta = radius * Math.cos(tilt);
            var yDelta = radius * Math.sin(tilt);
            var point = this._map.project(latlng);
            return this._map.unproject([point.x - xDelta, point.y - yDelta]);
        },

        _getResizeMarkerPointY1: function(latlng) {
            var tilt = 0;
            var radius = this._shape._radiusY;
            var xDelta = radius * Math.sin(tilt);
            var yDelta = radius * Math.cos(tilt);
            var point = this._map.project(latlng);
            return this._map.unproject([point.x - xDelta, point.y + yDelta]);
        },

        _getResizeMarkerPointY2: function(latlng) {
            var tilt = 0;
            var radius = this._shape._radiusY;
            var xDelta = radius * Math.sin(tilt);
            var yDelta = radius * Math.cos(tilt);
            var point = this._map.project(latlng);
            return this._map.unproject([point.x + xDelta, point.y - yDelta]);
        },

        _getRotateMarkerPoint: function(latlng) {
            var tilt = 0;
            var radius = this._shape._radiusX + 20;
            var xDelta = radius * Math.cos(tilt);
            var yDelta = radius * Math.sin(tilt);
            var point = this._map.project(latlng);
            return this._map.unproject([point.x - xDelta, point.y - yDelta]);
        },

        _onMarkerDragStart: function(e) {
            L.Edit.SimpleShape.prototype._onMarkerDragStart.call(this, e);
            this._currentMarker = e.target;
        },

        _onMarkerDrag: function(e) {
            var marker = e.target,
                latlng = marker.getLatLng();

            if (marker === this._moveMarker) {
                this._move(latlng);
            } else if (marker === this._rotateMarker) {
                this._rotate(latlng);
            } else {
                this._resize(latlng);
            }

            this._shape.redraw();
        },

        _move: function(latlng) {
            // Move the ellipse
            this._shape.setLatLng(latlng);

            // Move the resize marker
            this._repositionResizeMarkers();

            // Move the rotate marker
            this._repositionRotateMarker();
        },

        _rotate: function(latlng) {
            var moveLatLng = this._moveMarker.getLatLng();
            var point = this._map.project(latlng);
            var movePoint = this._map.project(moveLatLng);
            var xLatLng = this._map.unproject([point.x, movePoint.y]);
            var radius = moveLatLng.distanceTo(latlng);
            var xDelta = moveLatLng.distanceTo(xLatLng);

            if (movePoint.y.toFixed(1) === point.y.toFixed(1)) {
                var tilt = 0;
                // Rotate the ellipse
                this._shape.setTilt(tilt);
            } else if (movePoint.x.toFixed(1) === point.x.toFixed(1)) {
                var tilt = 90;
                // Rotate the ellipse
                this._shape.setTilt(tilt);
            } else if (xDelta < radius) {
                var tilt = Math.acos(xDelta / radius) * L.LatLng.RAD_TO_DEG;
                if (point.x > movePoint.x) {
                    tilt = 180 - tilt;
                }
                if (point.y > movePoint.y) {
                    tilt = -1 * tilt;
                }
                // Rotate the ellipse
                this._shape.setTilt(tilt);
            }

            // Move the resize marker
            this._repositionResizeMarkers();

            // Move the rotate marker
            this._repositionRotateMarker();
        },

        _resize: function(latlng) {
            var moveLatLng = this._moveMarker.getLatLng();
            var radius = moveLatLng.distanceTo(latlng);
            if (this._currentMarker._isX) {
                this._shape.setRadius([radius, this._shape._mRadiusY]);
            } else {
                this._shape.setRadius([this._shape._mRadiusX, radius]);
            }

            // Move the resize marker
            this._repositionResizeMarkers();
            // Move the rotate marker
            this._repositionRotateMarker();
        },

        _repositionResizeMarkers: function() {
            var latlng = this._moveMarker.getLatLng();
            var resizemarkerPointX1 = this._getResizeMarkerPointX1(latlng);
            var resizemarkerPointX2 = this._getResizeMarkerPointX2(latlng);
            var resizemarkerPointY1 = this._getResizeMarkerPointY1(latlng);
            var resizemarkerPointY2 = this._getResizeMarkerPointY2(latlng);

            this._resizeMarkers[0].setLatLng(resizemarkerPointX1);
            this._resizeMarkers[1].setLatLng(resizemarkerPointX2);
            this._resizeMarkers[2].setLatLng(resizemarkerPointY1);
            this._resizeMarkers[3].setLatLng(resizemarkerPointY2);
        },

        _repositionRotateMarker: function() {
            var latlng = this._moveMarker.getLatLng();
            var rotatemarkerPoint = this._getRotateMarkerPoint(latlng);

            this._rotateMarker.setLatLng(rotatemarkerPoint);
        }
    });

    L.Ellipse.addInitHook(function() {
        if (L.Edit.Ellipse) {
            this.editing = new L.Edit.Ellipse(this);

            if (this.options.editable) {
                this.editing.enable();
            }
        }

        this.on('add', function() {
            if (this.editing && this.editing.enabled()) {
                this.editing.addHooks();
            }
        });

        this.on('remove', function() {
            if (this.editing && this.editing.enabled()) {
                this.editing.removeHooks();
            }
        });
    });

    L.DrawToolbar.addInitHook(function() {
        this.options.ellipse = {};
        this.getModeHandlers = function(map) {
            return [{
                    enabled: this.options.polyline,
                    handler: new L.Draw.Polyline(map, this.options.polyline),
                    title: L.drawLocal.draw.toolbar.buttons.polyline
                },
                {
                    enabled: this.options.polygon,
                    handler: new L.Draw.Polygon(map, this.options.polygon),
                    title: L.drawLocal.draw.toolbar.buttons.polygon
                },
                {
                    enabled: this.options.rectangle,
                    handler: new L.Draw.Rectangle(map, this.options.rectangle),
                    title: L.drawLocal.draw.toolbar.buttons.rectangle
                },
                {
                    enabled: this.options.circle,
                    handler: new L.Draw.Circle(map, this.options.circle),
                    title: L.drawLocal.draw.toolbar.buttons.circle
                },
                {
                    enabled: this.options.marker,
                    handler: new L.Draw.Marker(map, this.options.marker),
                    title: L.drawLocal.draw.toolbar.buttons.marker
                },
                {
                    enabled: this.options.ellipse,
                    handler: new L.Draw.Ellipse(map, this.options.ellipse),
                    title: L.drawLocal.draw.toolbar.buttons.ellipse
                }
            ];
        };
    });


}(window, document));