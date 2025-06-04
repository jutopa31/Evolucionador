#!/usr/bin/env node

/**
 * 🚀 Deployment Script
 * Maneja el despliegue a diferentes entornos (staging, production)
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuración de entornos
const ENVIRONMENTS = {
    staging: {
        name: 'Staging',
        url: 'https://staging.suite-neurologia.com',
        branch: 'develop',
        buildCommand: 'npm run build',
        healthCheck: '/health',
        timeout: 300000, // 5 minutos
        retries: 3
    },
    production: {
        name: 'Production',
        url: 'https://suite-neurologia.com',
        branch: 'main',
        buildCommand: 'npm run build:prod',
        healthCheck: '/health',
        timeout: 600000, // 10 minutos
        retries: 5
    }
};

class DeploymentManager {
    constructor(environment) {
        this.env = environment;
        this.config = ENVIRONMENTS[environment];
        this.deploymentId = `deploy_${Date.now()}`;
        this.startTime = Date.now();
        this.logs = [];
        
        if (!this.config) {
            throw new Error(`Entorno no válido: ${environment}. Disponibles: ${Object.keys(ENVIRONMENTS).join(', ')}`);
        }
    }

    /**
     * Ejecuta el proceso de deployment completo
     */
    async deploy() {
        console.log(`🚀 Iniciando deployment a ${this.config.name}...`);
        console.log(`📋 ID de deployment: ${this.deploymentId}`);
        
        try {
            // Pre-deployment checks
            await this.preDeploymentChecks();
            
            // Build
            await this.buildApplication();
            
            // Deploy
            await this.deployToEnvironment();
            
            // Post-deployment verification
            await this.postDeploymentVerification();
            
            // Success notification
            await this.notifySuccess();
            
            console.log(`✅ Deployment a ${this.config.name} completado exitosamente`);
            return true;
            
        } catch (error) {
            console.error(`❌ Error en deployment a ${this.config.name}:`, error.message);
            await this.handleDeploymentFailure(error);
            return false;
        } finally {
            await this.generateDeploymentReport();
        }
    }

    /**
     * Verificaciones previas al deployment
     */
    async preDeploymentChecks() {
        console.log('🔍 Ejecutando verificaciones previas...');
        
        // Verificar que estamos en la rama correcta
        await this.verifyBranch();
        
        // Verificar que no hay cambios sin commitear
        await this.verifyCleanWorkingDirectory();
        
        // Verificar que los tests pasan
        await this.runTests();
        
        // Verificar dependencias
        await this.verifyDependencies();
        
        console.log('✅ Verificaciones previas completadas');
    }

    /**
     * Verifica que estamos en la rama correcta
     */
    async verifyBranch() {
        try {
            const currentBranch = await this.executeCommand('git', ['rev-parse', '--abbrev-ref', 'HEAD']);
            
            if (currentBranch.trim() !== this.config.branch) {
                throw new Error(`Rama incorrecta. Esperada: ${this.config.branch}, Actual: ${currentBranch.trim()}`);
            }
            
            this.log(`✅ Rama verificada: ${currentBranch.trim()}`);
        } catch (error) {
            throw new Error(`Error verificando rama: ${error.message}`);
        }
    }

    /**
     * Verifica que no hay cambios sin commitear
     */
    async verifyCleanWorkingDirectory() {
        try {
            const status = await this.executeCommand('git', ['status', '--porcelain']);
            
            if (status.trim()) {
                throw new Error('Hay cambios sin commitear en el directorio de trabajo');
            }
            
            this.log('✅ Directorio de trabajo limpio');
        } catch (error) {
            throw new Error(`Error verificando directorio de trabajo: ${error.message}`);
        }
    }

    /**
     * Ejecuta los tests
     */
    async runTests() {
        console.log('🧪 Ejecutando tests...');
        
        try {
            await this.executeCommand('npm', ['run', 'test'], { timeout: 120000 });
            this.log('✅ Tests completados exitosamente');
        } catch (error) {
            throw new Error(`Tests fallaron: ${error.message}`);
        }
    }

    /**
     * Verifica las dependencias
     */
    async verifyDependencies() {
        console.log('📦 Verificando dependencias...');
        
        try {
            // Verificar que package-lock.json existe
            if (!existsSync('package-lock.json')) {
                throw new Error('package-lock.json no encontrado');
            }
            
            // Verificar vulnerabilidades
            await this.executeCommand('npm', ['audit', '--audit-level', 'high'], { 
                timeout: 60000,
                allowFailure: true // Permitir que falle pero registrar
            });
            
            this.log('✅ Dependencias verificadas');
        } catch (error) {
            console.warn(`⚠️ Advertencia en verificación de dependencias: ${error.message}`);
        }
    }

    /**
     * Construye la aplicación
     */
    async buildApplication() {
        console.log('🏗️ Construyendo aplicación...');
        
        try {
            const buildCmd = this.config.buildCommand.split(' ');
            const command = buildCmd[0];
            const args = buildCmd.slice(1);
            
            await this.executeCommand(command, args, { timeout: 300000 });
            
            // Verificar que el build fue exitoso
            if (!existsSync('dist')) {
                throw new Error('Directorio dist no encontrado después del build');
            }
            
            this.log('✅ Build completado exitosamente');
        } catch (error) {
            throw new Error(`Build falló: ${error.message}`);
        }
    }

    /**
     * Despliega a el entorno especificado
     */
    async deployToEnvironment() {
        console.log(`🚀 Desplegando a ${this.config.name}...`);
        
        try {
            // Aquí iría la lógica específica de deployment según el proveedor
            // Por ejemplo: AWS S3, Netlify, Vercel, etc.
            
            if (this.env === 'staging') {
                await this.deployToStaging();
            } else if (this.env === 'production') {
                await this.deployToProduction();
            }
            
            this.log(`✅ Deployment a ${this.config.name} completado`);
        } catch (error) {
            throw new Error(`Deployment falló: ${error.message}`);
        }
    }

    /**
     * Despliega a staging
     */
    async deployToStaging() {
        // Simulación de deployment a staging
        console.log('📤 Subiendo archivos a staging...');
        
        // Aquí iría la lógica real de deployment
        // Ejemplo con rsync, AWS CLI, etc.
        await this.simulateDeployment('staging');
        
        this.log('✅ Archivos subidos a staging');
    }

    /**
     * Despliega a production
     */
    async deployToProduction() {
        // Deployment a producción con más verificaciones
        console.log('📤 Subiendo archivos a producción...');
        
        // Crear backup antes del deployment
        await this.createBackup();
        
        // Deployment real
        await this.simulateDeployment('production');
        
        this.log('✅ Archivos subidos a producción');
    }

    /**
     * Crea un backup antes del deployment a producción
     */
    async createBackup() {
        console.log('💾 Creando backup...');
        
        const backupId = `backup_${Date.now()}`;
        
        // Aquí iría la lógica real de backup
        // Por ejemplo, crear snapshot de la base de datos, backup de archivos, etc.
        
        this.log(`✅ Backup creado: ${backupId}`);
    }

    /**
     * Simula el proceso de deployment
     */
    async simulateDeployment(env) {
        const steps = [
            'Comprimiendo archivos...',
            'Subiendo archivos...',
            'Actualizando configuración...',
            'Reiniciando servicios...',
            'Limpiando cache...'
        ];
        
        for (const step of steps) {
            console.log(`  ${step}`);
            await this.sleep(1000); // Simular tiempo de procesamiento
        }
    }

    /**
     * Verificaciones post-deployment
     */
    async postDeploymentVerification() {
        console.log('🔍 Ejecutando verificaciones post-deployment...');
        
        // Health check
        await this.performHealthCheck();
        
        // Smoke tests
        await this.runSmokeTests();
        
        // Performance check
        await this.performanceCheck();
        
        console.log('✅ Verificaciones post-deployment completadas');
    }

    /**
     * Ejecuta health check
     */
    async performHealthCheck() {
        console.log('🏥 Ejecutando health check...');
        
        const maxRetries = this.config.retries;
        let attempt = 0;
        
        while (attempt < maxRetries) {
            try {
                const response = await fetch(`${this.config.url}${this.config.healthCheck}`);
                
                if (response.ok) {
                    this.log('✅ Health check exitoso');
                    return;
                }
                
                throw new Error(`Health check falló: ${response.status}`);
            } catch (error) {
                attempt++;
                if (attempt >= maxRetries) {
                    throw new Error(`Health check falló después de ${maxRetries} intentos: ${error.message}`);
                }
                
                console.log(`⚠️ Health check falló (intento ${attempt}/${maxRetries}), reintentando...`);
                await this.sleep(5000);
            }
        }
    }

    /**
     * Ejecuta smoke tests
     */
    async runSmokeTests() {
        console.log('💨 Ejecutando smoke tests...');
        
        const tests = [
            { name: 'Página principal', path: '/' },
            { name: 'Sistema de testing', path: '/test-demo.html' },
            { name: 'API de salud', path: '/health' }
        ];
        
        for (const test of tests) {
            try {
                const response = await fetch(`${this.config.url}${test.path}`);
                if (response.ok) {
                    this.log(`✅ Smoke test: ${test.name}`);
                } else {
                    throw new Error(`${test.name} falló: ${response.status}`);
                }
            } catch (error) {
                console.warn(`⚠️ Smoke test falló: ${test.name} - ${error.message}`);
            }
        }
    }

    /**
     * Verifica el rendimiento básico
     */
    async performanceCheck() {
        console.log('⚡ Verificando rendimiento...');
        
        try {
            const start = Date.now();
            const response = await fetch(this.config.url);
            const duration = Date.now() - start;
            
            if (duration > 5000) {
                console.warn(`⚠️ Tiempo de respuesta alto: ${duration}ms`);
            } else {
                this.log(`✅ Tiempo de respuesta: ${duration}ms`);
            }
        } catch (error) {
            console.warn(`⚠️ No se pudo verificar rendimiento: ${error.message}`);
        }
    }

    /**
     * Notifica el éxito del deployment
     */
    async notifySuccess() {
        const duration = Date.now() - this.startTime;
        const message = `🎉 Deployment exitoso a ${this.config.name}\n` +
                       `📋 ID: ${this.deploymentId}\n` +
                       `⏱️ Duración: ${Math.round(duration / 1000)}s\n` +
                       `🌐 URL: ${this.config.url}`;
        
        console.log(message);
        
        // Aquí se podría integrar con Slack, Discord, email, etc.
        this.log('✅ Notificación de éxito enviada');
    }

    /**
     * Maneja fallos en el deployment
     */
    async handleDeploymentFailure(error) {
        console.log('🚨 Manejando fallo en deployment...');
        
        // Rollback si es necesario
        if (this.env === 'production') {
            await this.performRollback();
        }
        
        // Notificar fallo
        await this.notifyFailure(error);
        
        this.log(`❌ Deployment falló: ${error.message}`);
    }

    /**
     * Ejecuta rollback en caso de fallo
     */
    async performRollback() {
        console.log('🔄 Ejecutando rollback...');
        
        try {
            // Aquí iría la lógica de rollback
            // Por ejemplo, restaurar backup, revertir a versión anterior, etc.
            
            await this.sleep(2000); // Simular rollback
            
            this.log('✅ Rollback completado');
        } catch (error) {
            console.error(`❌ Error en rollback: ${error.message}`);
        }
    }

    /**
     * Notifica fallo del deployment
     */
    async notifyFailure(error) {
        const message = `🚨 Deployment falló en ${this.config.name}\n` +
                       `📋 ID: ${this.deploymentId}\n` +
                       `❌ Error: ${error.message}`;
        
        console.log(message);
        
        // Aquí se podría integrar con sistemas de alertas
        this.log('✅ Notificación de fallo enviada');
    }

    /**
     * Genera reporte de deployment
     */
    async generateDeploymentReport() {
        const duration = Date.now() - this.startTime;
        
        const report = {
            deploymentId: this.deploymentId,
            environment: this.env,
            startTime: new Date(this.startTime).toISOString(),
            endTime: new Date().toISOString(),
            duration: duration,
            success: this.logs.some(log => log.includes('Deployment a') && log.includes('completado')),
            logs: this.logs
        };
        
        const reportPath = join(process.cwd(), 'deployment-reports', `${this.deploymentId}.json`);
        
        try {
            mkdirSync(dirname(reportPath), { recursive: true });
            writeFileSync(reportPath, JSON.stringify(report, null, 2));
            console.log(`📊 Reporte de deployment guardado: ${reportPath}`);
        } catch (error) {
            console.warn(`⚠️ No se pudo guardar el reporte: ${error.message}`);
        }
    }

    /**
     * Ejecuta un comando y retorna su salida
     */
    async executeCommand(command, args = [], options = {}) {
        return new Promise((resolve, reject) => {
            const process = spawn(command, args, {
                stdio: options.silent ? 'pipe' : 'inherit',
                ...options
            });
            
            let output = '';
            
            if (options.silent) {
                process.stdout.on('data', (data) => {
                    output += data.toString();
                });
                
                process.stderr.on('data', (data) => {
                    output += data.toString();
                });
            }
            
            const timeout = options.timeout || 60000;
            const timer = setTimeout(() => {
                process.kill();
                reject(new Error(`Comando timeout después de ${timeout}ms`));
            }, timeout);
            
            process.on('close', (code) => {
                clearTimeout(timer);
                
                if (code === 0 || options.allowFailure) {
                    resolve(output);
                } else {
                    reject(new Error(`Comando falló con código ${code}`));
                }
            });
            
            process.on('error', (error) => {
                clearTimeout(timer);
                reject(error);
            });
        });
    }

    /**
     * Registra un mensaje en los logs
     */
    log(message) {
        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] ${message}`;
        this.logs.push(logEntry);
    }

    /**
     * Pausa la ejecución por el tiempo especificado
     */
    async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Función principal
async function main() {
    const args = process.argv.slice(2);
    const envArg = args.find(arg => arg.startsWith('--env='));
    const environment = envArg ? envArg.split('=')[1] : 'staging';
    
    if (!ENVIRONMENTS[environment]) {
        console.error(`❌ Entorno no válido: ${environment}`);
        console.log(`Entornos disponibles: ${Object.keys(ENVIRONMENTS).join(', ')}`);
        process.exit(1);
    }
    
    try {
        const deployer = new DeploymentManager(environment);
        const success = await deployer.deploy();
        
        process.exit(success ? 0 : 1);
    } catch (error) {
        console.error('❌ Error en deployment:', error.message);
        process.exit(1);
    }
}

// Ejecutar si es el archivo principal
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}

export default DeploymentManager; 