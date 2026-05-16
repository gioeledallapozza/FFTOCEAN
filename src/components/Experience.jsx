import { OrbitControls } from '@react-three/drei';

export default function Experience() {

    return <>
        <OrbitControls makeDefault />

        <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[10, 10, 128, 128]} />
            <meshBasicMaterial color='#00ffff' wireframe />
        </mesh>
    </>
}