"use strict";

/// <reference path="../bin/openrct2.d.ts" />

var downCoord;
var currentCoord;

function selectTheMap() {
    var left = Math.min(downCoord.x, currentCoord.x);
    var right = Math.max(downCoord.x, currentCoord.x);
    var top = Math.min(downCoord.y, currentCoord.y);
    var bottom = Math.max(downCoord.y, currentCoord.y);
    ui.tileSelection.range = {
        leftTop: { x: left, y: top },
        rightBottom: { x: right, y: bottom }
    };
}

function changeVandalism(x, y, fix) {
    var tile = map.getTile(x, y);
    if (tile) {
        for (var i = 0; i < tile.numElements; i++) {
            var element = tile.getElement(i);
            if (element && element.type == "footpath") {
                element.isAdditionBroken = fix;
            }
        }
    }
}

function fixVandalism() {
    var left = Math.min(downCoord.x, currentCoord.x);
    var right = Math.max(downCoord.x, currentCoord.x);
    var top = Math.min(downCoord.y, currentCoord.y);
    var bottom = Math.max(downCoord.y, currentCoord.y);
    for (var x = left; x <= right; x += 32) {
        for (var y = top; y <= bottom; y += 32) {
            changeVandalism(x / 32, y / 32, false);
        }
    }
}

function breakVandalism() {
    var left = Math.min(downCoord.x, currentCoord.x);
    var right = Math.max(downCoord.x, currentCoord.x);
    var top = Math.min(downCoord.y, currentCoord.y);
    var bottom = Math.max(downCoord.y, currentCoord.y);
    for (var x = left; x <= right; x += 32) {
        for (var y = top; y <= bottom; y += 32) {
            changeVandalism(x / 32, y / 32, true);
        }
    }
}

function breakEverything() {
    for (var x = 0; x < map.size.x; x += 1) {
        for (var y = 0; y < map.size.y; y += 1) {
            changeVandalism(x, y, true);
        }
    }
}

function fixEverything() {
    for (var x = 0; x < map.size.x; x += 1) {
        for (var y = 0; y < map.size.y; y += 1) {
            changeVandalism(x, y, false);
        }
    }
}

function vandalismFixerTool(isBroken) {
    ui.activateTool({
        id: "vandalism-manager-tool",
        cursor: "cross_hair",
        onStart: function onStart(e) {
            ui.mainViewport.visibilityFlags |= 1 << 7;
        },
        onDown: function onDown(e) {
            downCoord = e.mapCoords;
            currentCoord = e.mapCoords;
        },
        onMove: function onMove(e) {
            if (e.mapCoords.x != 0 || e.mapCoords.y != 0) {
                if (e.isDown) {
                    currentCoord = e.mapCoords;
                    selectTheMap();
                } else {
                    downCoord = e.mapCoords;
                    currentCoord = e.mapCoords;
                    selectTheMap();
                }
            }
        },
        onUp: function onUp(e) {
            if (!isBroken) {
                fixVandalism();
            } else {
                breakVandalism();
            }
            ui.tileSelection.range = null;
        },
        onFinish: function onFinish() {
            ui.tileSelection.range = null;
            ui.mainViewport.visibilityFlags &= ~(1 << 7);
        }
    });
}

var main = function main() {
    if (typeof ui === 'undefined') {
        return;
    }
    var window = null;
    ui.registerMenuItem("Vandalism Manager", function () {
        if (ui.tool && ui.tool.id == "vandalism-manager-tool") {
            ui.tool.cancel();
        } else {
            if (window == null) {
                var width = 220;
                var buttonWidth = 100;
                window = ui.openWindow({
                    classification: 'park',
                    title: "Vandalism Manager",
                    width: width,
                    height: 120,
                    widgets: [{
                        type: 'label',
                        name: 'label-description',
                        x: 3,
                        y: 23,
                        width: width - 6,
                        height: 26,
                        text: "Modify vandalism throughout the park."
                    }, {
                        type: 'button',
                        name: "button-cancel",
                        x: width - buttonWidth - 3,
                        y: 100,
                        width: buttonWidth,
                        height: 16,
                        text: "Cancel",
                        onClick: function onClick() {
                            if (window != null) window.close();
                        }
                    }, {
                        type: 'button',
                        name: "button-break-everything",
                        x: 3,
                        y: 40,
                        width: buttonWidth,
                        height: 16,
                        text: "Fix Everything",
                        onClick: function onClick() {
                            if (ui.tool && ui.tool.id == "vandalism-manager-tool") {
                                ui.tool.cancel();
                            }
                            fixEverything();
                        }
                    }, {
                        type: 'button',
                        name: "button-fix-everything",
                        x: width - buttonWidth - 3,
                        y: 40,
                        width: buttonWidth,
                        height: 16,
                        text: "Break Everything",
                        onClick: function onClick() {
                            if (ui.tool && ui.tool.id == "vandalism-manager-tool") {
                                ui.tool.cancel();
                            }
                            breakEverything();
                        }
                    }, {
                        type: 'button',
                        name: "button-fix-selection",
                        x: 3,
                        y: 60,
                        width: buttonWidth,
                        height: 16,
                        text: "Fix Selection",
                        onClick: function onClick() {
                            if (ui.tool && ui.tool.id == "vandalism-manager-tool") {
                                ui.tool.cancel();
                            }
                            vandalismFixerTool(false);
                        }
                    }, {
                        type: 'button',
                        name: "button-break-selection",
                        x: width - buttonWidth - 3,
                        y: 60,
                        width: buttonWidth,
                        height: 16,
                        text: "Break Selection",
                        onClick: function onClick() {
                            if (ui.tool && ui.tool.id == "vandalism-manager-tool") {
                                ui.tool.cancel();
                            }
                            vandalismFixerTool(true);
                        }
                    }],
                    onClose: function onClose() {
                        window = null;
                        if (ui.tool && ui.tool.id == "vandalism-manager-tool") {
                            ui.tool.cancel();
                        }
                    }
                });
            } else {
                window.bringToFront();
            }
        }
    });
};

registerPlugin({
    name: 'Vandalism Manager',
    version: '0.0.2',
    authors: ['Rachael Gentry'],
    type: 'remote',
    main: main
});
