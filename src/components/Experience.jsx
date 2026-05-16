import { OrbitControls } from '@react-three/drei';
import Ocean from './Ocean.jsx';

export default function Experience() {
    return <>
        <OrbitControls makeDefault />

        <Ocean />
    </>
}