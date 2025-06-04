#!/usr/bin/env node

/**
 * 🏗️ Build Script
 * Construye y optimiza la aplicación para producción
 */

import { readFileSync, writeFileSync, mkdirSync, copyFileSync, readdirSync, statSync } from 'fs';
import { join, dirname, extname, basename } from 'path';
import { fileURLToPath } from 'url';
import { createHash } from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuración
const CONFIG = {
    srcDir: process.cwd(),
    buildDir: join(process.cwd(), 'dist'),
    version: '2.1.0',
    environment: process.env.NODE_ENV || 'development',
    minify: process.env.NODE_ENV === 'production',
    generateSourceMaps: process.env.NODE_ENV !== 'production'
};

class BuildManager {
    constructor() {
        this.stats = {
            startTime: Date.now(),
            files: {
                processed: 0,
                copied: 0,
                minified: 0,
                errors: 0
            },
            sizes: {
                original: 0,
                compressed: 0
            }
        };
        this.manifest = {
            version: CONFIG.version,
            buildTime: new Date().toISOString(),
            environment: CONFIG.environment,
            files: {}
        };
    }

    /**
     * Ejecuta el proceso de build completo
     */
    async build() {
        console.log('🏗️ Iniciando proceso de build...');
        console.log(`📦 Versión: ${CONFIG.version}`);
        console.log(`🌍 Entorno: ${CONFIG.environment}`);
        
        try {
            // Limpiar directorio de build
            await this.cleanBuildDir();
            
            // Procesar archivos
            await this.processFiles();
            
            // Generar manifest
            await this.generateManifest();
            
            // Generar reporte
            this.generateReport();
            
            console.log('✅ Build completado exitosamente');
            return true;
        } catch (error) {
            console.error('❌ Error en el proceso de build:', error.message);
            return false;
        }
    }

    /**
     * Limpia el directorio de build
     */
    async cleanBuildDir() {
        console.log('🧹 Limpiando directorio de build...');
        
        try {
            // Crear directorio si no existe
            mkdirSync(CONFIG.buildDir, { recursive: true });
            console.log(`📁 Directorio de build: ${CONFIG.buildDir}`);
        } catch (error) {
            throw new Error(`No se pudo crear directorio de build: ${error.message}`);
        }
    }

    /**
     * Procesa todos los archivos necesarios
     */
    async processFiles() {
        console.log('📄 Procesando archivos...');
        
        const filesToProcess = [
            // Archivos HTML
            { src: 'index.html', dest: 'index.html', type: 'html' },
            { src: 'test-demo.html', dest: 'test-demo.html', type: 'html' },
            
            // Archivo principal JS
            { src: 'app.js', dest: 'app.js', type: 'js' },
            
            // CSS
            { src: 'styles.css', dest: 'styles.css', type: 'css' },
            
            // Módulos
            { src: 'modules/', dest: 'modules/', type: 'directory' },
            
            // Scripts
            { src: 'scripts/', dest: 'scripts/', type: 'directory' },
            
            // Archivos de configuración
            { src: 'package.json', dest: 'package.json', type: 'json' },
            { src: 'README.md', dest: 'README.md', type: 'copy' }
        ];

        for (const file of filesToProcess) {
            try {
                await this.processFile(file);
            } catch (error) {
                console.warn(`⚠️ Error procesando ${file.src}: ${error.message}`);
                this.stats.files.errors++;
            }
        }
    }

    /**
     * Procesa un archivo individual
     */
    async processFile(fileConfig) {
        const srcPath = join(CONFIG.srcDir, fileConfig.src);
        const destPath = join(CONFIG.buildDir, fileConfig.dest);
        
        // Verificar si el archivo/directorio existe
        try {
            const stat = statSync(srcPath);
            
            if (stat.isDirectory() && fileConfig.type === 'directory') {
                await this.processDirectory(srcPath, destPath);
                return;
            }
            
            if (!stat.isFile()) {
                console.warn(`⚠️ Saltando ${fileConfig.src} (no es un archivo)`);
                return;
            }
        } catch (error) {
            console.warn(`⚠️ Archivo no encontrado: ${fileConfig.src}`);
            return;
        }

        // Crear directorio de destino si no existe
        mkdirSync(dirname(destPath), { recursive: true });

        // Procesar según el tipo
        switch (fileConfig.type) {
            case 'html':
                await this.processHTML(srcPath, destPath);
                break;
            case 'js':
                await this.processJS(srcPath, destPath);
                break;
            case 'css':
                await this.processCSS(srcPath, destPath);
                break;
            case 'json':
                await this.processJSON(srcPath, destPath);
                break;
            default:
                await this.copyFile(srcPath, destPath);
        }

        this.stats.files.processed++;
    }

