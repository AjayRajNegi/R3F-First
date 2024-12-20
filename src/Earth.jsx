import * as THREE from "three";
import { useRef, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { useFrame } from "@react-three/fiber";
import earthVertexShader from "./shaders/earth/vertex.glsl";
import { OrbitControls, useTexture } from "@react-three/drei";
import earthFragmentShader from "./shaders/earth/fragment.glsl";
import atmosphereVertexShader from "./shaders/atmosphere/vertex.glsl";
import atmosphereFragmentShader from "./shaders/atmosphere/fragment.glsl";

// Earth Component
const Earth = ({ sunDirection }) => {
  const sphereRef = useRef();
  const shaderMaterialRef = useRef();

  // Load textures for the Earth
  const earthDayTexture = useTexture("/static/earth/day.jpg");
  const earthNightTexture = useTexture("/static/earth/night.jpg");
  const earthSpecularCloudsTexture = useTexture(
    "/static/earth/specularClouds.jpg"
  );

  // Optimize texture settings
  useMemo(() => {
    [earthDayTexture, earthNightTexture, earthSpecularCloudsTexture].forEach(
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = 8;
      }
    );
  }, [earthDayTexture, earthNightTexture, earthSpecularCloudsTexture]);

  // Animate the Earth and update shader uniforms every frame
  useFrame(() => {
    if (sphereRef.current) {
      sphereRef.current.rotation.y += 0.001;
    }
    // Update the sun direction in the shader material
    shaderMaterialRef.current.uniforms.uSunDirection.value.copy(sunDirection);
  });

  return (
    <mesh ref={sphereRef}>
      <sphereGeometry args={[2, 32, 32]} /> {/* Earth geometry */}
      <shaderMaterial
        ref={shaderMaterialRef}
        toneMapped={false}
        vertexShader={earthVertexShader}
        fragmentShader={earthFragmentShader}
        uniforms={{
          uDayTexture: { value: earthDayTexture },
          uNightTexture: { value: earthNightTexture },
          uSpecularCloudsTexture: { value: earthSpecularCloudsTexture },
          uSunDirection: { value: sunDirection },
          uAtmosphereDayColor: { value: new THREE.Color("#00aaff") },
          uAtmosphereTwilightColor: { value: new THREE.Color("#ff6600") },
        }}
      />
    </mesh>
  );
};

// Sun Component
const Sun = ({ sunDirection }) => (
  <mesh position={sunDirection.clone().multiplyScalar(4)}>
    {/* Position based on sunDirection */}
    <icosahedronGeometry args={[0.1, 2]} />
    <meshBasicMaterial color="yellow" />
  </mesh>
);

// Atmosphere Component
const Atmosphere = ({ sunDirection }) => {
  const atmosphereRef = useRef(); // Ref for atmosphere shader material

  useFrame(() => {
    atmosphereRef.current.uniforms.uSunDirection.value.copy(sunDirection);
  });

  return (
    <mesh scale={1.04}>
      {/* Slightly larger than the Earth */}
      <sphereGeometry args={[2, 32, 32]} /> {/* Atmosphere geometry */}
      <shaderMaterial
        ref={atmosphereRef}
        toneMapped={false}
        side={THREE.BackSide}
        transparent={true}
        vertexShader={atmosphereVertexShader}
        fragmentShader={atmosphereFragmentShader}
        uniforms={{
          uSunDirection: { value: sunDirection },
          uAtmosphereDayColor: { value: new THREE.Color("#00aaff") },
          uAtmosphereTwilightColor: { value: new THREE.Color("#ff6600") },
        }}
      />
    </mesh>
  );
};

// Main Canvas Component
const EarthCanvas = () => {
  // Calculate sun direction and store it in a normalized vector
  const sunDirection = useMemo(
    () => new THREE.Vector3(0, 0, 1).normalize(),
    []
  );

  return (
    <div className="canvasMain">
      <div className="Hello">
        <div className="testing">Testing</div>
      </div>
      <div className="canva">
        <Canvas camera={{ position: [12, 5, 1], fov: 25 }} className="c">
          <OrbitControls enableZoom={false} />
          <mesh>
            <Earth sunDirection={sunDirection} />
            <Sun sunDirection={sunDirection} />
            <Atmosphere sunDirection={sunDirection} />
          </mesh>
        </Canvas>
      </div>
      <div className="Hello">Hello</div>
    </div>
  );
};

export default EarthCanvas;
