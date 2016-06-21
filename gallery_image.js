export default class GalleryImage {
  constructor(regionName, x, y, width, height, cellX, cellY) {
    this.regionName = regionName;
    this.position = {x: x, y: y};
    this.cellPosition = {x: cellX, y: cellY};
    this.width = width;
    this.height = height;
  }
}
