import * as THREE from "three";
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';

export class GeometryBuilder {
    /**
     * Cria um paralelepipedo simples (caixa)
     * @param width Largura (eixo X)
     * @param height Altura (eixo Y)
     * @param depth Profundidade (eixo Z)
     * @returns THREE.BufferGeometry do paralelepipedo
     */
    public static createBox(
        width: number,
        height: number,
        depth: number
    ): THREE.BufferGeometry {
        const geometry = new THREE.BoxGeometry(width, height, depth);
        return geometry;
    }

    public static createBoxSideWall(
        baseWidth: number,
        baseHeight: number,
        baseDepth: number,
        wallWidth: number,
        wallHeight: number,
        bevelSize: number
    ): THREE.BufferGeometry {
        const geometry = new THREE.BufferGeometry();

        const base: number[] = [
            0, 0, 0,     baseWidth, 0, 0,     baseWidth, 0, baseDepth,
            0, 0, 0,     baseWidth, 0, baseDepth,     0, 0, baseDepth,
        ];

        const sideL1: number[] = [
            0, 0, 0,     0, baseHeight + wallHeight - bevelSize, 0,             bevelSize, baseHeight + wallHeight, 0,
            0, 0, 0,     bevelSize, baseHeight + wallHeight, 0,                 wallWidth - bevelSize, baseHeight + wallHeight, 0,
            0, 0, 0,     wallWidth - bevelSize, baseHeight + wallHeight, 0,     wallWidth, baseHeight + wallHeight - bevelSize, 0,
            0, 0, 0,     wallWidth, baseHeight + wallHeight - bevelSize, 0,     wallWidth, baseHeight, 0,
            0, 0, 0,     wallWidth, baseHeight, 0,                              baseWidth, baseHeight, 0,
            0, 0, 0,     baseWidth, baseHeight, 0,                              baseWidth, 0, 0,
        ];

        const sideL2: number[] = [
            0, 0, baseDepth,     bevelSize, baseHeight + wallHeight, baseDepth,                 0, baseHeight + wallHeight - bevelSize, baseDepth, 
            0, 0, baseDepth,     wallWidth - bevelSize, baseHeight + wallHeight, baseDepth,     bevelSize, baseHeight + wallHeight, baseDepth,
            0, 0, baseDepth,     wallWidth, baseHeight + wallHeight - bevelSize, baseDepth,     wallWidth - bevelSize, baseHeight + wallHeight, baseDepth,
            0, 0, baseDepth,     wallWidth, baseHeight, baseDepth,                              wallWidth, baseHeight + wallHeight - bevelSize, baseDepth,
            0, 0, baseDepth,     baseWidth, baseHeight, baseDepth,                              wallWidth, baseHeight, baseDepth,
            0, 0, baseDepth,     baseWidth, 0, baseDepth,                                       baseWidth, baseHeight, baseDepth,
        ];

        const sideHigh: number[] = [
            0, 0, 0,     0, baseHeight + wallHeight - bevelSize, baseDepth,     0, baseHeight + wallHeight - bevelSize, 0,             
            0, 0, 0,     0, 0, baseDepth,                                       0, baseHeight + wallHeight - bevelSize, baseDepth,     
        ];

        const sideMid: number[] = [
            wallWidth, baseHeight, 0,     wallWidth, baseHeight + wallHeight - bevelSize, 0,             wallWidth, baseHeight + wallHeight - bevelSize, baseDepth,
            wallWidth, baseHeight, 0,     wallWidth, baseHeight + wallHeight - bevelSize, baseDepth,     wallWidth, baseHeight, baseDepth,
        ];

        const sideLow: number[] = [
            baseWidth, 0, 0,     baseWidth, baseHeight, 0,             baseWidth, baseHeight, baseDepth,
            baseWidth, 0, 0,     baseWidth, baseHeight, baseDepth,     baseWidth, 0, baseDepth,
        ];

        const baseTop: number[] = [
            wallWidth, baseHeight, 0,     wallWidth, baseHeight, baseDepth,     baseWidth, baseHeight, baseDepth,
            wallWidth, baseHeight, 0,     baseWidth, baseHeight, baseDepth,     baseWidth, baseHeight, 0,
        ];

        const wallTop: number[] = [
            bevelSize, baseHeight + wallHeight, 0,     bevelSize, baseHeight + wallHeight, baseDepth,                  wallWidth - bevelSize, baseHeight + wallHeight, baseDepth,
            bevelSize, baseHeight + wallHeight, 0,     wallWidth - bevelSize, baseHeight + wallHeight, baseDepth,      wallWidth - bevelSize, baseHeight + wallHeight, 0,
        ];

        const bevel1: number[] = [
            0, baseHeight + wallHeight - bevelSize, 0,     0, baseHeight + wallHeight - bevelSize, baseDepth,     bevelSize, baseHeight + wallHeight, baseDepth,
            0, baseHeight + wallHeight - bevelSize, 0,     bevelSize, baseHeight + wallHeight, baseDepth,         bevelSize, baseHeight + wallHeight, 0,
        ];

        
        const bevel2: number[] = [
            wallWidth - bevelSize, baseHeight + wallHeight, 0,     wallWidth - bevelSize, baseHeight + wallHeight, baseDepth,     wallWidth, baseHeight + wallHeight - bevelSize, baseDepth,
            wallWidth - bevelSize, baseHeight + wallHeight, 0,     wallWidth, baseHeight + wallHeight - bevelSize, baseDepth,                 wallWidth, baseHeight + wallHeight - bevelSize, 0,
        ];

        const vertices: number[] = [
            ...base, ...baseTop, ...wallTop,
            ...sideL1, ...sideL2, ...sideHigh, ...sideMid, ...sideLow,
            ...bevel1, ...bevel2,
        ];

        const halfBaseWidth = baseWidth / 2;
        const halfBaseDepth = baseDepth / 2;
        for (let i = 0; i < vertices.length; i += 3) {
            vertices[i + 0] -= halfBaseWidth;
            vertices[i + 2] -= halfBaseDepth;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
        geometry.computeVertexNormals();

        return geometry;
    }
    
    /**
     * Cria um paralelepipedo com uma parede em cima
     * A parede fica posicionada no topo da base
     * @param baseWidth Largura da base (eixo X)
     * @param baseHeight Altura da base (eixo Y)
     * @param baseDepth Profundidade da base (eixo Z)
     * @param wallWidth Largura da parede (eixo X)
     * @param wallHeight Altura da parede (eixo Y)
     * @returns THREE.BufferGeometry combinada (base + parede com bevel)
     */
    public static createBoxWithWall(
        baseWidth: number,
        baseHeight: number,
        baseDepth: number,
        wallWidth: number,
        wallHeight: number
    ): THREE.BufferGeometry {
        // Criar geometria da base
        const baseGeometry = new THREE.BoxGeometry(
            baseWidth,
            baseHeight,
            baseDepth
        );

        // Criar geometria da parede com bevel
        const wallPositionY = (baseHeight + wallHeight) / 2;
        const wallGeometry = this.createWallGeometryWithBevel(
            wallWidth,
            wallHeight,
            baseDepth,
            wallPositionY
        );

        // Combinar as geometrias
        const mergedGeometry = BufferGeometryUtils.mergeGeometries(
            [baseGeometry, wallGeometry],
            false
        );

        return mergedGeometry;
    }

    /**
     * Cria uma geometria de parede com bevel de 45 graus nas arestas longitudinais superiores
     * @param width Largura da parede (eixo X)
     * @param height Altura da parede (eixo Y)
     * @param depth Profundidade da parede (eixo Z)
     * @param positionY Posição Y da parede
     * @returns THREE.BufferGeometry da parede com bevel
     */
    private static createWallGeometryWithBevel(
        width: number,
        height: number,
        depth: number,
        positionY: number
    ): THREE.BufferGeometry {
        const geometry = new THREE.BufferGeometry();

        // Profundidade do bevel (quanto o bevel avança para dentro no eixo X)
        const bevelSize = width * 0.1;
        
        // Altura onde começa o bevel
        const bevelStartHeight = height * 0.7;

        const halfWidth = width / 2;
        const halfDepth = depth / 2;
        const bottomY = positionY - height / 2;
        const bevelStartY = positionY - height / 2 + bevelStartHeight;
        const topY = positionY + height / 2;

        // Definir vértices de forma clara
        const vertices = [
            // Camada inferior (y = bottomY) - 4 vértices
            -halfWidth, bottomY, -halfDepth,      // 0: frente-esquerda
            halfWidth, bottomY, -halfDepth,       // 1: frente-direita
            halfWidth, bottomY, halfDepth,        // 2: atrás-direita
            -halfWidth, bottomY, halfDepth,       // 3: atrás-esquerda

            // Camada onde começa o bevel (y = bevelStartY) - 4 vértices
            -halfWidth, bevelStartY, -halfDepth,  // 4: frente-esquerda
            halfWidth, bevelStartY, -halfDepth,   // 5: frente-direita
            halfWidth, bevelStartY, halfDepth,    // 6: atrás-direita
            -halfWidth, bevelStartY, halfDepth,   // 7: atrás-esquerda

            // Camada superior com bevel (y = topY) - 4 vértices (deslocados para dentro no X)
            -halfWidth + bevelSize, topY, -halfDepth,   // 8: frente-esquerda-bevel
            halfWidth - bevelSize, topY, -halfDepth,    // 9: frente-direita-bevel
            halfWidth - bevelSize, topY, halfDepth,     // 10: atrás-direita-bevel
            -halfWidth + bevelSize, topY, halfDepth,    // 11: atrás-esquerda-bevel
        ];

        // Definir faces (triângulos)
        const indices = [
            // Face inferior
            0, 1, 2,
            0, 2, 3,

            // Face frontal
            0, 4, 5,
            0, 5, 1,
            4, 8, 9,
            4, 9, 5,

            // Face traseira
            3, 6, 7,
            3, 2, 6,
            7, 6, 10,
            7, 10, 11,

            // Face lateral esquerda (com bevel)
            0, 7, 4,
            0, 3, 7,
            4, 11, 8,
            4, 7, 11,

            // Face lateral direita (com bevel)
            1, 6, 2,
            1, 5, 6,
            5, 10, 6,
            5, 9, 10,

            // Face superior do bevel (frente)
            4, 9, 8,
            5, 9, 4,

            // Face superior do bevel (atrás)
            10, 11, 7,
            10, 7, 6,
        ];

        geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
        geometry.setIndex(new THREE.BufferAttribute(new Uint16Array(indices), 1));
        
        // Adicionar atributo UV para compatibilidade com mergeGeometries
        const uvs = new Float32Array(vertices.length / 3 * 2);
        geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
        
        geometry.computeVertexNormals();

        return geometry;
    }
}
