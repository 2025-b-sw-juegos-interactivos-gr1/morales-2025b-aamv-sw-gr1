// app.js
window.addEventListener('DOMContentLoaded', function () {
  const canvas = document.getElementById('renderCanvas');
  const engine = new BABYLON.Engine(canvas, true);

  const createScene = function () {
    var scene = new BABYLON.Scene(engine);

    // --- CAMBIO 1: Activar Gravedad y Colisiones en la Escena ---
    // Esto hará que la cámara "caiga" si no hay suelo.
    scene.gravity = new BABYLON.Vector3(0, -0.9, 0); // Ajusta -0.9 a la fuerza de gravedad que quieras
    scene.collisionsEnabled = true;

    // --- CAMBIO 2: Cambiar a FreeCamera ---
    // Esta cámara se mueve con WASD y mira con el ratón.
    // La ponemos en (0, 5, -15) para que empiece en el suelo, mirando la pista.
    // Empezamos desde 15 unidades de altura para asegurar que caiga sobre la pista
var camera = new BABYLON.FreeCamera('camera1', new BABYLON.Vector3(0, 200, -15), scene);
    camera.setTarget(BABYLON.Vector3.Zero());
    camera.attachControl(canvas, true);

    // --- CAMBIO 3: Configurar la Cámara para Colisiones ---
    camera.checkCollisions = true;  // Activa colisiones para la cámara
    camera.applyGravity = false;     // Hace que la gravedad afecte a la cámara

    // Definimos el "cuerpo" del jugador (un elipsoide) para colisionar.
    // Esto es como la 'hitbox' del jugador: 2 unidades de alto, 0.5 de radio.
    camera.ellipsoid = new BABYLON.Vector3(0.5, 1, 0.5);

    var light = new BABYLON.HemisphericLight('light', new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.9;

    // --- CARGAR LA PISTA DE CARRERAS (GLB) ---
    BABYLON.SceneLoader.ImportMesh(
      '',
      './assets/models/pistaCarreras/', // Ruta a la carpeta
      'pista_carreras.glb',             // Nombre del archivo .glb
      scene,
      function (meshes, particleSystems, skeletons, animationGroups) {
        
        // Detener animaciones (como antes)
        if (animationGroups && animationGroups.length > 0) {
          animationGroups.forEach(animGroup => animGroup.stop());
        }
        
        // --- CAMBIO: Lógica para eliminar coches ---
        console.log("Revisando mallas para eliminar coches...");
        
        meshes.forEach(function(mesh) {
          
          // Comprueba si el nombre de la malla comienza con "car_" o "tire_"
          if (mesh.name.startsWith("car_") || mesh.name.startsWith("tire_")) {
            
            console.log("Quitando malla de coche: " + mesh.name);
            mesh.dispose(); // <-- ESTO LOS ELIMINA

          } else {
            
            // Si NO es un coche, activa sus colisiones (para la pista, etc.)
            // No actives colisiones en el "__root__" (causa problemas)
            if (mesh.name !== "__root__") {
               mesh.checkCollisions = true;
            }

          }
        });

        if (meshes.length > 0) {
          const pista = meshes[0];
          pista.position = BABYLON.Vector3.Zero();
          console.log('Pista cargada exitosamente.');

          // --- CAMBIO 4: Activar Colisiones en el Modelo ---
          // Recorremos todas las mallas cargadas del GLB
          // y les decimos que participen en las colisiones.
          meshes.forEach(function(mesh) {
            mesh.checkCollisions = true;
          });
        }
      },
      null, // Callback de progreso
      function (scene, message, exception) {
        console.error('Error al cargar la pista:', message, exception);
      }
    );
    
    // --- CAMBIO 5: (Recomendado) Añadir un suelo de colisión ---
    // Es bueno tener un suelo grande por si te sales de la pista.
    // Lo hacemos invisible (isVisible = false) pero con colisiones.
    var ground = BABYLON.MeshBuilder.CreateGround('ground', { width: 500, height: 500 }, scene);
    ground.position.y = -0.1; // Justo debajo de la pista
    ground.checkCollisions = true;
    ground.isVisible = false; // No queremos verlo, solo colisionar con él

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