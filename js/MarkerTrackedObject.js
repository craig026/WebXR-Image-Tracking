class MarkerTrackedObject
{
    htmlImageElement;
    imageBitmap;
    sceneObject;
    imageWidth;
    sceneObjectScale;

    constructor(htmlImageElement, bitmap, imageWidthInMeters, threeJSObject, objectScale)
    {
        this.htmlImageElement = htmlImageElement;
        this.imageBitmap = bitmap;
        this.imageWidth = imageWidthInMeters;
        this.sceneObject = threeJSObject;
        this.sceneObjectScale = objectScale;
    }
}

export { MarkerTrackedObject };