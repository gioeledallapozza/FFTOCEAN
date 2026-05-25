import { OrbitControls } from '@react-three/drei';
import { Perf } from 'r3f-perf';
import Ocean from './Ocean.jsx';

export default function Experience() {

    return <>
        <Perf position="top-left" />
        <OrbitControls makeDefault />

        <Ocean />
    </>
}