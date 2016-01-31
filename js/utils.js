function countHexTiles(size) {
  var tmpHexes = size - 1;
  var cnt = 0;

  for (var col = -tmpHexes; col < size; col++) {
    var tmpMax = (Math.floor(-Math.abs(col) + .5) / 2) + size;
    var tmpMin = tmpMax - 1;
    for (var row = -tmpMin; row < tmpMax; row++) {
      cnt++;
    }
  }

  return cnt;
}

function fillBlocks(data, fullSize) {
  var tmpHexes = 25;
    
  for (var col = -25; col < 26; col++) {
    var tmpMax = (Math.floor(-Math.abs(col) + .5) / 2) + 26;
    var tmpMin = tmpMax - 1;
    for (var row = -tmpMin; row < tmpMax; row++) {
      //if(Math.floor(tmp[row + 25 + ((col + 25) * 51))] != -1) {
      //  console.log(row + 25 + ((col + 25) * 51))
      //  continue;
      //}
        
      data[Math.floor(row + 25 + ((col + 25) * 51))] = 0;
    }
  }
}