document.addEventListener('DOMContentLoaded', function () {
  var canvas = document.getElementById('gameScreen');

  Map('gameScreen');

  //console.log('Lets rock!');
});

var hex;



function ClickHandler(obj, cli, dbl) {
  var ctrl = (typeof obj == "string") ? document.getElementById(obj) : obj;
  var oneClick = (typeof oneClick == "function") ? cli : null;
  var twoClick = (typeof twoClick == "function") ? dbl : null;
  var clicking = false;
  var lastX = 0;
  var lastY = 0;

  if (typeof oneClick != "function" && typeof twoClick != "function") return;

  ctrl.addEventListener('mousedown', function (evt) {
    if (clicking && twoClick) {
      twoClick(evt);
      clicking = true;
    } else {
      // Enable the drag handler
      clicking = true;

      // Record the current mouse position
      lastX = evt.screenX;
      lastY = evt.screenY;

      // Set the time out to prevent double clicks
      setTimeout(function () {
        clicking = false;
      }, 500)
    }

    // Don't try to do other stuff
    evt.preventDefault();
  });

  window.addEventListener('mousemove', function (evt) {
    if (clicking) {
      if (Math.abs(evt.screenX - lastX) > 3 || Math.abs(evt.screenY - lastY) > 3) clicking = false;
    }
  });

  window.addEventListener('mouseup', function (evt) {
    if (clicking && oneClick) oneClick(evt);
  });
}

function DragHandler(obj, fun) {
  var ctrl = (typeof obj == "string") ? document.getElementById(obj) : obj;
  var listner = fun;
  var dragging = false;
  var lastX = 0;
  var lastY = 0;
  
  if (typeof listner != "function") return;

  ctrl.addEventListener('mousedown', function (evt) {
    // Enable the drag handler
    dragging = true;

    // Record the current mouse position
    lastX = evt.screenX;
    lastY = evt.screenY;

    // Don't try to do other stuff
    evt.preventDefault();
  });

  window.addEventListener('mousemove', function (evt) {
    if (dragging) {
      // How far have we moved
      var changeX = evt.screenX - lastX;
      var changeY = evt.screenY - lastY;
      
      // Update pointer location
      lastX = evt.screenX;
      lastY = evt.screenY;

      // Alert the handler of the change
      listner(changeX, changeY);
    }
  });

  window.addEventListener('mouseup', function (evt) {
    // Disable the drag handler
    dragging = false;
  });
}

/* Map size info
 *
 * Height: 300 chunks ( 6000 tiles)
 * Width:  500 chunks (10000 tiles)
 * 20 Bytes storage per tile
 * 1 GiB per Map tile info
 *
 * 2 Bytes - Terrain
 * 2 Byte  - Height
 * 2 Bytes - Foilage
 * 2 Byte  - Roads
 *           6 Bits - Connections
 *           4 Bits - Level (0 - 16)
 *           6 Bits - Reserved
 * 4 Bytes - Rivers
 *           6 Bits - Connections
 *           6 Bits - Flow
 *           6 Bits - Depth (0 - 63)
 *           10 Bits - Water Ammount
 *           4 Bits - Reserved
 * 4 Bytes - Owner ID
 * 2 Bytes - Soil Quality 
 *           1 Byte - Active Quality
 *           1 Byte - Base Quality
 * 2 Byte  - Unused
 */

var curMap;

