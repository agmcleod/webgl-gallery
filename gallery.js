import GalleryImage from './gallery_image';

export default class Gallery {
  constructor(atlas, screenWidth, screenHeight) {
    this.atlas = atlas;
    this.targetSize = screenWidth / 4;
    this.screenWidth = screenWidth;
    this.padding = Math.floor((screenWidth / 4) / 3);
    this.screenHeight = screenHeight;
  }

  buildGalleryImages() {
    const regionNames = Object.keys(this.atlas.regions);
    this.galleryImages = [];
    let x = 0, y = 0;
    let rowCount = 0;
    let colCount = 0;
    for (let i = 0; i < regionNames.length; i++) {
      const regionName = regionNames[i];
      const region = this.atlas.regions[regionName];

      let width, height;
      const clipCoordinatesSize = (this.targetSize / this.screenWidth) * 2;
      if (region.w > region.h) {
        width = clipCoordinatesSize;
        height = clipCoordinatesSize * (region.h / region.w);
      } else {
        width = clipCoordinatesSize * (region.w / region.h);
        height = clipCoordinatesSize;
      }

      x = (x / this.screenWidth) * 2 - 1;
      y = (1 - y / this.screenHeight) * 2 - 1;

      const cellX = x;
      const cellY = y;

      if (region.w > region.h) {
        y -= (width - height) / 2;
      } else {
        x += (height - width) / 2;
      }
      const gi = new GalleryImage(
        regionName, x, y,
        width, height, cellX, cellY
      );

      console.log(gi);
      this.galleryImages.push(gi);

      colCount++;
      x = (this.targetSize + this.padding) * colCount;

      if ((i + 1) % 3 === 0) {
        x = 0;
        colCount = 0;
        rowCount++;
        y = (this.targetSize + this.padding) * rowCount;
      }
    }
  }
}
