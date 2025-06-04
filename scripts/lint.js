#!/usr/bin/env node

/**
 * 🔍 Linting Script
 * Analiza la calidad del código y detecta problemas potenciales
 */

import { readFileSync, readdirSync, statSync, writeFileSync } from 'fs';
import { join, extname, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuración
const CONFIG = {
    srcDir: process.cwd(),
    extensions: ['.js', '.mjs', '.html', '.css'],
    ignorePatterns: [
        'node_modules',
        'dist',
        'build',
        '.git',
        'coverage'
    ],
    rules: {
        javascript: {
            'no-console-log': { level: 'warn', message: 'Evitar console.log en producción' },
            'no-eval': { level: 'error', message: 'Uso de eval() es peligroso' },
            'no-alert': { level: 'warn', message: 'Evitar alert() en producción' },
            'no-var': { level: 'warn', message: 'Usar let/const en lugar de var' },
            'no-unused-vars': { level: 'warn', message: 'Variable declarada pero no utilizada' },
            'no-duplicate-functions': { level: 'error', message: 'Función duplicada detectada' },
            'no-long-functions': { level: 'warn', message: 'Función muy larga (>50 líneas)' },
            'no-deep-nesting': { level: 'warn', message: 'Anidación muy profunda (>4 niveles)' },
            'no-magic-numbers': { level: 'info', message: 'Número mágico detectado' },
            'no-empty-catch': { level: 'warn', message: 'Bloque catch vacío' }
        },
        html: {
            'missing-doctype': { level: 'error', message: 'DOCTYPE faltante' },
            'missing-lang': { level: 'warn', message: 'Atributo lang faltante' },
            'missing-meta-charset': { level: 'error', message: 'Meta charset faltante' },
            'missing-title': { level: 'warn', message: 'Título faltante' },
            'inline-styles': { level: 'warn', message: 'Estilos inline detectados' }
        },
        css: {
            'no-important': { level: 'warn', message: 'Uso excesivo de !important' },
            'no-ids': { level: 'info', message: 'Selector de ID detectado' },
            'no-universal': { level: 'warn', message: 'Selector universal (*) detectado' }
        }
    }
};

class CodeLinter {
    constructor() {
        this.results = {
            files: 0,
            errors: 0,
            warnings: 0,
            info: 0,
            issues: [],
            startTime: Date.now()
        };
        this.functionNames = new Set();
    }

    /**
     * Ejecuta el linting completo
     */
    async lint() {
        console.log('🔍 Iniciando análisis de código...');
        
        try {
            await this.scanDirectory(CONFIG.srcDir);
            this.generateReport();
            
            const hasErrors = this.results.errors > 0;
            console.log(hasErrors ? '❌ Linting completado con errores' : '✅ Linting completado exitosamente');
            
            return !hasErrors;
        } catch (error) {
            console.error('❌ Error durante el linting:', error.message);
            return false;
        }
    }

    /**
     * Escanea un directorio recursivamente
     */
    async scanDirectory(dirPath) {
        const items = readdirSync(dirPath);
        
        for (const item of items) {
            const fullPath = join(dirPath, item);
            const stat = statSync(fullPath);
            
            // Ignorar patrones especificados
            if (this.shouldIgnore(item)) {
                continue;
            }
            
            if (stat.isDirectory()) {
                await this.scanDirectory(fullPath);
            } else if (stat.isFile()) {
                await this.lintFile(fullPath);
            }
        }
    }

    /**
     * Verifica si un archivo/directorio debe ser ignorado
     */
    shouldIgnore(name) {
        return CONFIG.ignorePatterns.some(pattern => name.includes(pattern));
    }

    /**
     * Analiza un archivo individual
     */
    async lintFile(filePath) {
        const ext = extname(filePath).toLowerCase();
        
        if (!CONFIG.extensions.includes(ext)) {
            return;
        }

        this.results.files++;
        const content = readFileSync(filePath, 'utf8');
        
        switch (ext) {
            case '.js':
            case '.mjs':
                await this.lintJavaScript(filePath, content);
                break;
            case '.html':
                await this.lintHTML(filePath, content);
                break;
            case '.css':
                await this.lintCSS(filePath, content);
                break;
        }
    }

    /**
     * Analiza archivos JavaScript
     */
    async lintJavaScript(filePath, content) {
        const lines = content.split('\n');
        
        lines.forEach((line, index) => {
            const lineNumber = index + 1;
            const trimmedLine = line.trim();
            
            // No console.log
            if (trimmedLine.includes('console.log(') && !trimmedLine.includes('//')) {
                this.addIssue(filePath, lineNumber, 'no-console-log', line);
            }
            
            // No eval
            if (trimmedLine.includes('eval(')) {
                this.addIssue(filePath, lineNumber, 'no-eval', line);
            }
            
            // No alert
            if (trimmedLine.includes('alert(') && !trimmedLine.includes('//')) {
                this.addIssue(filePath, lineNumber, 'no-alert', line);
            }
            
            // No var
            if (trimmedLine.startsWith('var ')) {
                this.addIssue(filePath, lineNumber, 'no-var', line);
            }
            
            // Catch vacío
            if (trimmedLine.includes('catch') && lines[index + 1]?.trim() === '}') {
                this.addIssue(filePath, lineNumber, 'no-empty-catch', line);
            }
            
            // Números mágicos
            const magicNumbers = line.match(/\b\d{3,}\b/g);
            if (magicNumbers && !trimmedLine.includes('//')) {
                this.addIssue(filePath, lineNumber, 'no-magic-numbers', line);
            }
        });
        
        // Análisis de funciones
        this.analyzeFunctions(filePath, content);
        
        // Análisis de anidación
        this.analyzeNesting(filePath, content);
    }

    /**
     * Analiza funciones JavaScript
     */
    analyzeFunctions(filePath, content) {
        const functionRegex = /function\s+(\w+)\s*\(/g;
        const arrowFunctionRegex = /const\s+(\w+)\s*=\s*\(/g;
        
        let match;
        
        // Funciones tradicionales
        while ((match = functionRegex.exec(content)) !== null) {
            const functionName = match[1];
            if (this.functionNames.has(functionName)) {
                const lineNumber = content.substring(0, match.index).split('\n').length;
                this.addIssue(filePath, lineNumber, 'no-duplicate-functions', match[0]);
            }
            this.functionNames.add(functionName);
            
            // Verificar longitud de función
            this.checkFunctionLength(filePath, content, match.index, functionName);
        }
        
        // Arrow functions
        while ((match = arrowFunctionRegex.exec(content)) !== null) {
            const functionName = match[1];
            if (this.functionNames.has(functionName)) {
                const lineNumber = content.substring(0, match.index).split('\n').length;
                this.addIssue(filePath, lineNumber, 'no-duplicate-functions', match[0]);
            }
            this.functionNames.add(functionName);
        }
    }

    /**
     * Verifica la longitud de las funciones
     */
    checkFunctionLength(filePath, content, startIndex, functionName) {
        const lines = content.substring(startIndex).split('\n');
        let braceCount = 0;
        let functionLines = 0;
        let started = false;
        
        for (const line of lines) {
            if (line.includes('{')) {
                braceCount += (line.match(/\{/g) || []).length;
                started = true;
            }
            if (line.includes('}')) {
                braceCount -= (line.match(/\}/g) || []).length;
            }
            
            if (started) {
                functionLines++;
                if (braceCount === 0) break;
            }
        }
        
        if (functionLines > 50) {
            const lineNumber = content.substring(0, startIndex).split('\n').length;
            this.addIssue(filePath, lineNumber, 'no-long-functions', `function ${functionName} (${functionLines} líneas)`);
        }
    }

    /**
     * Analiza la profundidad de anidación
     */
    analyzeNesting(filePath, content) {
        const lines = content.split('\n');
        let currentDepth = 0;
        let maxDepth = 0;
        
        lines.forEach((line, index) => {
            const openBraces = (line.match(/\{/g) || []).length;
            const closeBraces = (line.match(/\}/g) || []).length;
            
            currentDepth += openBraces - closeBraces;
            maxDepth = Math.max(maxDepth, currentDepth);
            
            if (currentDepth > 4) {
                this.addIssue(filePath, index + 1, 'no-deep-nesting', line);
            }
        });
    }

    /**
     * Analiza archivos HTML
     */
    async lintHTML(filePath, content) {
        const lines = content.split('\n');
        
        // DOCTYPE
        if (!content.includes('<!DOCTYPE')) {
            this.addIssue(filePath, 1, 'missing-doctype', 'Archivo HTML sin DOCTYPE');
        }
        
        // Lang attribute
        if (!content.includes('lang=')) {
            this.addIssue(filePath, 1, 'missing-lang', 'Atributo lang faltante en <html>');
        }
        
        // Meta charset
        if (!content.includes('charset=')) {
            this.addIssue(filePath, 1, 'missing-meta-charset', 'Meta charset faltante');
        }
        
        // Title
        if (!content.includes('<title>')) {
            this.addIssue(filePath, 1, 'missing-title', 'Elemento <title> faltante');
        }
        
        // Estilos inline
        lines.forEach((line, index) => {
            if (line.includes('style=')) {
                this.addIssue(filePath, index + 1, 'inline-styles', line.trim());
            }
        });
    }

    /**
     * Analiza archivos CSS
     */
    async lintCSS(filePath, content) {
        const lines = content.split('\n');
        
        lines.forEach((line, index) => {
            const trimmedLine = line.trim();
            
            // !important
            if (trimmedLine.includes('!important')) {
                this.addIssue(filePath, index + 1, 'no-important', line);
            }
            
            // Selectores de ID
            if (trimmedLine.includes('#') && !trimmedLine.startsWith('/*')) {
                this.addIssue(filePath, index + 1, 'no-ids', line);
            }
            
            // Selector universal
            if (trimmedLine.includes('*') && !trimmedLine.startsWith('/*')) {
                this.addIssue(filePath, index + 1, 'no-universal', line);
            }
        });
    }

    /**
     * Añade un problema detectado
     */
    addIssue(filePath, lineNumber, ruleId, code) {
        const rule = this.findRule(ruleId);
        if (!rule) return;
        
        const issue = {
            file: filePath.replace(CONFIG.srcDir + '/', ''),
            line: lineNumber,
            rule: ruleId,
            level: rule.level,
            message: rule.message,
            code: code.trim()
        };
        
        this.results.issues.push(issue);
        
        switch (rule.level) {
            case 'error':
                this.results.errors++;
                break;
            case 'warn':
                this.results.warnings++;
                break;
            case 'info':
                this.results.info++;
                break;
        }
    }

    /**
     * Busca una regla por ID
     */
    findRule(ruleId) {
        for (const category of Object.values(CONFIG.rules)) {
            if (category[ruleId]) {
                return category[ruleId];
            }
        }
        return null;
    }

    /**
     * Genera el reporte de resultados
     */
    generateReport() {
        const duration = Date.now() - this.results.startTime;
        
        console.log('\n🔍 REPORTE DE LINTING');
        console.log('═'.repeat(50));
        console.log(`⏱️  Duración: ${duration}ms`);
        console.log(`📄 Archivos analizados: ${this.results.files}`);
        console.log(`❌ Errores: ${this.results.errors}`);
        console.log(`⚠️  Advertencias: ${this.results.warnings}`);
        console.log(`ℹ️  Información: ${this.results.info}`);
        
        if (this.results.issues.length > 0) {
            console.log('\n📋 PROBLEMAS DETECTADOS:');
            console.log('─'.repeat(50));
            
            // Agrupar por nivel
            const byLevel = {
                error: this.results.issues.filter(i => i.level === 'error'),
                warn: this.results.issues.filter(i => i.level === 'warn'),
                info: this.results.issues.filter(i => i.level === 'info')
            };
            
            // Mostrar errores primero
            if (byLevel.error.length > 0) {
                console.log('\n❌ ERRORES:');
                byLevel.error.forEach(issue => {
                    console.log(`  ${issue.file}:${issue.line} - ${issue.message}`);
                    console.log(`    ${issue.code}`);
                });
            }
            
            // Luego advertencias
            if (byLevel.warn.length > 0) {
                console.log('\n⚠️  ADVERTENCIAS:');
                byLevel.warn.slice(0, 10).forEach(issue => {
                    console.log(`  ${issue.file}:${issue.line} - ${issue.message}`);
                });
                if (byLevel.warn.length > 10) {
                    console.log(`  ... y ${byLevel.warn.length - 10} advertencias más`);
                }
            }
            
            // Finalmente información
            if (byLevel.info.length > 0) {
                console.log(`\nℹ️  ${byLevel.info.length} elementos informativos detectados`);
            }
        } else {
            console.log('\n✅ ¡No se encontraron problemas!');
        }
        
        // Guardar reporte detallado
        this.saveDetailedReport();
        
        // Mostrar recomendaciones
        this.showRecommendations();
    }

    /**
     * Guarda un reporte detallado en JSON
     */
    saveDetailedReport() {
        const reportPath = join(CONFIG.srcDir, 'lint-report.json');
        const report = {
            summary: {
                files: this.results.files,
                errors: this.results.errors,
                warnings: this.results.warnings,
                info: this.results.info,
                duration: Date.now() - this.results.startTime
            },
            issues: this.results.issues,
            timestamp: new Date().toISOString()
        };
        
        try {
            writeFileSync(reportPath, JSON.stringify(report, null, 2));
            console.log(`\n💾 Reporte detallado guardado en: ${reportPath}`);
        } catch (error) {
            console.warn(`⚠️  No se pudo guardar el reporte: ${error.message}`);
        }
    }

    /**
     * Muestra recomendaciones basadas en los problemas encontrados
     */
    showRecommendations() {
        const recommendations = [];
        
        if (this.results.errors > 0) {
            recommendations.push('🔧 Corrige los errores antes de continuar');
        }
        
        if (this.results.warnings > 10) {
            recommendations.push('⚠️  Considera revisar las advertencias para mejorar la calidad');
        }
        
        const consoleIssues = this.results.issues.filter(i => i.rule === 'no-console-log');
        if (consoleIssues.length > 5) {
            recommendations.push('🧹 Limpia los console.log antes de producción');
        }
        
        const longFunctions = this.results.issues.filter(i => i.rule === 'no-long-functions');
        if (longFunctions.length > 0) {
            recommendations.push('✂️  Considera dividir las funciones largas');
        }
        
        if (recommendations.length > 0) {
            console.log('\n💡 RECOMENDACIONES:');
            recommendations.forEach(rec => console.log(`  ${rec}`));
        }
    }
}

// Función principal
async function main() {
    const args = process.argv.slice(2);
    const shouldFix = args.includes('--fix');
    
    const linter = new CodeLinter();
    const success = await linter.lint();
    
    if (shouldFix) {
        console.log('\n🔧 Modo de corrección automática no implementado aún');
    }
    
    process.exit(success ? 0 : 1);
}

// Ejecutar si es el archivo principal
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}

export default CodeLinter; 