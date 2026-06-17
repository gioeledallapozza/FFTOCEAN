import { useControls, folder } from 'leva';
import Sky from './Sky';

export default function SkyManager({sunPosition, sunColor}) {

    const { topColor, bottomColor, 
            turbidity, rayleigh, 
            sunDiskSize, sunGlowSize, sunDiskIntensity, sunGlowIntensity 
    } = useControls('Sky', {
        Atmosphere: folder({
            topColor: { value: '#064289' },
            bottomColor: { value: '#79b8d9' },
            turbidity: { value: 3.0, min: 0.1, max: 20, step: 0.1 },
            rayleigh: { value: 1.2, min: 0, max: 4, step: 0.1 },
        }),
        SunStyle: folder({
            sunDiskSize: { value: 0.9999, min: 0.9800, max: 0.99999, step: 0.00001 },
            sunGlowSize: { value: 0.992, min: 0.900, max: 0.9999, step: 0.0001 },
            sunDiskIntensity: { value: 1.5, min: 0.0, max: 10.0, step: 0.1 },
            sunGlowIntensity: { value: 4.5, min: 0.0, max: 5.0, step: 0.1 },
        })
    }, { collapsed: true });

    return (
        <Sky 
            topColor = {topColor} 
            bottomColor = {bottomColor}
            sunPosition = {sunPosition}
            sunColor = {sunColor}
            sunDiskSize = {sunDiskSize}
            sunGlowSize = {sunGlowSize}
            sunDiskIntensity = {sunDiskIntensity}
            sunGlowIntensity = {sunGlowIntensity}
            turbidity = {turbidity}
            rayleigh = {rayleigh}
        />
    );
}