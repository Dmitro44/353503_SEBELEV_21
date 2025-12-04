document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("bg-3d-scene");
    if (!canvas) return;

    // Настройка сцены
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000,
    );
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    // Освещение
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(0, 10, 0);
    scene.add(directionalLight);

    // Объекты сцены
    const roadGeometry = new THREE.PlaneGeometry(1000, 80);
    const roadMaterial = new THREE.MeshStandardMaterial({ color: 0x444444 });
    const road = new THREE.Mesh(roadGeometry, roadMaterial);
    road.rotation.x = -Math.PI / 2;
    road.position.y = -0.5;
    road.position.z = 0;
    road.position.x = 0;
    scene.add(road);

    const signGroup = new THREE.Group();

    // Столб
    const poleGeometry = new THREE.CylinderGeometry(1, 1, 20, 16); // радиус верх/низ, высота, сегменты
    const poleMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 }); // Серый цвет
    const pole = new THREE.Mesh(poleGeometry, poleMaterial);
    signGroup.add(pole);

    // Круглый знак
    const textureLoader = new THREE.TextureLoader();
    const signTexture = textureLoader.load(
        "/media/company/car-rental-logo-template-design_316488-1614-removebg-preview.png",
    );

    // Подложка для знака (белый круг)
    const signBackgroundGeometry = new THREE.CircleGeometry(20, 32);
    const signBackgroundMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
    });

    // Белый фон
    const signBackground = new THREE.Mesh(
        signBackgroundGeometry,
        signBackgroundMaterial,
    );
    signBackground.position.y = 25;
    signBackground.position.z = 1;
    signGroup.add(signBackground);

    // Лицевая часть знака с текстурой
    const signFaceGeometry = new THREE.CircleGeometry(20, 32);
    const signFaceMaterial = new THREE.MeshStandardMaterial({
        map: signTexture,
        transparent: true,
        side: THREE.DoubleSide,
    });
    const signFace = new THREE.Mesh(signFaceGeometry, signFaceMaterial);
    signFace.position.y = 25;
    signFace.position.z = 1.1;
    signGroup.add(signFace);

    // Позиционируем всю группу
    signGroup.position.set(80, 40, -30);
    scene.add(signGroup);

    let carModel = null;
    const loader = new THREE.GLTFLoader();
    const modelPath = "/static/models/car.glb";

    loader.load(
        modelPath,
        function (gltf) {
            carModel = gltf.scene;
            carModel.scale.set(1.5, 1.5, 1.5);
            carModel.rotation.y = Math.PI / 2;
            scene.add(carModel);
            updateCarPosition();
        },
        undefined,
        function (error) {
            console.error("Ошибка при загрузке 3D модели:", error);
            const carGeometry = new THREE.BoxGeometry(2, 1, 4);
            const carMaterial = new THREE.MeshStandardMaterial({
                color: 0xff0000,
            });
            carModel = new THREE.Mesh(carGeometry, carMaterial);
            scene.add(carModel);
            updateCarPosition();
        },
    );

    camera.position.set(40, 100, 80);
    camera.lookAt(0, 30, 0);

    // Логика анимации
    function updateCarPosition() {
        if (!carModel) return;

        const maxScroll =
            document.documentElement.scrollHeight - window.innerHeight;
        const currentScroll = window.scrollY;
        const scrollFraction = currentScroll / maxScroll;

        const startX = -200;
        const endX = 100;
        carModel.position.x = startX + (endX - startX) * scrollFraction;
        carModel.position.y = 0;
        carModel.position.z = 0;
    }

    window.addEventListener("scroll", updateCarPosition);
    updateCarPosition();

    function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }
    animate();

    // Адаптация под размер окна
    window.addEventListener("resize", () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
});
