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

  // UI

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
    this._light = new HemisphericLight("light1",
      new Vector3(1, 1, 0),
      this._scene
    );

    // Start Loading
    this._engine.displayLoadingUI();
    this._scene.detachControl();

    var sphere: Mesh = MeshBuilder.CreateSphere("sphere", { diameter: .2 }, this._scene);
    var lpaddle: Mesh = MeshBuilder.CreateBox("lpaddle", { width: .1, height: 1, depth: .1 }, this._scene);
    var rpaddle: Mesh = MeshBuilder.CreateBox("rpaddle", { width: .1, height: 1, depth: .1 }, this._scene);
    sphere.position = new Vector3(0, 0, 0);
    lpaddle.position = new Vector3(-1, 0, 0);
    rpaddle.position = new Vector3(1, 0, 0);

    /// Event Listeners
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
    //
    // Done Loading
    this._engine.hideLoadingUI();

    // Run the main render loop
    this._main();
  }


  private _createCanvas(): HTMLCanvasElement {

    // Commented out for development
    // document.documentElement.style["overflow"] = "hidden";
    // document.documentElement.style.overflow = "hidden";
    // document.documentElement.style.width = "100%";
    // document.documentElement.style.height = "100%";
    // document.documentElement.style.margin = "0";
    // document.documentElement.style.padding = "0";
    // document.body.style.overflow = "hidden";
    // document.body.style.width = "100%";
    // document.body.style.height = "100%";
    // document.body.style.margin = "0";
    // document.body.style.padding = "0";

    // Create the canvas html element and attach it to the webpage
    this._canvas = document.createElement("canvas");
    this._canvas.style.width = "100%";
    this._canvas.style.height = "100%";
    this._canvas.id = "gameCanvas";
    document.body.appendChild(this._canvas);

    return this._canvas;
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