    /**
     * Procesa un directorio recursivamente
     */
    async processDirectory(srcDir, destDir) {
        mkdirSync(destDir, { recursive: true });
        
        const files = readdirSync(srcDir);
        
        for (const file of files) {
            const srcPath = join(srcDir, file);
            const destPath = join(destDir, file);
            const stat = statSync(srcPath);
            
            if (stat.isDirectory()) {
                await this.processDirectory(srcPath, destPath);
            } else {
                const ext = extname(file).toLowerCase();
                
                switch (ext) {
                    case '.js':
                        await this.processJS(srcPath, destPath);
                        break;
                    case '.css':
                        await this.processCSS(srcPath, destPath);
                        break;
                    case '.html':
                        await this.processHTML(srcPath, destPath);
                        break;
                    case '.json':
                        await this.processJSON(srcPath, destPath);
                        break;
                    default:
                        await this.copyFile(srcPath, destPath);
                }
            }
        }
    }

    /**
     * Procesa archivos HTML
     */
    async processHTML(srcPath, destPath) {
        let content = readFileSync(srcPath, 'utf8');
        const originalSize = content.length;
        
        // Inyectar información de build
        content = content.replace(
            '</head>',
            `  <meta name="build-version" content="${CONFIG.version}">\n  <meta name="build-time" content="${new Date().toISOString()}">\n</head>`
        );

        // Minificar en producción
        if (CONFIG.minify) {
            content = this.minifyHTML(content);
            this.stats.files.minified++;
        }

        writeFileSync(destPath, content);
        
        const compressedSize = content.length;
        this.updateStats(originalSize, compressedSize);
        this.addToManifest(destPath, originalSize, compressedSize);
        
        console.log(`📄 HTML: ${basename(srcPath)} (${originalSize} → ${compressedSize} bytes)`);
    }

    /**
     * Procesa archivos JavaScript
     */
    async processJS(srcPath, destPath) {
        let content = readFileSync(srcPath, 'utf8');
        const originalSize = content.length;
        
        // Inyectar información de build
        content = `/* Build: ${CONFIG.version} | ${new Date().toISOString()} */\n${content}`;

        // Minificar en producción
        if (CONFIG.minify) {
            content = this.minifyJS(content);
            this.stats.files.minified++;
        }

        writeFileSync(destPath, content);
        
        const compressedSize = content.length;
        this.updateStats(originalSize, compressedSize);
        this.addToManifest(destPath, originalSize, compressedSize);
        
        console.log(`📜 JS: ${basename(srcPath)} (${originalSize} → ${compressedSize} bytes)`);
    }

    /**
     * Procesa archivos CSS
     */
    async processCSS(srcPath, destPath) {
        let content = readFileSync(srcPath, 'utf8');
        const originalSize = content.length;
        
        // Inyectar información de build
        content = `/* Build: ${CONFIG.version} | ${new Date().toISOString()} */\n${content}`;

        // Minificar en producción
        if (CONFIG.minify) {
            content = this.minifyCSS(content);
            this.stats.files.minified++;
        }

        writeFileSync(destPath, content);
        
        const compressedSize = content.length;
        this.updateStats(originalSize, compressedSize);
        this.addToManifest(destPath, originalSize, compressedSize);
        
        console.log(`🎨 CSS: ${basename(srcPath)} (${originalSize} → ${compressedSize} bytes)`);
    }

    /**
     * Procesa archivos JSON
     */
    async processJSON(srcPath, destPath) {
        const content = readFileSync(srcPath, 'utf8');
        const data = JSON.parse(content);
        
        // Actualizar información de build si es package.json
        if (basename(srcPath) === 'package.json') {
            data.buildTime = new Date().toISOString();
            data.buildVersion = CONFIG.version;
        }
        
        const processedContent = JSON.stringify(data, null, CONFIG.minify ? 0 : 2);
        writeFileSync(destPath, processedContent);
        
        this.updateStats(content.length, processedContent.length);
        this.addToManifest(destPath, content.length, processedContent.length);
        
        console.log(`📋 JSON: ${basename(srcPath)}`);
    }

