import { useControls, folder } from 'leva';
import Sky from './Sky';

export default function SkyManager({sunPosition, sunColor, topColor, bottomColor, turbidity, rayleigh, sunGlowSize, sunDiskSize, sunDiskIntensity, sunGlowIntensity}) {

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