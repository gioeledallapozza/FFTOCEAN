import * as THREE from 'three';


export class ClipmapGeometry extends THREE.BufferGeometry {
    constructor(resolution = 256, levels = 5, baseVertexSpacing = 1.0) {
        super();

        //Resolution must be dividable by 4
        if (resolution % 4 !== 0) {
            resolution = Math.ceil(resolution / 4) * 4;
        }

        //Resolution scale
        const m = resolution;
        const halfM = m / 2;
        const quarterM = m / 4;
        const threeQuarterM = 3 * m / 4;

        //Calculate how many vertices
        const vCountLOD0 = (m + 1) * (m + 1); //vertices of central block
        const vCountLODk = (m + 1) * (m + 1) - (halfM - 1) * (halfM - 1);  //vertices of ring
        const totalVertices = vCountLOD0 + levels * vCountLODk;

        const iCountLOD0 = m * m * 6; //Every square has 2 triangle. 1 triangle has 3 indexes. 2x3=6.
        const iCountLODk = (m * m - halfM * halfM) * 6; //Indices of the first ting
        const totalIndices = iCountLOD0 + levels * iCountLODk;

        //Initialize vertices (x,y,z)
        const positions = new Float32Array(totalVertices * 3);
        const uvs = new Float32Array(totalVertices * 2); //Uv map (x,y)
        const indices = new (totalVertices > 65535 ? Uint32Array : Uint16Array)(totalIndices); //How to connect the vertices

        let vIndex = 0;
        let iIndex = 0;

        // Mapping index (where is which index)
        // Array[level][z][x] -> index
        const vMap = new Array(levels + 1);

        // Calculate vertices
        for (let L = 0; L <= levels; L++) {
            vMap[L] = new Array(m + 1);
            const step = baseVertexSpacing * Math.pow(2, L);
            const startPos = - (m * step) / 2;

            for (let z = 0; z <= m; z++) {
                vMap[L][z] = new Array(m + 1);
                for (let x = 0; x <= m; x++) {
                    
                    // Skip segments (quad) that build THE CENTRAL SECTION (LOD > 0)
                    if (L > 0 && x > quarterM && x < threeQuarterM && z > quarterM && z < threeQuarterM) {
                        continue; //SKIP CYCLE
                    }

                    const posX = startPos + x * step;
                    const posZ = startPos + z * step;

                    positions[vIndex * 3]     = posX;
                    positions[vIndex * 3 + 1] = 0.0; // Geometria piatta, Y=0 (GPGPU alzerà i vertici)
                    positions[vIndex * 3 + 2] = posZ;

                    // UV basate sulle coordinate locali per semplificare i lookup in world-space nei vertex shader
                    uvs[vIndex * 2]     = posX;
                    uvs[vIndex * 2 + 1] = posZ;

                    vMap[L][z][x] = vIndex;
                    vIndex++;
                }
            }
        }

        // Calculate Index (Triangulation)
        for (let L = 0; L <= levels; L++) {
            for (let z = 0; z < m; z++) {
                for (let x = 0; x < m; x++) {
                    
                    // Skip segments (quad) that build THE CENTRAL SECTION (LOD > 0)
                    if (L > 0 && x >= quarterM && x < threeQuarterM && z >= quarterM && z < threeQuarterM) {
                        continue; //SKIP CYCLE
                    }

                    // Get indexes
                    const a = vMap[L][z][x];         //Top-left
                    const b = vMap[L][z + 1][x];     //Lower-Left
                    const c = vMap[L][z][x + 1];     //Top-right
                    const d = vMap[L][z + 1][x + 1]; //Low-right

                    // Triangle 1 (CCW) -> Normal towards Y+
                    indices[iIndex++] = a;
                    indices[iIndex++] = b;
                    indices[iIndex++] = c;

                    // Triangle 2 (CCW) -> Normal towards Y+
                    indices[iIndex++] = c;
                    indices[iIndex++] = b;
                    indices[iIndex++] = d;
                }
            }
        }

        // Assign to THREE.js Buffer
        this.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
        this.setIndex(new THREE.BufferAttribute(indices, 1));
        
        //Normal calculation (overwritter by shader)
        this.computeVertexNormals();
    }
}