function Map(ctrl) {
  var cv = (typeof ctrl == "string") ? document.getElementById(ctrl) : ctrl;
  var ctx = cv.getContext('2d');

  // Map rendering objects
  var hexSizes = [1, 2, 4, 6, 8, 10, 13, 16, 20, 25, 32, 40, 50, 62];
  var zoomLevel = 9;
  var mainMap = new MainMap(ctx, hexSizes[zoomLevel], 20, 960, 540);
  var localMap = new LocalMap(ctx, hexSizes[zoomLevel], 7, 960, 540);
  curMap = mainMap;
  
  // Map data
  var coordX = 0;
  var coordY = 0;

  var hexCoord = { 'x': 0, 'y': 0 };

  // Render
  function Render() {
    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.save();


    // Start the rendering

    curMap.render(hexCoord.x, hexCoord.y);
    
    // Debugging info
    ctx.fillStyle = "#000000";
    ctx.fillText("offX: " + curMap.offX(), 10, 10);
    ctx.fillText("offY: " + curMap.offY(), 10, 20);

    ctx.fillText("Coord X: " + coordX, 10, 40);
    ctx.fillText("Coord Y: " + coordY, 10, 50);

    ctx.fillText("HexX: " + hexCoord.x, 10, 70);
    ctx.fillText("HexY: " + hexCoord.y, 10, 80);

    ctx.fillText("Hex Size: " + zoomLevel, 10, 100);

    ctx.fillText("Hex oX: " + (hexCoord.oX | ""), 10, 120);
    ctx.fillText("Hex oY: " + (hexCoord.oY | ""), 10, 130);

    // We are done rendering
    ctx.restore();

    // Render the next frame when we are able to do such
    window.requestAnimationFrame(Render);
  }

  // Handle map movement
  function MapMove(changeX, changeY) {
    curMap.moveMap(changeX, changeY);
  }

  // Create the listners
  DragHandler(cv, MapMove);
  cv.addEventListener('mousemove', function (evt) {
    coordX = (evt.offsetX - curMap.offX());
    coordY = (evt.offsetY - curMap.offY());
    
    hexCoord = curMap.hexCoord(evt.offsetX, evt.offsetY);

  });

  cv.addEventListener('wheel', function (evt) {
    if (evt.deltaY > 0 && zoomLevel < hexSizes.length - 1) {
      hexSize = Math.floor(hexSizes[++zoomLevel]);
    } else if (evt.deltaY < 0 && zoomLevel > 1) {
      hexSize = Math.floor(hexSizes[--zoomLevel]);
    }

    curMap.setSize(hexSize);
  });

  // Start the render
  window.requestAnimationFrame(Render);
}

function MainMap(obj, hSize, cSize, cX, cY) {
  var hexSize = hSize;
  var chunkSize = cSize;
  var chunkMin = chunkSize - 1;
  var ctx = obj;
  var hex = new Hex(ctx, hexSize);

  var centerX = cX;
  var centerY = cY;

  var offX = centerX;
  var offY = centerY;

  var chunks = [{
    'x': 0,
    'y': 1
  }, {
    'x': 1,
    'y': 0
  }, {
    'x': -1,
    'y': 0
  }, {
    'x': 0,
    'y': 0
  }, {
    'x': 0,
    'y': -1
  }];

  var marker = { 'x': 0, 'y': 0 };
  var colors = [
    "#a20f98",
    "#370001",
    "#00a3d5",
    "#de7bc5",
    "#3d9565",
    "#9b835d",
    "#0f012c",
    "#f243ab",
    "#84dcfd",
    "#977d4e",
    "#5eda88",
    "#71aca4",
    "#ffdeba",
    "#cc27e2",
    "#9c96aa",
    "#789a15"
  ];

  function render(x, y) {
    // Render the loaded chunks
    for (var id = 0; id < chunks.length; id++) {
      chunkRender(id);
    }

    // Draw a marker to show the center of the map
    ctx.fillStyle = "#005500";
    ctx.fillRect(offX - 10, offY - 10, 20, 20);

    // Draw the marker to show the tile we are currently hovering over
    //ctx.fillStyle = "#0000bb";
    //hex.renderWide(offX + (x * hex.halfLong), offY + (y * hex.short) + (x % 2 ? hex.halfShort : 0));
    //ctx.stroke();
    //ctx.fill();

    // Test to ensure that we can turn hex coordinate into screen coordinate
    //ctx.fillStyle = "#000000";
    //marker = hex.hexTalltoXY(0, -2);
    //ctx.fillRect(offX - 10 + marker.x, offY - 10 + marker.y, 20, 20);


    // The center of the screen marker
    //ctx.fillStyle = "#003300";
    //ctx.fillRect(centerX - 10, centerY - 10, 20, 20);
  }

  function chunkRender(chunkNum) {
    var chunkX = (chunks[chunkNum].x * hex.short * chunkSize) + offX;
    var chunkY = (chunks[chunkNum].y * hex.halfLong * chunkSize) + offY;

    for (var row = 0, y = 0; row < chunkSize; row++, y += hex.halfLong) {
      for (var col = 0, x = (row  % 2) ? hex.halfShort : 0 ; col < chunkSize; col++, x += hex.short) {
        hex.renderTall(chunkX + x, chunkY + y);
        tileRender(chunkNum, col, row);
      }
    }
  }

  function tileRender(chunkNum, x, y) {
    // Temp code that draws a background and the hex's borders
    // Get the tile's color
    ctx.fillStyle = "#ffffff";
    ctx.fillStyle = colors[(chunkNum + x + (y * chunkSize)) % 16];

    ctx.fill()
    ctx.stroke();

    // TODO: Code that renders a tile
  }

  function hexCoord(x, y) {
    var coordX = (x - offX);
    var coordY = (y - offY);

    return hex.XYtoHexTall(coordX, coordY);
  }

  return {
    'render': render,
    'hexCoord': hexCoord,
    'setCenter': function (x, y) {
      // Update the x offset
      offX += x - centerX;
      centerX = x;

      // Update the y offset
      offY += y - centerY;
      centerY = y;
    },
    'setSize': function (newSize) {
      var ratio = newSize / hex.size;

      // Update the Hex
      hex.setSize(newSize);

      // TODO: Calculate the new offset
      offX = centerX - Math.round((centerX - offX) * ratio);
      offY = centerY - Math.round((centerY - offY) * ratio);
    },
    'moveMap': function (x, y) {
      offX += x;
      offY += y;
    },
    'offX': function () { return offX; },
    'offY': function () { return offY; },
    'hex': function () { return hex; }
  }
}

