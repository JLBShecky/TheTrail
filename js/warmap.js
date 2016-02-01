function WarMap(obj, hSize, cX, cY) {
  var hexSize = hSize;
  var ctx = obj;
  var hex = new Hex(ctx, hexSize);

  var centerX = cX;
  var centerY = cY;

  var offX = centerX;
  var offY = centerY;

  function loadMapTile(name, id) {
    var imageObj = new Image();
    imageObj.onload = function() {
      colors[id] = imageObj;
    };
    imageObj.src = "img/" + name;
  }

  var mapData = function() {
    var tmp;

    if(localStorage.getItem('mapData') !== null) {
      tmp = JSON.parse(localStorage.getItem('mapData'));

      if((typeof tmp == "object" || typeof tmp == "array") && (tmp.length == 2601)){
        //return tmp;
      }
    }

    // Create the default map
    tmp = [];

    for(var i = 0; i < 2601; i++) {
      tmp.push(-1);
    }

    // TODO: Code that renders a chunk
    
    for (var col = -25; col < 26; col++) {
      var tmpMax = (Math.floor(-Math.abs(col) + .5) / 2) + 26;
      var tmpMin = tmpMax - 1;
      for (var row = -tmpMin; row < tmpMax; row++) {
        tmp[Math.floor(row + 25 + ((col + 25) * 51))] = 0;
      }
    }

    // The inner walls
    for (var col = -12; col < 13; col++) {
      var tmpMax = (Math.floor(-Math.abs(col) + .5) / 2) + 13;
      var tmpMin = tmpMax - 1;
      for (var row = -tmpMin; row < tmpMax; row++) {
        var val = 1;

        if(row == -tmpMin && col == 0) {//top center corner
          val = 2;
        } else if(row == -tmpMin && col == 12){//right upper corner
          val = 3;
        } else if(row == tmpMin && col == 12){//right lower corner
          val = 4;
        } else if(row == tmpMin && col == 0) {//bottom center corner
          val = 5;
        } else if(row == tmpMin && col == -12){//left lower corner
          val = 6;
        } else if(row == -tmpMin && col == -12){//left upper corner
          val = 7;
        } else if(row == -tmpMin && col > 0) {//right top wall
          val = 8;
        } else if(col == 12){//right wall
          val = 9;
        } else if(row == tmpMin && col > 0) {//right bottom wall
          val = 10;
        } else if(row == tmpMin && col < 0) {//left bottom wall
          val = 11;
        } else if(col == -12){//left wall
          val = 12;
        } else if(row == -tmpMin && col < 0) {//right top wall
          val = 13;
        }
               
        tmp[Math.floor(row + 25 + ((col + 25) * 51))] = val;
      }
    }

    // The outter walls
    for(var i = -25; i < -12; i++) {
      tmp[1300 + i] = 14;
      tmp[1300 - i] = 14;

      tmp[25 + Math.floor(i/2) + ((25 + i) * 51)] = 15;
      tmp[25 - Math.ceil(i/2) + ((25 - i) * 51)] = 15;

      
      tmp[-26 + Math.floor(i/2) + ((26 - i) * 51)] = 16;
      tmp[-26 - Math.ceil(i/2) + ((26 + i) * 51)] = 16;
    }

    // The gates
    tmp[-9 + 25 + ((25 + 6) * 51)] = 17; // Top-Right 17/18
    tmp[0 + 25 + ((25 + 12) * 51)] = 19; // Right 19/20
    tmp[9 + 25 + ((25 + 6) * 51)] = 21;  // Bottom-Right 21/22
    tmp[9 + 25 + ((25 - 6) * 51)] = 23;  // Bottom-Left 23/24
    tmp[0 - 26 + ((25 - 11) * 51)] = 25; // Left 25/26
    tmp[-9 + 25 + ((25 - 6) * 51)] = 27; // Top-Left 27/28

    // The external trading station
    tmp[-10 + 25 + ((25 + 3) * 51)] = 28; // Sell Top-Right 28
    tmp[-7 + 25 + ((25 + 8) * 51)] = 29; // Buy Top-Right 29

    tmp[-3 + 25 + ((25 + 11) * 51)] = 30; // Sell Right 30
    tmp[2 + 25 + ((25 + 11) * 51)] = 31; // Buy Right 31
    
    tmp[7 + 25 + ((25 + 8) * 51)] = 32; // Sell Bottom-Right 32
    tmp[9 + 25 + ((25 + 3) * 51)] = 33; // Buy Bottom-Right 33
    
    tmp[9 + 25 + ((25 - 3) * 51)] = 34; // Sell Bottom-Left 34
    tmp[7 + 25 + ((25 - 8) * 51)] = 35; // Buy Bottom-Left 35
    
    tmp[2 + 25 + ((25 - 11) * 51)] = 36; // Sell Left 36
    tmp[-3 + 25 + ((25 - 11) * 51)] = 37; // Buy Left 37
    
    tmp[-7 + 25 + ((25 - 8) * 51)] = 38; // Sell Top-Right 38
    tmp[-10 + 25 + ((25 - 3) * 51)] = 39; // Buy Top-Right 39

    // The internal trading posts
    tmp[-11 + 25 + ((25 + 4) * 51)] = 41; // Sell Top-Right 41
    tmp[-9 + 25 + ((25 + 9) * 51)] = 42; // Buy Top-Right 42

    tmp[-3 + 25 + ((25 + 13) * 51)] = 43; // Sell Right 43
    tmp[2 + 25 + ((25 + 13) * 51)] = 44; // Buy Right 44
    
    tmp[8 + 25 + ((25 + 9) * 51)] = 45; // Sell Bottom-Right 45
    tmp[11 + 25 + ((25 + 4) * 51)] = 46; // Buy Bottom-Right 46
    
    tmp[11 + 25 + ((25 - 4) * 51)] = 47; // Sell Bottom-Left 47
    tmp[8 + 25 + ((25 - 9) * 51)] = 48; // Buy Bottom-Left 48
    
    tmp[2 + 25 + ((25 - 13) * 51)] = 49; // Sell Left 49
    tmp[-3 + 25 + ((25 - 13) * 51)] = 50; // Buy Left 50
    
    tmp[-9 + 25 + ((25 - 9) * 51)] = 51; // Sell Top-Right 51
    tmp[-11 + 25 + ((25 - 4) * 51)] = 52; // Buy Top-Right 52

    // Save the map data
    //localStorage.setItem('mapData', JSON.stringify(tmp));

    return tmp;
  }();

  loadMapTile("GrassTile.png", 0);
  loadMapTile("OuterStoneWallStraight.png", 14);
  loadMapTile("OuterStoneWall-60.png", 15);
  loadMapTile("OuterStoneWall+60.png", 16);
  loadMapTile("Cobble.png", 1);
  loadMapTile("CastleWall.png", 12);
  
  var editor = new Editor(mapData);

  var marker = { 'x': 0, 'y': 0 };
  var colors = [
    "#ffffff",
    "#00bb00",
    "#101010",
    "#1a1a1a",
    "#202020",
    "#2a2a2a",
    "#303030",
    "#3a3a3a",
    "#404040",
    "#4a4a4a",
    "#505050",
    "#5a5a5a",
    "#606060",
    "#6a6a6a",
    "#707070",
    "#7a7a7a",
    "#808080",
    "#8a8a8a",
    "#909090",
    "#9a9a9a",
    "#a0a0a0",
    "#aaaaaa",
    "#b0b0b0",
    "#bababa",
    "#c0c0c0",
    "#cacaca",
    "#d0d0d0",
    "#dadada",
    "#e0e0e0",
    "#0088bb",
    "#00bb88",
    "#0088bb",
    "#00bb88",
    "#0088bb",
    "#00bb88",
    "#0088bb",
    "#00bb88",
    "#0088bb",
    "#00bb88",
    "#0088bb",
    "#00bb88",
    "#0088bb",
    "#00bb88",
    "#0088bb",
    "#00bb88",
    "#0088bb",
    "#00bb88",
    "#0088bb",
    "#00bb88",
    "#0088bb",
    "#00bb88",
    "#0088bb",
    "#00bb88"
  ];

  ctx.fillStyle = colors[0];

  function render(mouseX, mouseY) {
    // Render the loaded chunks
    for (var col = 0, y = -25; col < 51; col++, y++) {
      for(var row = 0, x= -25; row < 51; row++, x++) {
      var tileId = mapData[col + (row * 51)];
        if(tileId < 0) {
          continue;
        }

        hex.renderWide(offX + (x * hex.halfLong), offY + (y * hex.short) + (x % 2 ? hex.halfShort : 0));
        
        if(typeof colors[tileId] == "string") {
          ctx.fillStyle = colors[tileId];
          ctx.fill();
        } else {
          ctx.save();
          ctx.clip();
          ctx.drawImage(colors[tileId], offX + (x * hex.halfLong) - hex.size, offY + (y * hex.short) + (x % 2 ? hex.halfShort : 0) - hex.halfShort, hex.size * 2, hex.short);
          ctx.restore();
        }
        
        ctx.stroke();
      }
    }

    // Draw a marker to show the center of the map
    ctx.fillStyle = "#005500";
    ctx.fillRect(offX - 10, offY - 10, 20, 20);

    // Draw the marker to show the tile we are currently hovering over
    ctx.fillStyle = "#0000bb";
    hex.renderWide(offX + (mouseX * hex.halfLong), offY + (mouseY * hex.short) + (mouseX % 2 ? hex.halfShort : 0));
    ctx.stroke();
    ctx.fill();

    //marker = hex.hexWidetoXY(0, -2);

    //ctx.fillStyle = "#003300";
    //ctx.fillRect(offX - 10 + marker.x, offY - 10 + marker.y, 20, 20);
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

      // Calculate the new offset
      offX = centerX - Math.round((centerX - offX) * ratio);
      offY = centerY - Math.round((centerY - offY) * ratio);
    },
    'moveMap': function (x, y) {
      offX += x;
      offY += y;
    },
    'click':function(x, y) {
      editor.click(y + 25 + ((x + 25) * 51));
    },
    'offX': function () { return offX; },
    'offY': function () { return offY; },
    'hex': function () { return hex; }
  }
}