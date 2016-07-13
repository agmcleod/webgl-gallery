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
      // this converts the desired pixel size of sorts to clip coordinate size
      // since -1 to 1 is a difference of two, we multiply the 0-1 value by two.
      const clipCoordinatesSize = (this.targetSize / this.screenWidth) * 2;
      // Set the slot size of the image + rectangle to a square. This is more the invisible size of each photo
      // we display the photo & square at the correct aspect ratio still.
      if (region.w > region.h) {
        width = clipCoordinatesSize;
        height = clipCoordinatesSize * (region.h / region.w);
      } else {
        width = clipCoordinatesSize * (region.w / region.h);
        height = clipCoordinatesSize;
      }

      // convert the x & y values to clip coordinate values
      // again multiplying by 2 for the -1 to 1 difference.
      // Subtracting 1 to deal with the negative offset, and 0,0 being in the middle, not the left bound
      x = (x / this.screenWidth) * 2 - 1;
      y = (1 - y / this.screenHeight) * 2 - 1;

      // this is to offset the positioning so it's centered within the "square"
      if (region.w > region.h) {
        y -= (width - height) / 2;
      } else {
        x += (height - width) / 2;
      }
      const gi = new GalleryImage(
        regionName, x, y, width, height
      );

      this.galleryImages.push(gi);

      colCount++;
      // add a bit of padding between each square
      x = (this.targetSize + this.padding) * colCount;

      // go next row down after 3 images
      if ((i + 1) % 3 === 0) {
        x = 0;
        colCount = 0;
        rowCount++;
      }

      y = (this.targetSize + this.padding) * rowCount;
    }
  }
}
