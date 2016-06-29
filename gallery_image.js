export default class GalleryImage {
  constructor(regionName, x, y, width, height) {
    this.regionName = regionName;
    this.position = {x: x, y: y};
    this.width = width;
    this.height = height;
  }
}
