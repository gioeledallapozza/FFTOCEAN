import { folder, useControls } from 'leva';
import SeaFloor from './SeaFloor.jsx';

export default function SeaFloorManager({ waterDeepColor, waterShallowColor }) {
    
    const { 
        sandColor, 
        sandHeight,
        maxDepth,
        textureScale,
        causticsIntensity,
        causticsSpeed,
        causticsScale,
        proximityNear,
        proximityFar,
        minWaterTint
    } = useControls('Sea Floor', {
        Basic: folder({
            sandColor: { value: '#ffffff' },
            sandHeight: { value: -50, min: -200, max: 100, step: 1.0 },
            maxDepth: { value: 171.0, min: 0.0, max: 200.0, step: 1.0 },
            textureScale: { value: 100.0, min: 1.0, max: 500.0, step: 1.0 }
        }, {collapsed: true}),
        Caustics: folder({
            causticsIntensity: { value: 0.9, min: 0.0, max: 5.0, step: 0.1 },
            causticsSpeed: { value: 0.1, min: 0.0, max: 1.0, step: 0.01 },
            causticsScale: { value: 0.01, min: 0.001, max: 1.0, step: 0.001 }
        }, { collapsed: true }),
        Proximity: folder({
            proximityNear: { value: 15.0, min: 0.0, max: 50.0, step: 0.1 },
            proximityFar: { value: 300.0, min: 10.0, max: 5000.0, step: 1.0 },
            minWaterTint: { value: 0.53, min: 0.0, max: 1.0, step: 0.01 }
    }, { collapsed: true })
    });

    return (
        <>
            <SeaFloor 
                waterDeepColor={waterDeepColor}
                waterShallowColor={waterShallowColor}
                sandColor={sandColor}
                sandHeight={sandHeight}
                maxDepth={maxDepth}
                textureScale={textureScale}
                causticsIntensity={causticsIntensity}
                causticsSpeed={causticsSpeed}
                causticsScale={causticsScale}
                proximityNear={proximityNear}
                proximityFar={proximityFar}
                minWaterTint={minWaterTint}
            />
        </>
    );
}