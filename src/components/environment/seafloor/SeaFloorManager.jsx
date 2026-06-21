import React from 'react';
import { useControls } from 'leva';
import SeaFloor from './SeaFloor.jsx';

export default function SeaFloorManager({ waterDeepColor }) {
    
    const { 
        sandColor, 
        maxDepth,
        textureScale
    } = useControls('Sea Floor', {
        sandColor: { value: '#ffffff' },
        maxDepth: { value: 171.0, min: 0.0, max: 200.0, step: 1.0 },
        textureScale: { value: 100.0, min: 1.0, max: 500.0, step: 1.0 }
    }, { collapsed: true });

    return (
        <SeaFloor 
            waterDeepColor={waterDeepColor}
            sandColor={sandColor}
            maxDepth={maxDepth}
            textureScale={textureScale}
        />
    );
}