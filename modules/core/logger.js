/**
 * @fileoverview Módulo de logging centralizado
 * @version 2.1.0
 */

export class Logger {
  constructor() {
    this.levels = {
      DEBUG: 0,
      INFO: 1,
      WARN: 2,
      ERROR: 3
    };
    this.currentLevel = 0;
  }
  
  log(level, message, data = null) {
    if (level >= this.currentLevel) {
      const timestamp = new Date().toISOString();
      const prefix = `[${timestamp}] [${Object.keys(this.levels).find(key => this.levels[key] === level)}]`;
      if (data) {
        console.log(`${prefix} ${message}`, data);
      } else {
        console.log(`${prefix} ${message}`);
      }
    }
  }
  
  debug(message, data) {
    this.log(this.levels.DEBUG, message, data);
  }
  
  info(message, data) {
    this.log(this.levels.INFO, message, data);
  }
  
  warn(message, data) {
    this.log(this.levels.WARN, message, data);
  }
  
  error(message, data) {
    this.log(this.levels.ERROR, message, data);
  }

  setLevel(level) {
    if (typeof level === 'string') {
      this.currentLevel = this.levels[level.toUpperCase()] ?? this.levels.DEBUG;
    } else {
      this.currentLevel = level;
    }
  }
}

// Instancia singleton
export const logger = new Logger();

// Función de compatibilidad
export function logDebug(...args) {
  logger.debug(args[0], args.slice(1));
} 