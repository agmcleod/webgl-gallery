export default class Atlas {
  constructor(image, data) {
    this.image = image;
    this.data = data;
  }

  buildRegions() {
    this.regions = {};
    for (let i = 0; i < this.data.frames.length; i++) {
      const frame = this.data.frames[i];
      this.regions[frame.filename] = frame.frame;
    }
  }
}