    /**
     * Copia un archivo sin procesamiento
     */
    async copyFile(srcPath, destPath) {
        copyFileSync(srcPath, destPath);
        
        const stat = statSync(srcPath);
        this.updateStats(stat.size, stat.size);
        this.addToManifest(destPath, stat.size, stat.size);
        this.stats.files.copied++;
        
        console.log(`📁 Copiado: ${basename(srcPath)}`);
    }

    /**
     * Minifica HTML (implementación básica)
     */
    minifyHTML(content) {
        return content
            .replace(/\s+/g, ' ')
            .replace(/>\s+</g, '><')
            .replace(/\s+>/g, '>')
            .replace(/<\s+/g, '<')
            .trim();
    }

    /**
     * Minifica JavaScript (implementación básica)
     */
    minifyJS(content) {
        // Remover comentarios de línea
        content = content.replace(/\/\/.*$/gm, '');
        
        // Remover comentarios de bloque (básico)
        content = content.replace(/\/\*[\s\S]*?\*\//g, '');
        
        // Remover espacios extra
        content = content.replace(/\s+/g, ' ');
        
        // Remover espacios alrededor de operadores
        content = content.replace(/\s*([{}();,=+\-*/<>!&|])\s*/g, '$1');
        
        return content.trim();
    }

    /**
     * Minifica CSS (implementación básica)
     */
    minifyCSS(content) {
        return content
            .replace(/\/\*[\s\S]*?\*\//g, '') // Remover comentarios
            .replace(/\s+/g, ' ') // Espacios múltiples a uno
            .replace(/\s*([{}:;,>+~])\s*/g, '$1') // Espacios alrededor de caracteres especiales
            .replace(/;\s*}/g, '}') // Punto y coma antes de cierre
            .trim();
    }

    /**
     * Actualiza estadísticas de tamaño
     */
    updateStats(originalSize, compressedSize) {
        this.stats.sizes.original += originalSize;
        this.stats.sizes.compressed += compressedSize;
    }

    /**
     * Añade archivo al manifest
     */
    addToManifest(filePath, originalSize, compressedSize) {
        const relativePath = filePath.replace(CONFIG.buildDir + '/', '');
        const content = readFileSync(filePath);
        const hash = createHash('sha256').update(content).digest('hex').substring(0, 8);
        
        this.manifest.files[relativePath] = {
            size: compressedSize,
            originalSize,
            hash,
            compression: originalSize > 0 ? ((originalSize - compressedSize) / originalSize * 100).toFixed(1) : 0
        };
    }

    /**
     * Genera el archivo manifest
     */
    async generateManifest() {
        const manifestPath = join(CONFIG.buildDir, 'build-manifest.json');
        writeFileSync(manifestPath, JSON.stringify(this.manifest, null, 2));
        console.log('📋 Manifest generado');
    }

    /**
     * Genera reporte final
     */
    generateReport() {
        const duration = Date.now() - this.stats.startTime;
        const compressionRatio = this.stats.sizes.original > 0 
            ? ((this.stats.sizes.original - this.stats.sizes.compressed) / this.stats.sizes.original * 100).toFixed(1)
            : 0;

        console.log('\n📊 REPORTE DE BUILD');
        console.log('═'.repeat(40));
        console.log(`⏱️  Duración: ${duration}ms`);
        console.log(`📄 Archivos procesados: ${this.stats.files.processed}`);
        console.log(`📁 Archivos copiados: ${this.stats.files.copied}`);
        console.log(`🗜️  Archivos minificados: ${this.stats.files.minified}`);
        console.log(`❌ Errores: ${this.stats.files.errors}`);
        console.log(`📦 Tamaño original: ${this.formatBytes(this.stats.sizes.original)}`);
        console.log(`🗜️  Tamaño comprimido: ${this.formatBytes(this.stats.sizes.compressed)}`);
        console.log(`📉 Compresión: ${compressionRatio}%`);
        console.log(`📁 Directorio de salida: ${CONFIG.buildDir}`);
    }

    /**
     * Formatea bytes en formato legible
     */
    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// Función principal
async function main() {
    const builder = new BuildManager();
    const success = await builder.build();
    process.exit(success ? 0 : 1);
}

// Ejecutar si es el archivo principal
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}

export default BuildManager; 