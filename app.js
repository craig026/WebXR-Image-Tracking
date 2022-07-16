import { ARScene } from "./js/ARScene.js";
import { createMarkerTrackedObjectFromGTLF } from "./js/MarkerTrackedObjectUtility.js";
import { createMarkerTrackedObjectFromMesh } from "./js/MarkerTrackedObjectUtility.js";
import { MarkerTrackedObject } from "./js/MarkerTrackedObject.js";
import * as THREE from './libs/three/build/three.module.js';

class App
{
	constructor()
    {
        var self = this;
        this.arScene;
        this.markerTrackedObjects = new Array();
        this.activeTrackedObjects = new Array();

        this.barcodeDetector = new BarcodeDetector(
        {
            formats:
            [
                'aztec',
                'code_128',
                'code_39',
                'code_93',
                'codabar',
                'data_matrix',
                'ean_13',
                'ean_8',
                'itf',
                'pdf417',
                'qr_code',
                'upc_a',
                'upc_e'
            ]
        });

        if (this.barcodeDetector)
            console.log('Barcode Detector supported!');

        // this.sphereMat = new THREE.MeshPhongMaterial( { color: 0x0000ff, side: THREE.DoubleSide } );

        initialise();
        async function initialise()
        {
            const spaceCraftQRImage = document.getElementById('spaceCraftImage');
            var spaceCraftMarkerTrackedObject = await createMarkerTrackedObjectFromGTLF(spaceCraftQRImage, 0.15, './content/geometry/SM_Ship_Bomber_01_out/SM_Ship_Bomber_01.gltf', 0.05);

            const earthQRImage = document.getElementById('earthImage');
            const eartGeom = new THREE.SphereBufferGeometry( 15, 32, 16 );
            const earthTexture = new THREE.TextureLoader().load( "./content/images/8081_earthmap2k.jpg" );
            const earthMaterial = new THREE.MeshPhongMaterial( { color: 0xffffff, map: earthTexture } );
            self.earthMesh = new THREE.Mesh( eartGeom, earthMaterial );;
            var earthMarkerTrackedObject = await createMarkerTrackedObjectFromMesh(earthQRImage, 0.15, self.earthMesh, 0.05);

            self.markerTrackedObjects = [ spaceCraftMarkerTrackedObject, earthMarkerTrackedObject ];
            self.arScene = new ARScene(self.markerTrackedObjects);
            self.setUpScene();
        }

        document.addEventListener('imageDetected', evt =>
        {
            var result = evt.result;
            var pose = evt.pose;
            var qrHtmlImageElement = evt.markerTrackedObject.htmlImageElement;
            var sceneObject = evt.markerTrackedObject.sceneObject;
            var objectScale = evt.markerTrackedObject.sceneObjectScale;

            if(sceneObject.visible === false)
            {
                sceneObject.visible = true;
                // this.activeTrackedObjects.push(sceneObject);
                //console.log(this.barcodeDetector);
                console.log(qrHtmlImageElement);
                /*this.barcodeDetector.detect(qrHtmlImageElement)
                .then(barcodes =>
                {
                    barcodes.forEach(barcode =>
                    {
                        console.log(barcode);
                        document.getElementById('qrRawDataDisplay').innerText = barcode.rawValue;
                    });
                })
                .catch(err =>
                {
                    console.log(err);
                });*/
            }

            let position = pose.transform.position;
            sceneObject.position.set(position.x, position.y, position.z);
            sceneObject.scale.x = (result.measuredWidthInMeters / 2) * objectScale;
            sceneObject.scale.y = (result.measuredWidthInMeters / 2) * objectScale;
            sceneObject.scale.z = (result.measuredWidthInMeters / 2) * objectScale;
        });

        document.addEventListener('imageDetectionLost', evt =>
        {
            var markerTrackedObject = evt.markerTrackedObject.sceneObject;
            if(markerTrackedObject.visible === true)
            {
                markerTrackedObject.visible = false;
                // this.activeTrackedObjects.pop(sceneObject);
            }
        });
    }

    setUpScene()
    {
        this.markerTrackedObjects.forEach(o =>
        {
            var sceneObject = o.sceneObject;
            sceneObject.position.set(0,0,0).applyMatrix4( this.arScene.controller.matrix );
            sceneObject.quaternion.set(0,0,0).setFromRotationMatrix( this.arScene.controller.matrix );
            this.arScene.scene.add(sceneObject);
        });

        this.earthMesh.position.set(0,0,0).applyMatrix4( this.arScene.controller.matrix );
        this.earthMesh.quaternion.set(0,0,0).setFromRotationMatrix( this.arScene.controller.matrix );
        this.arScene.scene.add(this.earthMesh);
    }
}

export { App };