function LocalMap(obj, hSize, cSize, cX, cY) {
  var hexSize = hSize;
  var chunkSize = cSize;
  var chunkMin = chunkSize - 1;
  var ctx = obj;
  var hex = new Hex(ctx, hexSize);

  var centerX = cX;
  var centerY = cY;

  var offX = centerX;
  var offY = centerY;

  var chunkYOffset = function () {
    var offset = chunkSize - 1;
    var tmp = {};
    var max = chunkSize * 2;
    var limit = max - 1;
    var total = 0;

    tmp[-offset] = Math.floor((limit - 1 - Math.abs(offset)) / 2);

    for (var col = 1; col < max; col++) {
      total += limit - Math.abs(col - chunkSize);
      tmp[col - offset] = total;
      tmp[col - offset] += Math.floor((limit - 1 - Math.abs(col - offset)) / 2);
    }

    return tmp;
  }();

  var chunks = [{
    'x': 0,
    'y': 0,
    'data': [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0]
  }, {
    'x': -2,
    'y': 0,
    'data': [2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2]
  }, {
    'x': -1,
    'y': 0,
    'data': [4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4]
  }, {
    'x': -1,
    'y': -1,
    'data': [4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4]
  }, {
    'x': 2,
    'y': 0,
    'data': [4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4]
  }, {
    'x': 1,
    'y': 0,
    'data': [2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2]
  }, {
    'x': 1,
    'y': 1,
    'data': [2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2]
  }];

  var marker = { 'x': 0, 'y': 0 };
  var colors = [
    "#a20f98",
    "#370001",
    "#00a3d5",
    "#de7bc5",
    "#3d9565",
    "#9b835d",
    "#0f012c",
    "#f243ab",
    "#84dcfd",
    "#977d4e",
    "#5eda88",
    "#71aca4",
    "#ffdeba",
    "#cc27e2",
    "#9c96aa",
    "#789a15"
  ];

  function render(x, y) {
    // Render the loaded chunks
    for (var id = 0; id < chunks.length; id++) {
      chunkRender(id);
    }

    // Draw a marker to show the center of the map
    ctx.fillStyle = "#005500";
    ctx.fillRect(offX - 10, offY - 10, 20, 20);

    // Draw the marker to show the tile we are currently hovering over
    ctx.fillStyle = "#0000bb";
    hex.renderWide(offX + (x * hex.halfLong), offY + (y * hex.short) + (x % 2 ? hex.halfShort : 0));
    ctx.stroke();
    ctx.fill();

    marker = hex.hexWidetoXY(0, -2);

    ctx.fillStyle = "#003300";
    ctx.fillRect(offX - 10 + marker.x, offY - 10 + marker.y, 20, 20);


  }

  function chunkRender(chunkNum) {
    // TODO: Code that renders a chunk
    var tmpHexes = chunkSize - 1;

    var chunkX = (chunks[chunkNum].x * hex.halfLong * tmpHexes) + offX;
    var chunkY = ((chunks[chunkNum].y - (chunks[chunkNum].x % 2) / 2) * hex.short * tmpHexes * 3) + offY;

    for (var col = -tmpHexes, x = tmpHexes * (-hex.long / 2) ; col < chunkSize; col++, x += hex.halfLong) {
      var tmpMax = (Math.floor(-Math.abs(col) + .5) / 2) + chunkSize;
      var tmpMin = tmpMax - 1;
      for (var row = -tmpMin, y = -hex.short * tmpMin; row < tmpMax; row++, y += hex.short) {
        ctx.fillStyle = (Math.abs(col) == tmpHexes || Math.abs(row) == tmpMin) ? "#ffffff" : "#00cc00";
        hex.renderWide(chunkX + x, chunkY + y);
        tileRender(chunkNum, Math.ceil(row), col);
      }
    }
  }

  function tileRender(chunkNum, x, y) {
    // Temp code that draws a background and the hex's borders
    // Get the tile's color
    ctx.fillStyle = (ctx.fillStyle == "#ffffff") ? "#ffffff" : colors[chunks[chunkNum].data[chunkYOffset[y] + x]];

    ctx.fill()
    ctx.stroke();

    // TODO: Code that renders a tile
  }

  function hexCoord (x, y) {
    var coordX = (x - offX);
    var coordY = (y - offY);
      
    return hex.XYtoHexWide(coordX, coordY);
  }

  return {
    'render': render,
    'hexCoord': hexCoord,
    'setCenter': function (x, y) {
      // Update the x offset
      offX += x - centerX;
      centerX = x;

      // Update the y offset
      offY += y - centerY;
      centerY = y;
    },
    'setSize': function (newSize) {
      var ratio = newSize / hex.size;
      
      // Update the Hex
      hex.setSize(newSize);

      // TODO: Calculate the new offset
      offX = centerX - Math.round((centerX - offX) * ratio);
      offY = centerY - Math.round((centerY - offY) * ratio);
    },
    'moveMap': function (x, y) {
      offX += x;
      offY += y;
    },
    'offX': function () { return offX; },
    'offY': function () { return offY; },
    'hex': function () { return hex; }
  }
}

