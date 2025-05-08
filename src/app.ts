import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import {
  Engine, Scene,
  ArcRotateCamera,
  FreeCamera,
  HemisphericLight,
  Mesh, MeshBuilder,
  StandardMaterial,
  Vector3,
  Color3, Color4,
  UtilityLayerRenderer,
  Quaternion,
  Animation,
} from "@babylonjs/core";
import {
  GUI3DManager,
  StackPanel3D,
  HolographicButton, Button3D,
  TextBlock,
} from "@babylonjs/gui";

class App {
  // Global App
  private _scene: Scene;
  private _canvas: HTMLCanvasElement;
  private _engine: Engine;
  private _gui3dManager: GUI3DManager;

  private _camera: FreeCamera;
  private _light: HemisphericLight;

  // Scene Objects
  private _ball: Mesh;
  private _lpaddle: Mesh;
  private _rpaddle: Mesh;

  private _belowPlane: Mesh;
  private _perpendicularPlane: Mesh;

  // GUI Controls

  // Targets
  private _pongTarget: Vector3;
  private _mainMenuTarget: Vector3;
  private _currentTarget: Vector3;

  // Game State


  constructor() {
    this._init();

    // initialize babylon this._scene and this._engine
    this._engine = new Engine(this._canvas, true);
    this._scene = new Scene(this._engine);
    this._scene.clearColor = new Color4(0, 0, 0, 1);
    this._gui3dManager = new GUI3DManager(this._scene);

    const utilLayer = new UtilityLayerRenderer(this._scene);
    this._camera = new FreeCamera("camera", new Vector3(0, 0, 3), this._scene);
    this._camera.rotationQuaternion = Quaternion.FromEulerAngles(0, 0, 0);
    // this._camera.setTarget(Vector3.Zero());
    this._camera.attachControl(this._canvas, true);

    this._light = new HemisphericLight("hemisphericLight",
      new Vector3(1, 1, 0),
      this._scene
    );

    // Run the main render loop
    this._main();
  }

  private async _main(): Promise<void> {
    await this._init();

    // Render Loop
    this._engine.runRenderLoop(() => {
      this._scene.render();
    });
  }

  private async _init() {
    // create the canvas html element and attach it to the webpage
    this._canvas = this._createCanvas();

    // Create Objects
    this._createObjects();

    // Create GUI Controls
    this._addControls();

    /// Event Listeners
    this._setupEvents();

    // Init Targets
    this._pongTarget = Vector3.Zero();
    this._mainMenuTarget = new Vector3(Math.PI, 0, 0);
    this._currentTarget = this._mainMenuTarget;
  }

  private _createCanvas(): HTMLCanvasElement {
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

  private _setupEvents(): void {
    window.addEventListener("resize", () => {
      this._engine.resize();
    });
    // Paddles
    const paddleSpeed = 0.07;
    const paddleLimit = 0.66;

    function clampPaddle(paddle: Mesh) {
      if (paddle.position.y > paddleLimit) paddle.position.y = paddleLimit;
      if (paddle.position.y < -paddleLimit) paddle.position.y = -paddleLimit;
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
        // Toggle between pong and main menu targets
        if (this._currentTarget === this._pongTarget) {
          this._currentTarget = this._mainMenuTarget;
          this.animationCamera(this._mainMenuTarget);
        } else {
          this._currentTarget = this._pongTarget;
          this.animationCamera(this._pongTarget);
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
        } else {
          this._scene.debugLayer.show();
        }
      }
    });
  }

  private _createObjects(): void {
    // Ball
    this._ball = MeshBuilder.CreateSphere("ball", { diameter: .1 }, this._scene);
    this._ball.position = new Vector3(0.1, 0, 0);

    // Paddles
    this._lpaddle = MeshBuilder.CreateBox("lpaddle", { width: .1, height: 0.3, depth: .05 }, this._scene);
    this._rpaddle = MeshBuilder.CreateBox("rpaddle", { width: .1, height: 0.3, depth: .05 }, this._scene);
    this._lpaddle.position = new Vector3(-1.4, 0, 0);
    this._rpaddle.position = new Vector3(1.4, 0, 0);

    // Planes
    const belowPlaneMaterial = new StandardMaterial("belowPlaneMat", this._scene);
    belowPlaneMaterial.diffuseColor = new Color3(0, 1, 0); // Green

    this._belowPlane = MeshBuilder.CreatePlane("xzPlane", { size: 5 }, this._scene);
    this._belowPlane.rotation.x = Math.PI; // 180° around the X axis
    this._belowPlane.position.y = -1; // Below the main plane
    this._belowPlane.material = belowPlaneMaterial;

    const perpendicularPlaneMaterial = new StandardMaterial("perpPlaneMat", this._scene);
    perpendicularPlaneMaterial.diffuseColor = new Color3(1, 0, 0); // Red

    this._perpendicularPlane = MeshBuilder.CreatePlane("yxPlane", { size: 5 }, this._scene);
    this._perpendicularPlane.rotation.x = (Math.PI / 2); // -90° around the Y axis (YZ plane)
    this._perpendicularPlane.position.set(0.0, -2, 2.5); // Adjust as needed
    this._perpendicularPlane.rotation.z = (Math.PI / 2); // 90° around the Z axis (XZ plane) for perpendicular
    this._perpendicularPlane.material = perpendicularPlaneMaterial;
  }

  private _addControls(): void {
    const mainPanel = new StackPanel3D();
    mainPanel.position = new Vector3(0, -2, -1);
    mainPanel.isVertical = true;
    mainPanel.margin = 0.1;

    this._gui3dManager.addControl(mainPanel);

    const btn = new HolographicButton("Zedro");
    mainPanel.addControl(btn);
    const btnTxt = new TextBlock();
    btnTxt.text = "Zedro";
    btnTxt.color = "Purple";
    btnTxt.fontSize = 44;
    btn.content = btnTxt;
    btn.node.rotate(Vector3.Up(), Math.PI);
    btn.node.rotate(Vector3.Right(), Math.PI / 2);
    btn.node.position = new Vector3(5, 6, 2);
  }

  private animationCamera(vec: Vector3): void {
    let framerate = 20;

    let animateRotation = new Animation("animRotation",
      "rotationQuaternion",
      framerate,
      Animation.ANIMATIONTYPE_QUATERNION,
      Animation.ANIMATIONLOOPMODE_CONSTANT
    );
    var pos = Quaternion.FromEulerAngles(vec.x, vec.y, vec.z);

    let keyframeRotation = [];
    keyframeRotation.push({ frame: 0, value: this._camera.rotationQuaternion.clone() });
    keyframeRotation.push({ frame: 50, value: pos });
    this._camera.rotationQuaternion = pos;
    animateRotation.setKeys(keyframeRotation);

    this._camera.animations = [animateRotation];
    this._scene.beginAnimation(this._camera, 0, 50, false, 2);
  }
}
new App();
