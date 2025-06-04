#!/usr/bin/env node

/**
 * 🎭 Browser Tests Runner
 * Ejecuta tests automatizados en diferentes navegadores
 */

import { spawn } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuración
const CONFIG = {
    port: 8080,
    timeout: 30000,
    retries: 2,
    browsers: {
        chrome: {
            name: 'Chrome',
            executable: 'google-chrome',
            args: ['--headless', '--no-sandbox', '--disable-dev-shm-usage']
        },
        firefox: {
            name: 'Firefox',
            executable: 'firefox',
            args: ['--headless']
        },
        edge: {
            name: 'Edge',
            executable: 'microsoft-edge',
            args: ['--headless', '--no-sandbox']
        }
    }
};

class BrowserTestRunner {
    constructor() {
        this.results = {
            total: 0,
            passed: 0,
            failed: 0,
            browsers: {},
            startTime: Date.now()
        };
    }

    /**
     * Ejecuta tests en el navegador especificado
     */
    async runBrowserTests(browserName) {
        console.log(`🎭 Iniciando tests en ${CONFIG.browsers[browserName]?.name || browserName}...`);
        
        try {
            // Iniciar servidor de pruebas
            const server = await this.startTestServer();
            
            // Ejecutar tests según el navegador
            let testResults;
            switch (browserName) {
                case 'chrome':
                    testResults = await this.runChromeTests();
                    break;
                case 'firefox':
                    testResults = await this.runFirefoxTests();
                    break;
                case 'edge':
                    testResults = await this.runEdgeTests();
                    break;
                default:
                    throw new Error(`Navegador no soportado: ${browserName}`);
            }
            
            // Detener servidor
            server.kill();
            
            // Procesar resultados
            this.processResults(browserName, testResults);
            
            return testResults;
        } catch (error) {
            console.error(`❌ Error ejecutando tests en ${browserName}:`, error.message);
            this.results.browsers[browserName] = {
                status: 'error',
                error: error.message,
                tests: { passed: 0, failed: 1, total: 1 }
            };
            return { success: false, error: error.message };
        }
    }

    /**
     * Inicia servidor de pruebas
     */
    async startTestServer() {
        return new Promise((resolve, reject) => {
            const server = spawn('npx', ['http-server', '.', '-p', CONFIG.port, '-c-1', '--silent'], {
                stdio: 'pipe'
            });

            // Esperar a que el servidor esté listo
            setTimeout(() => {
                // Verificar que el servidor responde
                fetch(`http://localhost:${CONFIG.port}`)
                    .then(() => {
                        console.log(`🌐 Servidor de pruebas iniciado en puerto ${CONFIG.port}`);
                        resolve(server);
                    })
                    .catch(reject);
            }, 2000);

            server.on('error', reject);
        });
    }

    /**
     * Ejecuta tests en Chrome usando Puppeteer
     */
    async runChromeTests() {
        const puppeteer = await import('puppeteer');
        
        const browser = await puppeteer.default.launch({
            headless: 'new',
            args: CONFIG.browsers.chrome.args
        });

        try {
            const page = await browser.newPage();
            
            // Configurar página
            await page.setViewport({ width: 1280, height: 720 });
            
            // Navegar a la página de tests
            await page.goto(`http://localhost:${CONFIG.port}/test-demo.html`, {
                waitUntil: 'networkidle0',
                timeout: CONFIG.timeout
            });

            // Ejecutar tests
            const results = await page.evaluate(async () => {
                // Verificar que el sistema de testing esté disponible
                if (!window.Testing) {
                    throw new Error('Sistema de testing no disponible');
                }

                // Ejecutar todos los tests
                const testResults = await window.Testing.runAll();
                
                return {
                    success: true,
                    results: testResults,
                    timestamp: Date.now()
                };
            });

            console.log(`✅ Tests en Chrome completados: ${results.results.passed}/${results.results.total} pasaron`);
            return results;

        } finally {
            await browser.close();
        }
    }

