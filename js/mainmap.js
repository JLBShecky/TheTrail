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