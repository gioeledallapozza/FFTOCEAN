import { useTexture } from '@react-three/drei'
import * as THREE from 'three'

//Custom hook to load all the textures we need
export function useTextures() {


    const textures = useTexture({
        foam: '/textures/foam/foam.webp',
        sand: '/textures/sand/sand.webp'
        // normal: '/textures/normal/normals.webp', // to do
    });


    // Textures configuration
    Object.values(textures).forEach((texture) => {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;

        texture.minFilter = THREE.LinearMipmapLinearFilter; 

        texture.needsUpdate = true;
    });

    return textures;
}