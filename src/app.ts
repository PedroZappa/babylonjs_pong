import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import {
  Engine, Scene, ArcRotateCamera, HemisphericLight,
  Mesh, MeshBuilder,
  Vector3,
  Color4
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

  // Game State


  constructor() {
    // create the canvas html element and attach it to the webpage
    this._canvas = this._createCanvas();
    // initialize babylon this._scene and this._engine
    this._engine = new Engine(this._canvas, true);
    this._scene = new Scene(this._engine);
    this._camera = new ArcRotateCamera("Camera",
      (Math.PI / 2), (Math.PI / 2), 2, Vector3.Zero(),
      this._scene
    );
    this._camera.attachControl(this._canvas, true);
    this._light = new HemisphericLight("hemisphericLight",
      new Vector3(1, 1, 0),
      this._scene
    );

    // Start Loading
    this._engine.displayLoadingUI();
    this._scene.detachControl();

    // Create Objects
    this._ball = MeshBuilder.CreateSphere("ball", { diameter: .1 }, this._scene);
    this._lpaddle = MeshBuilder.CreateBox("lpaddle", { width: .1, height: 0.3, depth: .05 }, this._scene);
    this._rpaddle = MeshBuilder.CreateBox("rpaddle", { width: .1, height: 0.3, depth: .05 }, this._scene);
    this._ball.position = new Vector3(0, 0, 0);
    this._lpaddle.position = new Vector3(-1.4, 0, 0);
    this._rpaddle.position = new Vector3(1.4, 0, 0);

    /// @brief Event Listeners
    this._setupEvents();

    // Done Loading
    this._engine.hideLoadingUI();

    // Run the main render loop
    this._main();
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

  private async _main(): Promise<void> {
    // Initialize the application
    await this._init();

    // Render Loop
    this._engine.runRenderLoop(() => {
      this._scene.clearColor = new Color4(0, 0, 0, 1);

      this._scene.render();
    });
  }

  private async _init() {
  }

}
new App();
