// app.js - escena de ejemplo que carga texturas locales desde public/assets/textures
window.addEventListener('DOMContentLoaded', function () {
  const canvas = document.getElementById('renderCanvas');
  const engine = new BABYLON.Engine(canvas, true);

  const createScene = function () {
    var scene = new BABYLON.Scene(engine);

    var camera = new BABYLON.FreeCamera('camera1', new BABYLON.Vector3(0, 5, -15), scene);
    camera.setTarget(BABYLON.Vector3.Zero());
    camera.attachControl(canvas, true);

    var light = new BABYLON.HemisphericLight('light', new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.9;

    // Rutas locales (coloca tus texturas en public/assets/textures/)
    const base = 'assets/textures/';

    var woodMat = new BABYLON.StandardMaterial('woodMat', scene);
    woodMat.diffuseTexture = new BABYLON.Texture(base + 'wood.jpg', scene);

    var box = BABYLON.MeshBuilder.CreateBox('box', { size: 2 }, scene);
    box.position = new BABYLON.Vector3(-4, 1, 0);
    box.material = woodMat;

    var marbleMat = new BABYLON.StandardMaterial('marbleMat', scene);
    marbleMat.diffuseTexture = new BABYLON.Texture(base + 'marble.jpg', scene);

    var sphere = BABYLON.MeshBuilder.CreateSphere('sphere', { diameter: 2 }, scene);
    sphere.position = new BABYLON.Vector3(-1.5, 1, 0);
    sphere.material = marbleMat;

    var metalMat = new BABYLON.StandardMaterial('metalMat', scene);
    metalMat.diffuseTexture = new BABYLON.Texture(base + 'metal.jpg', scene);

    var cylinder = BABYLON.MeshBuilder.CreateCylinder('cylinder', { height: 2, diameter: 1.5 }, scene);
    cylinder.position = new BABYLON.Vector3(1.5, 1, 0);
    cylinder.material = metalMat;

    var brickMat = new BABYLON.StandardMaterial('brickMat', scene);
    brickMat.diffuseTexture = new BABYLON.Texture(base + 'brick.jpg', scene);

    var torus = BABYLON.MeshBuilder.CreateTorus('torus', { diameter: 2, thickness: 0.5 }, scene);
    torus.position = new BABYLON.Vector3(4, 1, 0);
    torus.material = brickMat;

    var groundMat = new BABYLON.StandardMaterial('groundMat', scene);
    groundMat.diffuseTexture = new BABYLON.Texture(base + 'grass.jpg', scene);

    var ground = BABYLON.MeshBuilder.CreateGround('ground', { width: 12, height: 12 }, scene);
    ground.material = groundMat;

    // Cargar modelo del Yeti (glTF)
    BABYLON.SceneLoader.ImportMesh(
      '',
      './assets/models/',
      'Yeti.gltf',
      scene,
      function (meshes) {
        // Ajustar posición y escala del yeti
        if (meshes.length > 0) {
          const yeti = meshes[0];
          yeti.position = new BABYLON.Vector3(0, 0, 3);
          yeti.scaling = new BABYLON.Vector3(0.5, 0.5, 0.5); // Ajusta según tamaño
          console.log('Yeti cargado exitosamente:', meshes);
        }
      },
      function (event) {
        // Progreso de carga
        if (event.lengthComputable) {
          console.log('Cargando Yeti: ' + (event.loaded * 100 / event.total).toFixed(0) + '%');
        }
      },
      function (scene, message, exception) {
        console.error('Error al cargar el modelo del Yeti:', message, exception);
      }
    );

    return scene;
  };

  const scene = createScene();

  engine.runRenderLoop(function () {
    scene.render();
  });

  window.addEventListener('resize', function () {
    engine.resize();
  });
});
