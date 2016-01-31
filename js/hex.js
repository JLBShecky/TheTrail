
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