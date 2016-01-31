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
        tileRender(chunkNum, Math.ceil(row), col, chunkX + x, chunkY + y);
      }
    }
  }

  function tileRender(chunkNum, x, y, rX, rY) {
    // Temp code that draws a background and the hex's borders
    // Get the tile's color
    //ctx.fillStyle = (ctx.fillStyle == "#ffffff") ? "#ffffff" : colors[chunks[chunkNum].data[chunkYOffset[y] + x]];

    ctx.fill();

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