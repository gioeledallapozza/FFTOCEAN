import { useMemo } from 'react';
import * as THREE from 'three'

import '../../../materials/SkyMaterial.js';


export default function Sky({ 
    topColor, bottomColor, 
    sunPosition, sunColor, sunDiskSize, sunGlowSize, sunDiskIntensity, sunGlowIntensity, 
    turbidity, rayleigh, 
})
{
    //convert to THREE.Color
    const topColorObj = useMemo(() => new THREE.Color(topColor), [topColor]); 
    const bottomColorObj = useMemo(() => new THREE.Color(bottomColor), [bottomColor]); 
    const sunColorObj = useMemo(() => new THREE.Color(sunColor), [sunColor])

    return (
        <mesh>
            <sphereGeometry args={[1000, 32, 32]} />
            <skyMaterial 
                uTopColor={topColorObj}
                uBottomColor={bottomColorObj}
                uSunPosition={sunPosition}
                uSunColor={sunColorObj}
                uSunDiskSize={sunDiskSize}
                uSunGlowSize={sunGlowSize}
                uSunDiskIntensity={sunDiskIntensity}
                uSunGlowIntensity={sunGlowIntensity}
                uTurbidity={turbidity}
                uRayleigh={rayleigh}
                side={2} // Backside enabled
                depthWrite={false} 
            />
        </mesh>
    );
}