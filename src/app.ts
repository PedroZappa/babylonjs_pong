import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import {
  Engine, Scene,
  ArcRotateCamera,
  HemisphericLight,
  Mesh, MeshBuilder,
  StandardMaterial,
  Vector3,
  Color3, Color4,
} from "@babylonjs/core";
// import { AdvancedDynamicTexture, Button, Control } from "@babylonjs/gui";

class App {
  // Global App
  private _scene: Scene;
  private _canvas: HTMLCanvasElement;
  private _engine: Engine;
  private _camera: ArcRotateCamera;
  private _light: HemisphericLight;

  // Scene Objects
  private _ball: Mesh;
  private _lpaddle: Mesh;
  private _rpaddle: Mesh;

  private _belowPlane: Mesh;
  private _perpendicularPlane: Mesh;

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

    this._camera = new ArcRotateCamera("Camera",
      Math.PI / 2,
      Math.PI / 2,
      2,
      Vector3.Zero(),
      this._scene
    );
    this._camera.setTarget(Vector3.Zero());
    this._camera.attachControl(this._canvas, true);
    this._scene.activeCamera = this._camera;

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

    /// Event Listeners
    this._setupEvents();

    // Init Targets
    this._pongTarget = Vector3.Zero();
    this._mainMenuTarget = new Vector3(0, -2 * Math.PI, 0);
    this._currentTarget = this._pongTarget;
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
          this._rpaddle.position.y += paddleSpeed;
          clampPaddle(this._rpaddle);
          break;
        case "ArrowDown":
          this._rpaddle.position.y -= paddleSpeed;
          clampPaddle(this._rpaddle);
          break;
        case "w":
          this._lpaddle.position.y += paddleSpeed;
          clampPaddle(this._lpaddle);
          break;
        case "s":
          this._lpaddle.position.y -= paddleSpeed;
          clampPaddle(this._lpaddle);
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
        } else {
          this._currentTarget = this._pongTarget;
        }
        this._camera.setTarget(this._currentTarget);
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

}
new App();
