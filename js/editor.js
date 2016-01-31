function Editor(map){
  var curCode = 0;
  var enabled = true;
  window.addEventListener('keydown', function(evt) {
    switch(evt.which){
      case 8:
        curCode = -1;
        break;
      case 8:
        enabled = !enabled;
        break;
      case 49:
        curCode = 0;
        break;
      case 50:
        curCode = 1;
        break;
      case 51:
        curCode = 2;
        break;
      case 52:
        curCode = 3;
        break;
      case 81:
        curCode = 4;
        break;
      case 87:
        curCode = 5;
        break;
      case 69:
        curCode = 6;
        break;
      case 82:
        curCode = 7;
        break;
      case 65:
        curCode = 8;
        break;
      case 83:
        curCode = 9;
        break;
      case 68:
        curCode = 10;
        break;
      case 70:
        curCode = 11;
        break;
      case 90:
        curCode = 12;
        break;
      case 88:
        curCode = 13;
        break;
      case 67:
        curCode = 14;
        break;
      case 86:
        curCode = 15;
        break;
      default:
        console.log(evt.which);
    }
  });

  return {
    'click': function(tile) {
      if(!enabled || tile < 0 || tile >= map.length) return;

      // Update the map
      map[tile] = curCode;

      // Save the map
      localStorage.setItem('mapData', JSON.stringify(map));
    }
  }


}