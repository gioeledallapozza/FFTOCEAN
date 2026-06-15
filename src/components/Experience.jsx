import { OrbitControls } from '@react-three/drei';
import { Perf } from 'r3f-perf';
import OceanManager from './ocean/OceanManager.jsx';

export default function Experience() {

    return <>
        <Perf position="top-left" />
        <OrbitControls makeDefault />

        <OceanManager />
    </>
}