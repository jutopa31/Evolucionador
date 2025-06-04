/**
 * 🛡️ Security Scanner
 * Escanea vulnerabilidades de seguridad en el código
 */

const fs = require('fs');
const path = require('path');

class SecurityScanner {
    constructor() {
        this.vulnerabilities = [];
        this.securityRules = [
            {
                name: 'Hardcoded Secrets',
                pattern: /(password|secret|key|token)\s*[:=]\s*['"][^'"]{8,}['"]/gi,
                severity: 'HIGH',
                description: 'Posibles secretos hardcodeados encontrados'
            },
            {
                name: 'SQL Injection Risk',
                pattern: /query\s*\+\s*['"]|['"].*\+.*query/gi,
                severity: 'HIGH',
                description: 'Posible riesgo de inyección SQL'
            },
            {
                name: 'XSS Risk',
                pattern: /innerHTML\s*=\s*[^;]+\+|document\.write\s*\(/gi,
                severity: 'MEDIUM',
                description: 'Posible riesgo de XSS'
            },
            {
                name: 'Eval Usage',
                pattern: /\beval\s*\(/gi,
                severity: 'HIGH',
                description: 'Uso de eval() detectado'
            },
            {
                name: 'Console Logs',
                pattern: /console\.(log|debug|info|warn|error)\s*\(/gi,
                severity: 'LOW',
                description: 'Console logs en código de producción'
            }
        ];
    }

    async scanDirectory(dirPath) {
        console.log(`🛡️ Escaneando directorio: ${dirPath}`);
        
        const files = this.getJavaScriptFiles(dirPath);
        
        for (const file of files) {
            await this.scanFile(file);
        }
        
        return this.generateReport();
    }

    getJavaScriptFiles(dirPath) {
        const files = [];
        
        const scanDir = (currentPath) => {
            const items = fs.readdirSync(currentPath);
            
            for (const item of items) {
                const fullPath = path.join(currentPath, item);
                const stat = fs.statSync(fullPath);
                
                if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
                    scanDir(fullPath);
                } else if (stat.isFile() && (item.endsWith('.js') || item.endsWith('.html'))) {
                    files.push(fullPath);
                }
            }
        };
        
        scanDir(dirPath);
        return files;
    }

    async scanFile(filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const lines = content.split('\n');
            
            for (let lineNum = 0; lineNum < lines.length; lineNum++) {
                const line = lines[lineNum];
                
                for (const rule of this.securityRules) {
                    const matches = line.match(rule.pattern);
                    if (matches) {
                        this.vulnerabilities.push({
                            file: filePath,
                            line: lineNum + 1,
                            rule: rule.name,
                            severity: rule.severity,
                            description: rule.description,
                            code: line.trim(),
                            match: matches[0]
                        });
                    }
                }
            }
        } catch (error) {
            console.warn(`⚠️ Error escaneando ${filePath}:`, error.message);
        }
    }

    generateReport() {
        const report = {
            timestamp: new Date().toISOString(),
            totalFiles: new Set(this.vulnerabilities.map(v => v.file)).size,
            totalVulnerabilities: this.vulnerabilities.length,
            severityCount: {
                HIGH: this.vulnerabilities.filter(v => v.severity === 'HIGH').length,
                MEDIUM: this.vulnerabilities.filter(v => v.severity === 'MEDIUM').length,
                LOW: this.vulnerabilities.filter(v => v.severity === 'LOW').length
            },
            vulnerabilities: this.vulnerabilities
        };
        
        return report;
    }

    printReport(report) {
        console.log('\n🛡️ REPORTE DE SEGURIDAD');
        console.log('========================');
        console.log(`📅 Timestamp: ${report.timestamp}`);
        console.log(`📁 Archivos escaneados: ${report.totalFiles}`);
        console.log(`🚨 Total vulnerabilidades: ${report.totalVulnerabilities}`);
        console.log(`🔴 Alta: ${report.severityCount.HIGH}`);
        console.log(`🟡 Media: ${report.severityCount.MEDIUM}`);
        console.log(`🟢 Baja: ${report.severityCount.LOW}`);
        
        if (report.vulnerabilities.length > 0) {
            console.log('\n📋 DETALLES:');
            console.log('=============');
            
            for (const vuln of report.vulnerabilities) {
                const severityIcon = vuln.severity === 'HIGH' ? '🔴' : 
                                   vuln.severity === 'MEDIUM' ? '🟡' : '🟢';
                
                console.log(`\n${severityIcon} ${vuln.rule} (${vuln.severity})`);
                console.log(`   📁 ${vuln.file}:${vuln.line}`);
                console.log(`   📝 ${vuln.description}`);
                console.log(`   💻 ${vuln.code}`);
            }
        }
        
        console.log('\n✅ Escaneo de seguridad completado');
        
        // Guardar reporte en archivo
        const reportPath = path.join(process.cwd(), 'security-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        console.log(`📄 Reporte guardado en: ${reportPath}`);
    }
}

// Ejecutar scanner
async function main() {
    const scanner = new SecurityScanner();
    const report = await scanner.scanDirectory(process.cwd());
    scanner.printReport(report);
    
    // Exit code basado en vulnerabilidades críticas
    const criticalVulns = report.severityCount.HIGH;
    if (criticalVulns > 0) {
        console.log(`\n⚠️ Se encontraron ${criticalVulns} vulnerabilidades críticas`);
        process.exit(1);
    }
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = SecurityScanner; 