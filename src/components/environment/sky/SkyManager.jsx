import { useControls, folder } from 'leva';
import Sky from './Sky';

export default function SkyManager({sunPosition, sunColor, topColor, bottomColor, turbidity, sunGlowSize, sunDiskSize, sunDiskIntensity, sunGlowIntensity}) {

    const { 
        rayleigh,
    } = useControls('Sky', {
        Atmosphere: folder({
            rayleigh: { value: 1.2, min: 0, max: 4, step: 0.1 },
        }),
    }, { collapsed: true });

    return (
        <Sky 
            topColor={topColor} 
            bottomColor={bottomColor}
            sunPosition={sunPosition}
            sunColor={sunColor}
            sunDiskSize={sunDiskSize}
            sunGlowSize={sunGlowSize}
            sunDiskIntensity={sunDiskIntensity}
            sunGlowIntensity={sunGlowIntensity}
            turbidity={turbidity}
            rayleigh={rayleigh}
        />
    );
}