    /**
     * Ejecuta tests en Firefox usando Playwright
     */
    async runFirefoxTests() {
        const { firefox } = await import('playwright');
        
        const browser = await firefox.launch({
            headless: true
        });

        try {
            const page = await browser.newPage();
            
            // Navegar a la página de tests
            await page.goto(`http://localhost:${CONFIG.port}/test-demo.html`, {
                waitUntil: 'networkidle',
                timeout: CONFIG.timeout
            });

            // Ejecutar tests
            const results = await page.evaluate(async () => {
                if (!window.Testing) {
                    throw new Error('Sistema de testing no disponible');
                }

                const testResults = await window.Testing.runAll();
                
                return {
                    success: true,
                    results: testResults,
                    timestamp: Date.now()
                };
            });

            console.log(`✅ Tests en Firefox completados: ${results.results.passed}/${results.results.total} pasaron`);
            return results;

        } finally {
            await browser.close();
        }
    }

    /**
     * Ejecuta tests en Edge usando Playwright
     */
    async runEdgeTests() {
        const { chromium } = await import('playwright');
        
        const browser = await chromium.launch({
            headless: true,
            channel: 'msedge'
        });

        try {
            const page = await browser.newPage();
            
            await page.goto(`http://localhost:${CONFIG.port}/test-demo.html`, {
                waitUntil: 'networkidle',
                timeout: CONFIG.timeout
            });

            const results = await page.evaluate(async () => {
                if (!window.Testing) {
                    throw new Error('Sistema de testing no disponible');
                }

                const testResults = await window.Testing.runAll();
                
                return {
                    success: true,
                    results: testResults,
                    timestamp: Date.now()
                };
            });

            console.log(`✅ Tests en Edge completados: ${results.results.passed}/${results.results.total} pasaron`);
            return results;

        } finally {
            await browser.close();
        }
    }

    /**
     * Procesa y almacena resultados
     */
    processResults(browserName, testResults) {
        if (testResults.success) {
            this.results.browsers[browserName] = {
                status: 'success',
                tests: testResults.results,
                timestamp: testResults.timestamp
            };
            this.results.passed += testResults.results.passed;
            this.results.failed += testResults.results.failed;
        } else {
            this.results.browsers[browserName] = {
                status: 'error',
                error: testResults.error,
                tests: { passed: 0, failed: 1, total: 1 }
            };
            this.results.failed += 1;
        }
        this.results.total += 1;
    }

    /**
     * Genera reporte de resultados
     */
    generateReport() {
        const duration = Date.now() - this.results.startTime;
        
        console.log('\n📊 REPORTE DE TESTS EN NAVEGADORES');
        console.log('═'.repeat(50));
        console.log(`⏱️  Duración: ${duration}ms`);
        console.log(`🎯 Total navegadores: ${this.results.total}`);
        console.log(`✅ Exitosos: ${this.results.passed}`);
        console.log(`❌ Fallidos: ${this.results.failed}`);
        
        console.log('\n🔍 Detalles por navegador:');
        Object.entries(this.results.browsers).forEach(([browser, result]) => {
            const status = result.status === 'success' ? '✅' : '❌';
            console.log(`  ${status} ${browser.toUpperCase()}: ${result.tests.passed}/${result.tests.total} tests pasaron`);
            if (result.error) {
                console.log(`     Error: ${result.error}`);
            }
        });

        // Guardar reporte en archivo
        const reportPath = join(process.cwd(), 'test-results', 'browser-tests.json');
        try {
            writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
            console.log(`\n💾 Reporte guardado en: ${reportPath}`);
        } catch (error) {
            console.warn(`⚠️  No se pudo guardar el reporte: ${error.message}`);
        }

        return this.results.failed === 0;
    }
}

// Función principal
async function main() {
    const args = process.argv.slice(2);
    const browserArg = args.find(arg => arg.startsWith('--browser='));
    const browser = browserArg ? browserArg.split('=')[1] : 'chrome';

    if (!CONFIG.browsers[browser]) {
        console.error(`❌ Navegador no soportado: ${browser}`);
        console.log(`Navegadores disponibles: ${Object.keys(CONFIG.browsers).join(', ')}`);
        process.exit(1);
    }

    const runner = new BrowserTestRunner();
    
    try {
        await runner.runBrowserTests(browser);
        const success = runner.generateReport();
        
        process.exit(success ? 0 : 1);
    } catch (error) {
        console.error('❌ Error ejecutando tests:', error.message);
        process.exit(1);
    }
}

// Ejecutar si es el archivo principal
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}

export default BrowserTestRunner; 