function Hex(obj, size) {
  var ctx = obj;
  var a, b, c, ac, b2, c2, a_c, splitVal, long, short, halfLong;

  function setSize(s) {
    a = s * 0.5;
    b = Math.sin(60 * (Math.PI / 180)) * s;
    c = s;
    ac = a + c;
    b2 = b * 2;
    c2 = c * 2;
    a_c = a - c;

    splitVal = (c / 2) / b;
    long = c * 3;
    short = b * 2;
    halfLong = c * 1.5;
  }

  // Init the hex
  setSize(size);

  return {
    'renderWide': function (offX, offY) {
      ctx.beginPath();
      ctx.moveTo(offX - c, 0 + offY);
      ctx.lineTo(a_c + offX, offY - b);
      ctx.lineTo(a + offX, offY - b);
      ctx.lineTo(c + offX, 0 + offY);
      ctx.lineTo(a + offX, b + offY);
      ctx.lineTo(a_c + offX, b + offY);
      ctx.lineTo(offX - c, 0 + offY);
      ctx.closePath();
    },
    'renderTall': function (offX, offY) {
      ctx.beginPath();
      ctx.moveTo(offX - b, a + offY);
      ctx.lineTo(offX - b, a_c + offY);
      ctx.lineTo(0 + offX, offY - c);
      ctx.lineTo(b + offX, a_c + offY);
      ctx.lineTo(b + offX, a + offY);
      ctx.lineTo(0 + offX, c + offY);
      ctx.lineTo(offX - b, a + offY);
      ctx.closePath();
    },
    'XYtoHexTall': function (x, y) {
      var tmp = { 'x': 0, 'y': 0 };

      var colRX = Math.floor(x / b);
      var colORX = x - Math.ceil(colRX * b);
      var colRY = Math.floor((y + a) / halfLong);
      var colORY = (y + a) - (colRY * halfLong);
      var hexDir = (colORY < c) ? 0 : ((colRY + (colRX % 2)) % 2) ? 1 : -1;

      tmp.y = colRY;
      tmp.x = Math.floor(colRY % 2 == 0) ? Math.floor((colRX + 1) / 2) : Math.floor(colRX / 2);

      tmp.oX = colORX;
      tmp.oY = colORY;

      if (hexDir) {      
        var splitX = (hexDir == 1) ? splitVal * colORY : splitVal * (a - colORY);
        hexSide = (colORX < splitX) ? 0 : 1;
        hexSide = (hexDir == 1) ? !hexSide : hexSide;
      
        if (hexSide) {
          if (hexDir == 1) {
            //tmp.x += (tmp.y % 2) ? 0 : -1;
          } else {
            //tmp.x += (tmp.y % 2) ? 1 : 0;
          }
      
          //tmp.y++;
        }
      }

      return tmp;
    },
    'hexTalltoXY': function (x, y) {
      var tmp = { 'x': 0, 'y': 0 };

      tmp.x = x * short + ((y % 2) ? b : 0);
      tmp.y = y * halfLong;

      return tmp;
    },
    'hexWidetoXY': function (x, y) {
      var tmp = { 'x': 0, 'y': 0 };

      tmp.y = y * short - ((x % 2) ? b : 0);
      tmp.x = x * halfLong;

      return tmp;
    },
    'XYtoHexWide': function (x, y) {
      var tmp = { 'x': 0, 'y': 0 };

      var colRY = Math.floor(y / b);
      var colORY = y - Math.ceil(colRY * b);
      var colRX = Math.floor((x + a) / halfLong);
      var colORX = (x + a) - (colRX * halfLong);
      var hexDir = (colORX < c) ? 0 : ((colRX + (colRY % 2)) % 2) ? 1 : -1;

      tmp.x = colRX;
      tmp.y = Math.floor(colRX % 2 == 0) ? Math.floor((colRY + 1) / 2) : Math.floor(colRY / 2);

      if (hexDir) {
        colORX -= c;

        var splitY = (hexDir == 1) ? splitVal * colORX : splitVal * (a - colORX);
        hexSide = (colORY < splitY) ? 0 : 1;
        hexSide = (hexDir == 1) ? !hexSide : hexSide;

        if (hexSide) {
          if (hexDir == 1) {
            tmp.y += (tmp.x % 2) ? 0 : -1;
          } else {
            tmp.y += (tmp.x % 2) ? 1 : 0;
          }

          tmp.x++;
        }
      }

      return tmp;
    },
    'setSize': function (size) {
      // Update the internals
      setSize(size);

      // Update the externals
      this.long = long;
      this.short = short;
      this.halfLong = halfLong;
      this.halfSize = a;
      this.halfShort = b;
      this.size = c;
      this.splitVal = splitVal;

    },
    'long':long,
    'short': short,
    'halfLong': halfLong,
    'halfSize': a,
    'halfShort': b,
    'size': c,
    'splitVal': b / (c / 2)
  }
}