import GalleryImage from './gallery_image';

export default class Gallery {
  constructor(atlas, screenWidth, screenHeight) {
    this.atlas = atlas;
    this.screenWidth = screenWidth;
    this.padding = 10;
    this.targetWidth = screenWidth / 3;
    this.screenHeight = screenHeight;
  }

  buildGalleryImages() {
    const regionNames = Object.keys(this.atlas.regions);
    this.galleryImages = [];
    let lastRegion = null;
    let x = 0, y = 0, maxY = 0;
    for (let i = 0; i < regionNames.length; i++) {
      if (lastRegion !== null) {
        x += this.targetWidth + this.padding;
      }
      if (x > this.screenWidth) {
        x = 0;
        y = maxY;
        maxY = 0;
        lastRegion = null;
      }
      lastRegion = this.atlas.regions[regionNames[i]];

      maxY = Math.max(lastRegion.h, maxY) + y;
      const gi = new GalleryImage(regionNames[i], x / this.screenWidth - 1, y / this.screenHeight - 1);
      gi.width = this.targetWidth / this.screenWidth;
      gi.height = lastRegion.w / lastRegion.h * gi.width;
      this.galleryImages.push(gi);
    }
  }
}
