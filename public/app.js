// app.js
window.addEventListener('DOMContentLoaded', function () {
  const canvas = document.getElementById('renderCanvas');
  const engine = new BABYLON.Engine(canvas, true);

  let player = null;

  const createScene = function () {
    const scene = new BABYLON.Scene(engine);

    // --- AMBIENTE NOCTURNO MEJORADO ---
    scene.clearColor = new BABYLON.Color3(0.03, 0.05, 0.1); // azul más visible
    scene.fogMode = BABYLON.Scene.FOGMODE_EXP;
    scene.fogDensity = 0.007; // niebla ligera
    scene.fogColor = new BABYLON.Color3(0.03, 0.05, 0.1);
    scene.collisionsEnabled = true;
    scene.gravity = new BABYLON.Vector3(0, -0.9, 0);

    // --- CÁMARA LIBRE ---
    const camera = new BABYLON.FreeCamera("freeCam", new BABYLON.Vector3(0, 50, -150), scene);
    camera.attachControl(canvas, true);
    camera.speed = 15;
    camera.inertia = 0.8;
    camera.angularSensibility = 1000;
    camera.keysUp.push(87); // W
    camera.keysDown.push(83); // S
    camera.keysLeft.push(65); // A
    camera.keysRight.push(68); // D
    camera.applyGravity = false;

    // --- LUZ DE LUNA ---
    const moonLight = new BABYLON.DirectionalLight("moonLight", new BABYLON.Vector3(-1, -2, -0.5), scene);
    moonLight.intensity = 0.6; // más brillante
    moonLight.diffuse = new BABYLON.Color3(0.7, 0.75, 1.0); // tono azulado de luna
    moonLight.specular = new BABYLON.Color3(0.8, 0.8, 1.0);

    // --- LUZ AMBIENTE GENERAL (suaviza sombras) ---
    const ambient = new BABYLON.HemisphericLight('ambient', new BABYLON.Vector3(0, 1, 0), scene);
    ambient.intensity = 0.35;
    ambient.diffuse = new BABYLON.Color3(0.4, 0.5, 0.7);
    ambient.groundColor = new BABYLON.Color3(0.1, 0.1, 0.2);

    // --- CIELO ESTRELLADO ---
    const starField = new BABYLON.PointLight("starLight", new BABYLON.Vector3(0, 300, 0), scene);
    starField.intensity = 0.9; // luz más intensa para dar claridad general
    starField.diffuse = new BABYLON.Color3(0.7, 0.8, 1.0);
    starField.range = 1000;

    // --- SIMULACIÓN DE ESTRELLAS (esferas pequeñas brillando) ---
    const stars = [];
    for (let i = 0; i < 150; i++) {
      const star = BABYLON.MeshBuilder.CreateSphere("star" + i, { diameter: 0.5 }, scene);
      star.position = new BABYLON.Vector3(
        (Math.random() - 0.5) * 800,
        200 + Math.random() * 150,
        (Math.random() - 0.5) * 800
      );
      const mat = new BABYLON.StandardMaterial("starMat" + i, scene);
      mat.emissiveColor = new BABYLON.Color3(0.6 + Math.random() * 0.4, 0.6 + Math.random() * 0.4, 1);
      mat.disableLighting = true;
      star.material = mat;
      stars.push(star);
    }

    // Parpadeo suave de las estrellas
    scene.onBeforeRenderObservable.add(() => {
      const time = performance.now() * 0.002;
      stars.forEach((star, i) => {
        const mat = star.material;
        mat.emissiveColor = new BABYLON.Color3(
          0.5 + 0.5 * Math.sin(time + i),
          0.5 + 0.5 * Math.sin(time * 1.1 + i),
          0.8 + 0.2 * Math.cos(time + i * 0.3)
        );
      });
    });

// --- CARGAR PISTA PRIMERO ---
let trackPath = [];

const loadTrack = new Promise((resolve) => {
  BABYLON.SceneLoader.ImportMesh("", "./assets/models/pistaCarreras/", "pista_carreras.glb", scene,
    function (meshes, particleSystems, skeletons, animationGroups) {
      
      console.log("=== EXTRACCIÓN DE TRAYECTORIA ===");
      
      // EXTRAER la trayectoria de "car_1"
      if (animationGroups && animationGroups.length > 0) {
        const mainAnim = animationGroups.find(ag => ag.name === "Main");
        
        if (mainAnim) {
          console.log("Animation Group 'Main' encontrado");
          
          // Buscar la animación de posición de car_1
          const carPosAnim = mainAnim.targetedAnimations.find(ta => 
            ta.target.name === "car_1" && ta.animation.targetProperty === "position"
          );
          
          if (carPosAnim) {
            const keys = carPosAnim.animation.getKeys();
            trackPath = keys.map(key => ({
              frame: key.frame,
              value: key.value.clone()
            }));
            
            console.log("✓ Trayectoria extraída:", trackPath.length, "keyframes");
            console.log("  Primer punto:", trackPath[0].value.toString());
            console.log("  Último punto:", trackPath[trackPath.length - 1].value.toString());
          } else {
            console.warn("No se encontró animación de posición para car_1");
          }
          
          // Detener y eliminar las animaciones
          mainAnim.stop();
          mainAnim.dispose();
        }
      }
      
      // Eliminar los carros y llantas
      const toDelete = [];
      meshes.forEach(mesh => {
        if (mesh.name.startsWith("car_") || mesh.name.startsWith("tire_")) {
          toDelete.push(mesh);
        } else if (mesh.name !== "__root__") {
          mesh.checkCollisions = true;
          if (mesh.material) {
            mesh.material.diffuseColor = new BABYLON.Color3(0.12, 0.12, 0.18);
            mesh.material.emissiveColor = new BABYLON.Color3(0.05, 0.05, 0.1);
          }
        }
      });
      
      // Eliminar carros
      toDelete.forEach(mesh => mesh.dispose());
      console.log("Eliminados", toDelete.length, "meshes de carros");
      console.log("Pista cargada.");
      
      resolve(); // Señalar que terminó de cargar
    }
  );
});

    // --- CARGAR JINETE ---
    // --- CARGAR JINETE ---
// --- CARGAR JINETE DESPUÉS DE LA PISTA ---
loadTrack.then(() => {
  console.log("Ahora cargando jinete con trayectoria disponible...");
  
  BABYLON.SceneLoader.ImportMesh("", "./assets/models/jineteCerdo/", "jinete.glb", scene,
    function (meshes) {
      player = meshes[0];
      player.name = "jineteCerdo";
      player.scaling = new BABYLON.Vector3(10, 10, 10);
      player.checkCollisions = true;

      // USAR LA POSICIÓN INICIAL DEL CARRO
      if (trackPath.length > 0) {
        const startPos = trackPath[75].value;
        player.position = new BABYLON.Vector3(startPos.x, startPos.y + 25, startPos.z);
        console.log("Posición inicial del jinete:", player.position.toString());
      } else {
        // Fallback si no hay trayectoria
        player.position = new BABYLON.Vector3(0,25, -70);
      }

      player.getChildMeshes().forEach(m => {
        if (m.material) {
          m.material.emissiveColor = new BABYLON.Color3(0.08, 0.08, 0.12);
          m.material.diffuseColor = new BABYLON.Color3(0.1, 0.1, 0.15);
        }
      });

      // APLICAR la trayectoria extraída del circuito
      if (trackPath.length > 0) {
        console.log("✓ Aplicando trayectoria del circuito al jinete...");
        
        const animation = new BABYLON.Animation(
          "moveAlongTrack",
          "position",
          30,
          BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
          BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
        );

        // Ajustar altura Y de cada punto
        const adjustedPath = trackPath.map(point => ({
          frame: point.frame,
          value: new BABYLON.Vector3(point.value.x+65, point.value.y + 25, point.value.z)
        }));

        animation.setKeys(adjustedPath);
        player.animations = [animation];
        
        const lastFrame = trackPath[trackPath.length - 1].frame;
        scene.beginAnimation(player, 0, lastFrame, true, 0.5);
        
        console.log("✓ Animación aplicada:", trackPath.length, "keyframes, hasta frame:", lastFrame);
      }

      // Rotación
      scene.onBeforeRenderObservable.add(() => {
        const pos = player.position;
        player.rotation.y = Math.atan2(pos.x, pos.z);
      });

      console.log("✓ Jinete cargado y animado.");
    }
  );
});

    // --- SUELO INVISIBLE ---
    const ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 500, height: 500 }, scene);
    ground.position.y = -0.1;
    ground.checkCollisions = true;
    ground.isVisible = false;

    return scene;
  };

  const scene = createScene();

  engine.runRenderLoop(function () {
    scene.render();
  });

  window.addEventListener("resize", function () {
    engine.resize();
  });
});
