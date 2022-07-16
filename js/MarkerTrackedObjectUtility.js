import { GLTFLoader } from '../libs/three/examples/jsm/loaders/GLTFLoader.js';
import { MarkerTrackedObject } from "./MarkerTrackedObject.js";
import { sleepUntil } from "./AsyncUtility.js";

export async function createMarkerTrackedObjectFromGTLF(htmlImageElement, imageRealWidth, gltfPath, objectScale)
{
    const imgBitmap = await createImageBitmap(htmlImageElement);

    var loader = new GLTFLoader();
    var loadingComplete = false;
    var trackableImageObjectMap;
    loader.load
    (
        gltfPath,
        (object) =>
        {
            var objectScene = object.scene;
            objectScene.visible = false;
            trackableImageObjectMap = new MarkerTrackedObject(htmlImageElement, imgBitmap, imageRealWidth, objectScene, objectScale);
            loadingComplete = true;
        },
        ( xhr ) =>
        {
            console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
        },
        (error) =>
        {
            console.log(error);
        }
    );

    await sleepUntil(() => loadingComplete === true, 60000);
    return trackableImageObjectMap;
}

export async function createMarkerTrackedObjectFromMesh(htmlImageElement, imageRealWidth, mesh, objectScale)
{
    const imgBitmap = await createImageBitmap(htmlImageElement);
    return new MarkerTrackedObject(htmlImageElement, imgBitmap, imageRealWidth, mesh, objectScale);
}

