import * as THREE from '../libs/three/build/three.module.js';
import { ARButton } from '../libs/three/examples/jsm/webxr/ARButton.js';

class ARScene
{
    // public fields
    scene;
    camera;
    renderer;
    controller;

    #imagesToTrack = [];
    #cachedMarkerTrackedObjects;
    #imagesTrackedPreviousFrame = {};
    #onPreRenderEvent;
    #onPostRenderEvent;

    constructor(markerTrackedObjects)
    {
        let self = this;
        this.#cachedMarkerTrackedObjects = markerTrackedObjects;
        const container = document.createElement( 'div' );
		document.body.appendChild( container );

        // scene and camera set up
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20)
    
        // lights
        const hemisphereLight = new THREE.HemisphereLight( 0x606060, 0x404040 );
        const directionalLight = new THREE.DirectionalLight( 0xffffff );
        directionalLight.position.set( 1, 1, 1 ).normalize();
		this.scene.add( hemisphereLight );
		this.scene.add( directionalLight );

        const canvas = document.querySelector('#threejscanvas');
        console.log(canvas);
        // renderer set up
		this.renderer = new THREE.WebGLRenderer(
        { 
            antialias: true, 
            alpha: true,
            canvas: canvas
        });
		this.renderer.setPixelRatio( window.devicePixelRatio );
		this.renderer.setSize( window.innerWidth, window.innerHeight );
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.xr.enabled = true; 
        this.renderer.setAnimationLoop( this.render.bind(this) );


        // controller set up
        this.controller = this.renderer.xr.getController( 0 );
        this.scene.add( this.controller );

        this.#onPreRenderEvent = new Event("onPreRender");
        this.#onPostRenderEvent = new Event("onPostRender");

        for(var i=0; i < self.#cachedMarkerTrackedObjects.length; i++)
        {
            console.log(self.#cachedMarkerTrackedObjects[i]);
            self.#imagesToTrack[i] = 
            {
                image: self.#cachedMarkerTrackedObjects[i].imageBitmap,
                widthInMeters: self.#cachedMarkerTrackedObjects[i].imageWidth
            }
        }

        this.initialiseAR();
    }

    initialiseAR()
    {
        const webOverlay = document.getElementById('weboverlay');
        console.log(webOverlay);
        document.body.appendChild( ARButton.createButton( this.renderer,  
        { 
            optionalFeatures: ['image-tracking', 'dom-overlay'],
            trackedImages: this.#imagesToTrack,
            domOverlay: { root: webOverlay }
        }));
        
        window.addEventListener('resize', this.resize.bind(this));
    }

    render(timestamp, frame) 
    { 
        let imagesTrackedThisFrame = {};
        if(frame)
        {
            const results = frame.getImageTrackingResults();

            for (const result of results) 
            {
                // The result's index is the image's position in the trackedImages array specified at session creation
                const imageIndex = result.index;

                // Get the pose of the image relative to a reference space.
                const referenceSpace = this.renderer.xr.getReferenceSpace();
                const pose = frame.getPose(result.imageSpace, referenceSpace);
                const state = result.trackingState;

                if (state == "tracked") 
                {
                    imagesTrackedThisFrame[imageIndex] = true;
                    var imageDetectedEvent = new Event("imageDetected");
                    imageDetectedEvent.result = result;
                    imageDetectedEvent.pose = pose;
                    imageDetectedEvent.markerTrackedObject = this.#cachedMarkerTrackedObjects[imageIndex];
                    document.dispatchEvent(imageDetectedEvent);
                }
            }
        }

        for (const index in this.#imagesTrackedPreviousFrame) 
        {
            if (!imagesTrackedThisFrame[index]) 
            {
                var imageLostDetctionEvent = new Event("imageDetectionLost");
                imageLostDetctionEvent.markerTrackedObject = this.#cachedMarkerTrackedObjects[index];
                document.dispatchEvent(imageLostDetctionEvent);
            }
        }

        this.#imagesTrackedPreviousFrame = imagesTrackedThisFrame;
        
        document.dispatchEvent(this.#onPreRenderEvent);
        this.renderer.render( this.scene, this.camera );
        document.dispatchEvent(this.#onPostRenderEvent);
    }

    resize()
    {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize( window.innerWidth, window.innerHeight );  
    }
}

export { ARScene };