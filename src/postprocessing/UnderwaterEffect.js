import { Effect, EffectAttribute } from 'postprocessing'
import { Uniform, Color } from 'three'
import fragmentShader from '../materials/shaders/postprocessing/underwaterFragment.glsl'

export class UnderwaterEffect extends Effect {
   constructor({ oceanDataRef, camera }) {
        super('UnderwaterEffect', fragmentShader, {
            // NEEDS the depth buffer
            attributes: EffectAttribute.DEPTH,
            uniforms: new Map([
                ['uDisplacementY', new Uniform(null)], 
                ['uPatchSize', new Uniform(250.0)], 
                ['uScale', new Uniform(1.0)],
                ['uFogColor', new Uniform(new Color('#000000'))],
                ['uWaterClarity', new Uniform(60.0)], // Fallback iniziale
                ['uCameraPosition', new Uniform(camera.position.clone())],
                ['uCameraNear', new Uniform(camera.near)],
                ['uCameraFar', new Uniform(camera.far)]
            ])
        })
        this.camera = camera
        this.oceanDataRef = oceanDataRef
    }

    update() {
        // Update camera position
        this.uniforms.get('uCameraPosition').value.copy(this.camera.position)
        
        // Extract the params to update the post processing effect uniforms
        if (this.oceanDataRef && this.oceanDataRef.current) {
            const data = this.oceanDataRef.current;
            
            if (data.displacementY) {
                this.uniforms.get('uDisplacementY').value = data.displacementY;
                this.uniforms.get('uPatchSize').value = data.patchSize;
                this.uniforms.get('uScale').value = data.scale;
                this.uniforms.get('uFogColor').value.set(data.waterDeepColor);
                this.uniforms.get('uWaterClarity').value = data.waterClarity + 32.0;
            }
        }
    }
}