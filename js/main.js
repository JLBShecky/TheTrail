document.addEventListener('DOMContentLoaded', function () {
  var canvas = document.getElementById('gameScreen');

  Map('gameScreen');
});

function ClickHandler(obj, cli, dbl) {
  var ctrl = (typeof obj == "string") ? document.getElementById(obj) : obj;
  var oneClick = (typeof cli == "function") ? cli : null;
  var twoClick = (typeof dbl == "function") ? dbl : null;
  var clicking = false;
  var lastX = 0;
  var lastY = 0;
  
  if (typeof oneClick != "function" && typeof twoClick != "function") return;

  ctrl.addEventListener('mousedown', function (evt) {
    if (clicking && twoClick) {
      twoClick(evt);
      clicking = false;
    } else {
      // Enable the drag handler
      clicking = true;

      // Record the current mouse position
      lastX = evt.screenX;
      lastY = evt.screenY;

      // Set the time out to prevent double clicks
      setTimeout(function () {
        clicking = false;
      }, 250)
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


var curMap;
function Map(ctrl) {
  var cv = (typeof ctrl == "string") ? document.getElementById(ctrl) : ctrl;
  var ctx = cv.getContext('2d');

  // Map rendering objects
  var hexSizes = [1, 2, 4, 6, 8, 10, 13, 16, 20, 25, 32, 40, 50, 62];
  var zoomLevel = 7;
  cv.width = document.body.offsetWidth;
  cv.height = document.body.offsetHeight;

  curMap = new WarMap(ctx, hexSizes[zoomLevel], Math.floor(document.body.offsetWidth / 2), Math.floor(document.body.offsetHeight / 2));
  
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
  ClickHandler(cv, function(evt){
    var coord = curMap.hexCoord(evt.offsetX, evt.offsetY);

    curMap.click(coord.x, coord.y);
  });
  DragHandler(cv, MapMove);
  cv.addEventListener('mousemove', function (evt) {
    coordX = (evt.offsetX - curMap.offX());
    coordY = (evt.offsetY - curMap.offY());
    
    hexCoord = curMap.hexCoord(evt.offsetX, evt.offsetY);

  });

  window.addEventListener('resize', function(evt) {
    cv.width = document.body.offsetWidth;
    cv.height = document.body.offsetHeight;
    
    curMap.setCenter(Math.floor(document.body.offsetWidth / 2), Math.floor(document.body.offsetHeight / 2));
  });

  cv.addEventListener('wheel', function (evt) {
    if (evt.deltaY < 0 && zoomLevel < hexSizes.length - 1) {
      hexSize = Math.floor(hexSizes[++zoomLevel]);
    } else if (evt.deltaY > 0 && zoomLevel > 1) {
      hexSize = Math.floor(hexSizes[--zoomLevel]);
    }

    curMap.setSize(hexSize);
  });

  // Start the render
  window.requestAnimationFrame(Render);
}