import "@babylonjs/core/Debug/debugLayer";
import { Inspector, } from "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import { Engine, Scene, FreeCamera, DynamicTexture, HemisphericLight, MeshBuilder, StandardMaterial, Vector3, Color3, Color4, UtilityLayerRenderer, Quaternion, Animation, } from "@babylonjs/core";
import { GUI3DManager, } from "@babylonjs/gui";
import { HtmlMeshRenderer, HtmlMesh } from "@babylonjs/addons/htmlMesh";
// HTML Content
let mainMenuHTML = '';
try {
    const resHTML = await fetch('/main-menu.html');
    if (!resHTML.ok)
        throw new Error('Failed to load HTML');
    mainMenuHTML = await resHTML.text();
}
catch (err) {
    console.error('Error loading HTML:', err);
}
import './tailwind.css'; // Add this at the top
class App {
    // Game State
    constructor() {
        // create the canvas html element and attach it to the webpage
        this._canvas = this._createCanvas();
        // initialize babylon this._scene and this._engine
        this._engine = new Engine(this._canvas, true);
        this._scene = new Scene(this._engine);
        this._scene.clearColor = new Color4(0, 0, 0, 0);
        this._scene.createDefaultEnvironment({
            createGround: false,
            skyboxSize: 1000
        });
        this._gui3dManager = new GUI3DManager(this._scene);
        const utilLayer = new UtilityLayerRenderer(this._scene);
        // Init Targets
        this._pongTarget = Quaternion.FromEulerAngles(Math.PI, 0, Math.PI); // Front view
        this._mainMenuTarget = Quaternion.FromEulerAngles(Math.PI / 2, Math.PI, 0);
        this._currentTarget = this._mainMenuTarget;
        // Init Positions
        this._cameraPongPosition = new Vector3(0, 0, 3);
        this._cameraMainMenuPosition = new Vector3(0, 3, 3);
        this._camera = new FreeCamera("camera", this._cameraPongPosition, this._scene);
        this._camera.fov = 1.2; // Narrower FOV reduces perspective distortion
        this._camera.rotationQuaternion = Quaternion.FromEulerAngles(0, 0, 0);
        this._camera.setTarget(Vector3.Zero());
        this._camera.attachControl(this._canvas, true);
        this._light = new HemisphericLight("hemisphericLight", new Vector3(1, 1, 0), this._scene);
        // Run the main render loop
        this._main();
    }
    async _main() {
        await this._init();
        // Render Loop
        this._engine.runRenderLoop(() => {
            this._scene.render();
        });
    }
    async _init() {
        // Create Inspector
        Inspector.Show(this._scene, {
            overlay: true,
            enablePopup: true,
        });
        // Create Objects
        this._createObjects();
        // Create GUI Controls
        this._addControls();
        this._renderAxis();
        /// Event Listeners
        this._setupEvents();
        this.animationCamera(this._currentTarget);
    }
    _createCanvas() {
        // Commented out for development
        document.documentElement.style["overflow"] = "hidden";
        document.documentElement.style.overflow = "hidden";
        document.documentElement.style.width = "100%";
        document.documentElement.style.height = "100%";
        document.documentElement.style.margin = "0";
        document.documentElement.style.padding = "0";
        document.body.style.overflow = "hidden";
        document.body.style.width = "100%";
        document.body.style.height = "100%";
        document.body.style.margin = "0";
        document.body.style.padding = "0";
        // Create the canvas html element and attach it to the webpage
        this._canvas = document.createElement("canvas");
        this._canvas.style.width = "100%";
        this._canvas.style.height = "100%";
        this._canvas.id = "gameCanvas";
        document.body.appendChild(this._canvas);
        return this._canvas;
    }
    _createObjects() {
        // Ball
        this._ball = MeshBuilder.CreateSphere("ball", { diameter: .1 }, this._scene);
        this._ball.position = new Vector3(0.1, 0, 0);
        // Paddles
        this._lpaddle = MeshBuilder.CreateBox("lpaddle", { width: .1, height: 0.3, depth: .05 }, this._scene);
        this._rpaddle = MeshBuilder.CreateBox("rpaddle", { width: .1, height: 0.3, depth: .05 }, this._scene);
        this._lpaddle.position = new Vector3(-1.4, 0, 0);
        this._rpaddle.position = new Vector3(1.4, 0, 0);
        // Planes
        // Pong Plane
        const pongPlane = new StandardMaterial("belowPlaneMat", this._scene);
        pongPlane.diffuseColor = new Color3(0, 1, 0); // Green
        this._belowPlane = MeshBuilder.CreatePlane("xyPlane", { size: 7 }, this._scene);
        this._belowPlane.rotation.x = Math.PI; // 180° around the X axis
        this._belowPlane.position.y = -1; // Below the main plane
        this._belowPlane.material = pongPlane;
        // Main Menu
        const htmlMeshRenderer = new HtmlMeshRenderer(this._scene);
        const htmlMeshDiv = new HtmlMesh(this._scene, "htmlMeshDiv");
        const div = document.createElement("div");
        div.innerHTML = mainMenuHTML;
        div.style.width = "200px";
        div.style.height = "200px";
        div.style.backgroundColor = "purple";
        div.style.textAlign = 'center';
        div.style.fontSize = '100px';
        // div.style.padding = "20px";
        div.style.color = "yellow";
        div.style.zIndex = "1000"; // Higher z-index
        htmlMeshDiv.setContent(div, 4, 2);
        // Position/Scale/Rotate the mesh in your scene
        // htmlMeshDiv.position = new Vector3(0, 0, 0);
        // htmlMeshDiv.scaling = new Vector3(1, 1, 1);
        // htmlMeshDiv.rotation = Quaternion.FromEulerAngles(0, 0, 0).toEulerAngles();
        // htmlMeshDiv.rotation = Quaternion.FromEulerAngles((Math.PI), 0, Math.PI).toEulerAngles();
        const mainMenuPlaneMat = new StandardMaterial("mainMenuPlaneMat", this._scene);
        mainMenuPlaneMat.diffuseColor = new Color3(0, 0, 0); // Black
        mainMenuPlaneMat.alpha = 0; // Transparent
        this._mainMenuPlane = MeshBuilder.CreatePlane("mainMenuPlane", { size: 7 }, this._scene);
        this._mainMenuPlane.position.set(0.0, -3.1, 2.5); // Adjust as needed
        this._mainMenuPlane.rotation = Quaternion.FromEulerAngles((Math.PI / 2), 0, Math.PI).toEulerAngles();
        this._mainMenuPlane.material = mainMenuPlaneMat;
        htmlMeshDiv.parent = this._mainMenuPlane;
    }
    _createHTML() {
    }
    _addControls() {
        // this._mainMenuPlane.billboardMode = Mesh.BILLBOARDMODE_ALL; // GUI Always face camera
        // this._mainMenu = AdvancedDynamicTexture.CreateForMesh(this._mainMenuPlane, 1024, 1024);
        // this._mainMenu.background = "red";
        // // Create a _mainMenuPanel to organize UI elements
        // this._mainMenuPanel = new StackPanel();
        // this._mainMenuPanel.width = "80%";
        // this._mainMenuPanel.height = "100%";
        // this._mainMenuPanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        // this._mainMenuPanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        // this._mainMenuPanel.paddingTop = "500px";
        // this._mainMenuPanel.spacing = 20; // Vertical spacing between elements
        // this._mainMenu.addControl(this._mainMenuPanel);
        //
        // // Add a title
        // const title = new TextBlock();
        // title.text = "Pong42";
        // title.height = "60px";
        // title.color = "navy";
        // title.fontSize = 36;
        // this._mainMenuPanel.addControl(title);
        //
        // // Zedo Button
        // var btn = Button.CreateSimpleButton("testButton", "Zedro");
        // btn.width = 0.2;
        // btn.height = 0.2;
        // btn.rotation = 2 * Math.PI;
        // btn.color = "Purple";
        // btn.background = "Green";
        // btn.fontSize = 44;
        // btn.thickness = 2;
        // btn.onPointerUpObservable.add(() => {
        //   alert("Clicked");
        // });
        // this._mainMenuPanel.addControl(btn);
    }
    /**
     * Animates the camera's rotation to a specified target orientation.
     *
     * @param quat - The target orientation as a Vector3, where x, y, and z represent Euler angles.
     */
    animationCamera(quat) {
        let framerate = 50;
        let animateRotation = new Animation("animRotation", "rotationQuaternion", framerate, Animation.ANIMATIONTYPE_QUATERNION, Animation.ANIMATIONLOOPMODE_CONSTANT);
        let keyframeRotation = [];
        keyframeRotation.push({ frame: 0, value: this._camera.rotationQuaternion.clone() });
        keyframeRotation.push({ frame: 50, value: quat });
        animateRotation.setKeys(keyframeRotation);
        this._scene.stopAnimation(this._camera);
        this._camera.animations = [animateRotation];
        this._scene.beginAnimation(this._camera, 0, 50, false, 2);
    }
    _renderAxis() {
        // show axis
        var showAxis = function (size) {
            var makeTextPlane = function (text, color, size) {
                var dynamicTexture = new DynamicTexture("DynamicTexture", 50, this._scene, true);
                dynamicTexture.hasAlpha = true;
                dynamicTexture.drawText(text, 5, 40, "bold 36px Arial", color, "transparent", true);
                const plane = MeshBuilder.CreatePlane("TextPlane", { size: size }, this._scene);
                var mat = new StandardMaterial("TextPlaneMaterial", this._scene);
                mat.backFaceCulling = false;
                mat.specularColor = new Color3(0, 0, 0);
                mat.diffuseTexture = dynamicTexture;
                plane.material = mat;
                return plane;
            };
            const axisX = MeshBuilder.CreateLines("axisX", {
                points: [
                    Vector3.Zero(),
                    new Vector3(size, 0, 0),
                    new Vector3(size * 0.95, 0.05 * size, 0),
                    new Vector3(size, 0, 0),
                    new Vector3(size * 0.95, -0.05 * size, 0)
                ],
                updatable: true
            }, this._scene);
            axisX.color = new Color3(1, 0, 0);
            var xChar = makeTextPlane("X", "red", size / 10);
            xChar.position = new Vector3(0.9 * size, -0.05 * size, 0);
            var axisY = MeshBuilder.CreateLines("axisY", {
                points: [
                    Vector3.Zero(),
                    new Vector3(0, size, 0),
                    new Vector3(-0.05 * size, size * 0.95, 0),
                    new Vector3(0, size, 0),
                    new Vector3(0.05 * size, size * 0.95, 0)
                ]
            }, this._scene);
            axisY.color = new Color3(0, 1, 0);
            var yChar = makeTextPlane("Y", "green", size / 10);
            yChar.position = new Vector3(0, (0.9 * size), (-0.05 * size));
            var axisZ = MeshBuilder.CreateLines("axisZ", {
                points: [
                    Vector3.Zero(),
                    new Vector3(0, 0, size),
                    new Vector3(0, -0.05 * size, size * 0.95),
                    new Vector3(0, 0, size),
                    new Vector3(0, 0.05 * size, size * 0.95)
                ]
            }, this._scene);
            axisZ.color = new Color3(0, 0, 1);
            var zChar = makeTextPlane("Z", "blue", size / 10);
            zChar.position = new Vector3(0, 0.05 * size, 0.9 * size);
            showAxis(10);
        };
    }
    _setupEvents() {
        window.addEventListener("resize", () => {
            this._engine.resize();
        });
        // Paddles
        const paddleSpeed = 0.07;
        const paddleLimit = 0.66;
        function clampPaddle(paddle) {
            if (paddle.position.y > paddleLimit)
                paddle.position.y = paddleLimit;
            if (paddle.position.y < -paddleLimit)
                paddle.position.y = -paddleLimit;
        }
        window.addEventListener("keydown", (ev) => {
            switch (ev.key) {
                case "ArrowUp":
                    this._lpaddle.position.y += paddleSpeed;
                    clampPaddle(this._lpaddle);
                    break;
                case "ArrowDown":
                    this._lpaddle.position.y -= paddleSpeed;
                    clampPaddle(this._lpaddle);
                    break;
                case "w":
                    this._rpaddle.position.y += paddleSpeed;
                    clampPaddle(this._rpaddle);
                    break;
                case "s":
                    this._rpaddle.position.y -= paddleSpeed;
                    clampPaddle(this._rpaddle);
                    break;
                default:
                    break;
            }
        });
        // Camera target switching with spacebar
        window.addEventListener("keydown", (ev) => {
            if (ev.code === "Space") {
                ev.preventDefault(); // Prevent default space behavior
                this._currentTarget =
                    this._currentTarget === this._pongTarget
                        ? this._mainMenuTarget
                        : this._pongTarget;
                this.animationCamera(this._currentTarget);
                if (this._currentTarget === this._pongTarget) {
                    this._currentTarget = this._pongTarget;
                    this._camera.rotationQuaternion = this._pongTarget;
                }
                else {
                    this._currentTarget = this._mainMenuTarget;
                    this._camera.rotationQuaternion = this._mainMenuTarget;
                }
            }
        });
        // Ball
        const ballSpeed = 0.1;
        // hide/show the Inspector
        window.addEventListener("keydown", (ev) => {
            // Shift+Ctrl+Alt+I
            if (ev.shiftKey && ev.ctrlKey && ev.altKey && (ev.key === "I" || ev.key === "i")) {
                if (this._scene.debugLayer.isVisible()) {
                    this._scene.debugLayer.hide();
                }
                else {
                    this._scene.debugLayer.show();
                }
            }
        });
    }
}
;
new App();
