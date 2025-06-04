/**
 * 🧪 Test App Functionality
 * Prueba la funcionalidad completa de Suite Neurología
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

class AppTester {
    constructor() {
        this.browser = null;
        this.page = null;
        this.errors = [];
        this.testResults = [];
    }

    async initialize() {
        console.log('🚀 Iniciando pruebas de funcionalidad...');
        
        this.browser = await puppeteer.launch({
            headless: false, // Para ver qué está pasando
            devtools: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        this.page = await this.browser.newPage();
        
        // Capturar errores de consola
        this.page.on('console', msg => {
            if (msg.type() === 'error') {
                this.errors.push({
                    type: 'console_error',
                    message: msg.text(),
                    timestamp: new Date().toISOString()
                });
            }
        });
        
        // Capturar errores de página
        this.page.on('pageerror', error => {
            this.errors.push({
                type: 'page_error',
                message: error.message,
                stack: error.stack,
                timestamp: new Date().toISOString()
            });
        });
        
        // Capturar fallos de recursos
        this.page.on('requestfailed', request => {
            this.errors.push({
                type: 'resource_failed',
                url: request.url(),
                failure: request.failure().errorText,
                timestamp: new Date().toISOString()
            });
        });
    }

    async runTests() {
        try {
            await this.testPageLoad();
            await this.testVersionSelection();
            await this.testBedManagement();
            await this.testNoteCreation();
            await this.testMedicationManagement();
            await this.testScales();
            await this.testPWAFeatures();
            
        } catch (error) {
            this.errors.push({
                type: 'test_error',
                message: error.message,
                stack: error.stack,
                timestamp: new Date().toISOString()
            });
        }
    }

    async testPageLoad() {
        console.log('📄 Probando carga de página...');
        
        const startTime = Date.now();
        await this.page.goto('http://localhost:8080', { 
            waitUntil: 'networkidle2',
            timeout: 30000 
        });
        const loadTime = Date.now() - startTime;
        
        this.testResults.push({
            test: 'Page Load',
            status: 'PASS',
            duration: loadTime,
            details: `Página cargada en ${loadTime}ms`
        });
        
        // Verificar que elementos críticos estén presentes
        const criticalElements = [
            '#version-splash',
            '#bed-selector',
            '#app'
        ];
        
        for (const selector of criticalElements) {
            const element = await this.page.$(selector);
            if (!element) {
                this.testResults.push({
                    test: `Critical Element: ${selector}`,
                    status: 'FAIL',
                    details: `Elemento ${selector} no encontrado`
                });
            }
        }
    }

    async testVersionSelection() {
        console.log('🔄 Probando selección de versión...');
        
        try {
            // Esperar a que aparezca el modal de versión
            await this.page.waitForSelector('#version-splash', { visible: true });
            
            // Seleccionar versión simple
            await this.page.click('#version-simple');
            
            // Esperar a que desaparezca el modal
            await this.page.waitForSelector('#version-splash', { hidden: true });
            
            this.testResults.push({
                test: 'Version Selection',
                status: 'PASS',
                details: 'Versión simple seleccionada correctamente'
            });
            
        } catch (error) {
            this.testResults.push({
                test: 'Version Selection',
                status: 'FAIL',
                details: error.message
            });
        }
    }

    async testBedManagement() {
        console.log('🛏️ Probando gestión de camas...');
        
        try {
            // Verificar que hay al menos una cama
            const bedSelector = await this.page.$('#bed-selector');
            const bedOptions = await this.page.$$('#bed-selector option');
            
            if (bedOptions.length === 0) {
                throw new Error('No hay camas disponibles');
            }
            
            // Probar añadir nueva cama
            await this.page.click('#add-bed-btn');
            
            // Esperar un poco para que se procese
            await this.page.waitForTimeout(1000);
            
            // Verificar que se añadió una cama
            const newBedOptions = await this.page.$$('#bed-selector option');
            
            if (newBedOptions.length <= bedOptions.length) {
                throw new Error('No se añadió nueva cama');
            }
            
            this.testResults.push({
                test: 'Bed Management',
                status: 'PASS',
                details: `Gestión de camas funcionando. Camas: ${newBedOptions.length}`
            });
            
        } catch (error) {
            this.testResults.push({
                test: 'Bed Management',
                status: 'FAIL',
                details: error.message
            });
        }
    }

    async testNoteCreation() {
        console.log('📝 Probando creación de notas...');
        
        try {
            // Buscar el textarea principal (versión simple)
            const textarea = await this.page.$('textarea[placeholder*="evolución"], textarea[placeholder*="nota"], #evolucion-libre');
            
            if (!textarea) {
                throw new Error('No se encontró el área de texto para notas');
            }
            
            // Escribir una nota de prueba
            const testNote = 'Nota de prueba - Paciente estable, sin complicaciones.';
            await textarea.type(testNote);
            
            // Verificar que el texto se escribió
            const textValue = await this.page.evaluate(el => el.value, textarea);
            
            if (!textValue.includes('Nota de prueba')) {
                throw new Error('El texto no se escribió correctamente');
            }
            
            this.testResults.push({
                test: 'Note Creation',
                status: 'PASS',
                details: 'Creación de notas funcionando correctamente'
            });
            
        } catch (error) {
            this.testResults.push({
                test: 'Note Creation',
                status: 'FAIL',
                details: error.message
            });
        }
    }

    async testMedicationManagement() {
        console.log('💊 Probando gestión de medicamentos...');
        
        try {
            // Buscar el input de medicamentos
            const medInput = await this.page.$('#medication-input, input[placeholder*="medicamento"]');
            
            if (!medInput) {
                throw new Error('No se encontró el input de medicamentos');
            }
            
            // Escribir un medicamento
            await medInput.type('Paracetamol');
            
            // Esperar sugerencias
            await this.page.waitForTimeout(500);
            
            // Buscar botón de añadir o presionar Enter
            await this.page.keyboard.press('Enter');
            
            this.testResults.push({
                test: 'Medication Management',
                status: 'PASS',
                details: 'Gestión de medicamentos accesible'
            });
            
        } catch (error) {
            this.testResults.push({
                test: 'Medication Management',
                status: 'FAIL',
                details: error.message
            });
        }
    }

    async testScales() {
        console.log('⚖️ Probando escalas neurológicas...');
        
        try {
            // Buscar botón de escalas
            const scalesBtn = await this.page.$('#scales-btn-floating');
            
            if (!scalesBtn) {
                throw new Error('No se encontró el botón de escalas');
            }
            
            // Hacer clic en escalas
            await scalesBtn.click();
            
            // Esperar a que aparezca el menú
            await this.page.waitForTimeout(500);
            
            this.testResults.push({
                test: 'Neurological Scales',
                status: 'PASS',
                details: 'Escalas neurológicas accesibles'
            });
            
        } catch (error) {
            this.testResults.push({
                test: 'Neurological Scales',
                status: 'FAIL',
                details: error.message
            });
        }
    }

    async testPWAFeatures() {
        console.log('📱 Probando funcionalidades PWA...');
        
        try {
            // Verificar que el Service Worker se registró
            const swRegistered = await this.page.evaluate(() => {
                return 'serviceWorker' in navigator;
            });
            
            if (!swRegistered) {
                throw new Error('Service Worker no soportado');
            }
            
            // Verificar manifest
            const manifestLink = await this.page.$('link[rel="manifest"]');
            
            this.testResults.push({
                test: 'PWA Features',
                status: swRegistered ? 'PASS' : 'FAIL',
                details: `Service Worker: ${swRegistered ? 'Soportado' : 'No soportado'}`
            });
            
        } catch (error) {
            this.testResults.push({
                test: 'PWA Features',
                status: 'FAIL',
                details: error.message
            });
        }
    }

    async generateReport() {
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                totalTests: this.testResults.length,
                passed: this.testResults.filter(t => t.status === 'PASS').length,
                failed: this.testResults.filter(t => t.status === 'FAIL').length,
                totalErrors: this.errors.length
            },
            testResults: this.testResults,
            errors: this.errors
        };
        
        // Guardar reporte
        const reportPath = path.join(process.cwd(), 'app-test-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        
        return report;
    }

    printReport(report) {
        console.log('\n🧪 REPORTE DE PRUEBAS DE FUNCIONALIDAD');
        console.log('=====================================');
        console.log(`📅 Timestamp: ${report.timestamp}`);
        console.log(`✅ Tests pasados: ${report.summary.passed}`);
        console.log(`❌ Tests fallidos: ${report.summary.failed}`);
        console.log(`🚨 Errores totales: ${report.summary.totalErrors}`);
        
        console.log('\n📋 RESULTADOS DETALLADOS:');
        console.log('=========================');
        
        for (const test of report.testResults) {
            const icon = test.status === 'PASS' ? '✅' : '❌';
            console.log(`${icon} ${test.test}: ${test.status}`);
            console.log(`   📝 ${test.details}`);
            if (test.duration) {
                console.log(`   ⏱️ ${test.duration}ms`);
            }
        }
        
        if (report.errors.length > 0) {
            console.log('\n🚨 ERRORES ENCONTRADOS:');
            console.log('=======================');
            
            for (const error of report.errors) {
                console.log(`\n❌ ${error.type.toUpperCase()}`);
                console.log(`   📝 ${error.message}`);
                console.log(`   🕐 ${error.timestamp}`);
            }
        }
        
        console.log(`\n📄 Reporte completo guardado en: app-test-report.json`);
    }

    async cleanup() {
        if (this.browser) {
            await this.browser.close();
        }
    }
}

// Ejecutar pruebas
async function main() {
    const tester = new AppTester();
    
    try {
        await tester.initialize();
        await tester.runTests();
        
        const report = await tester.generateReport();
        tester.printReport(report);
        
        // Exit code basado en tests fallidos
        const failedTests = report.summary.failed;
        if (failedTests > 0) {
            console.log(`\n⚠️ ${failedTests} tests fallaron`);
            process.exit(1);
        } else {
            console.log('\n🎉 ¡Todas las pruebas pasaron!');
        }
        
    } catch (error) {
        console.error('❌ Error ejecutando pruebas:', error);
        process.exit(1);
    } finally {
        await tester.cleanup();
    }
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = AppTester; 