/**
 * @fileoverview Sistema de Testing para Suite Neurología v2.1.0
 * @version 1.0.0
 */

export class TestRunner {
  constructor() {
    this.tests = new Map();
    this.results = {
      passed: 0,
      failed: 0,
      skipped: 0,
      total: 0,
      details: []
    };
    this.beforeEachCallbacks = [];
    this.afterEachCallbacks = [];
    this.setupCallbacks = [];
    this.teardownCallbacks = [];
  }

  /**
   * Registra un test
   * @param {string} name - Nombre del test
   * @param {Function} testFn - Función del test
   * @param {Object} options - Opciones del test
   */
  test(name, testFn, options = {}) {
    this.tests.set(name, {
      fn: testFn,
      timeout: options.timeout || 5000,
      skip: options.skip || false,
      only: options.only || false,
      category: options.category || 'general'
    });
  }

  /**
   * Registra callback para ejecutar antes de cada test
   * @param {Function} callback - Función a ejecutar
   */
  beforeEach(callback) {
    this.beforeEachCallbacks.push(callback);
  }

  /**
   * Registra callback para ejecutar después de cada test
   * @param {Function} callback - Función a ejecutar
   */
  afterEach(callback) {
    this.afterEachCallbacks.push(callback);
  }

  /**
   * Registra callback para setup inicial
   * @param {Function} callback - Función a ejecutar
   */
  setup(callback) {
    this.setupCallbacks.push(callback);
  }

  /**
   * Registra callback para teardown final
   * @param {Function} callback - Función a ejecutar
   */
  teardown(callback) {
    this.teardownCallbacks.push(callback);
  }

  /**
   * Ejecuta todos los tests
   * @param {Object} options - Opciones de ejecución
   * @returns {Promise<Object>} - Resultados de los tests
   */
  async run(options = {}) {
    console.log('🧪 Iniciando Suite de Tests - Suite Neurología v2.1.0');
    console.log('=' .repeat(60));

    // Ejecutar setup
    for (const setupFn of this.setupCallbacks) {
      await setupFn();
    }

    // Filtrar tests
    let testsToRun = Array.from(this.tests.entries());
    
    // Si hay tests marcados como 'only', ejecutar solo esos
    const onlyTests = testsToRun.filter(([, test]) => test.only);
    if (onlyTests.length > 0) {
      testsToRun = onlyTests;
    }

    // Filtrar por categoría si se especifica
    if (options.category) {
      testsToRun = testsToRun.filter(([, test]) => test.category === options.category);
    }

    this.results.total = testsToRun.length;

    for (const [name, test] of testsToRun) {
      if (test.skip) {
        this.results.skipped++;
        this.results.details.push({
          name,
          status: 'skipped',
          category: test.category,
          message: 'Test marcado como skip'
        });
        console.log(`⏭️  ${name} (skipped)`);
        continue;
      }

      try {
        // Ejecutar beforeEach
        for (const beforeFn of this.beforeEachCallbacks) {
          await beforeFn();
        }

        const startTime = performance.now();
        
        // Ejecutar test con timeout
        await Promise.race([
          test.fn(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Test timeout')), test.timeout)
          )
        ]);

        const endTime = performance.now();
        const duration = Math.round(endTime - startTime);

        this.results.passed++;
        this.results.details.push({
          name,
          status: 'passed',
          category: test.category,
          duration,
          message: `Completado en ${duration}ms`
        });
        console.log(`✅ ${name} (${duration}ms)`);

        // Ejecutar afterEach
        for (const afterFn of this.afterEachCallbacks) {
          await afterFn();
        }

      } catch (error) {
        this.results.failed++;
        this.results.details.push({
          name,
          status: 'failed',
          category: test.category,
          error: error.message,
          stack: error.stack
        });
        console.error(`❌ ${name}: ${error.message}`);
      }
    }

    // Ejecutar teardown
    for (const teardownFn of this.teardownCallbacks) {
      await teardownFn();
    }

    this.printSummary();
    return this.results;
  }

  /**
   * Imprime resumen de resultados
   */
  printSummary() {
    console.log('\n' + '=' .repeat(60));
    console.log('📊 RESUMEN DE TESTS');
    console.log('=' .repeat(60));
    console.log(`Total: ${this.results.total}`);
    console.log(`✅ Pasaron: ${this.results.passed}`);
    console.log(`❌ Fallaron: ${this.results.failed}`);
    console.log(`⏭️  Omitidos: ${this.results.skipped}`);
    
    const successRate = this.results.total > 0 
      ? Math.round((this.results.passed / this.results.total) * 100) 
      : 0;
    console.log(`📈 Tasa de éxito: ${successRate}%`);

    // Agrupar por categoría
    const byCategory = this.results.details.reduce((acc, test) => {
      if (!acc[test.category]) {
        acc[test.category] = { passed: 0, failed: 0, skipped: 0 };
      }
      acc[test.category][test.status]++;
      return acc;
    }, {});

    console.log('\n📂 Por categoría:');
    Object.entries(byCategory).forEach(([category, stats]) => {
      console.log(`  ${category}: ${stats.passed}✅ ${stats.failed}❌ ${stats.skipped}⏭️`);
    });

    if (this.results.failed > 0) {
      console.log('\n💥 Tests fallidos:');
      this.results.details
        .filter(test => test.status === 'failed')
        .forEach(test => {
          console.log(`  • ${test.name}: ${test.error}`);
        });
    }
  }

  /**
   * Limpia todos los tests y resultados
   */
  clear() {
    this.tests.clear();
    this.results = {
      passed: 0,
      failed: 0,
      skipped: 0,
      total: 0,
      details: []
    };
    this.beforeEachCallbacks = [];
    this.afterEachCallbacks = [];
    this.setupCallbacks = [];
    this.teardownCallbacks = [];
  }
}

/**
 * Utilidades de aserciones para tests
 */
export const assert = {
  /**
   * Verifica que una condición sea verdadera
   * @param {boolean} condition - Condición a verificar
   * @param {string} message - Mensaje de error
   */
  isTrue(condition, message = 'Expected condition to be true') {
    if (!condition) {
      throw new Error(message);
    }
  },

  /**
   * Verifica que una condición sea falsa
   * @param {boolean} condition - Condición a verificar
   * @param {string} message - Mensaje de error
   */
  isFalse(condition, message = 'Expected condition to be false') {
    if (condition) {
      throw new Error(message);
    }
  },

  /**
   * Verifica igualdad estricta
   * @param {any} actual - Valor actual
   * @param {any} expected - Valor esperado
   * @param {string} message - Mensaje de error
   */
  equals(actual, expected, message) {
    if (actual !== expected) {
      throw new Error(message || `Expected ${expected}, got ${actual}`);
    }
  },

  /**
   * Verifica igualdad profunda para objetos
   * @param {any} actual - Valor actual
   * @param {any} expected - Valor esperado
   * @param {string} message - Mensaje de error
   */
  deepEquals(actual, expected, message) {
    if (!this._deepEqual(actual, expected)) {
      throw new Error(message || `Deep equality failed: ${JSON.stringify(actual)} !== ${JSON.stringify(expected)}`);
    }
  },

  /**
   * Verifica que un valor no sea null o undefined
   * @param {any} value - Valor a verificar
   * @param {string} message - Mensaje de error
   */
  exists(value, message = 'Expected value to exist') {
    if (value == null) {
      throw new Error(message);
    }
  },

  /**
   * Verifica que una función lance un error
   * @param {Function} fn - Función a ejecutar
   * @param {string|RegExp} expectedError - Error esperado
   * @param {string} message - Mensaje de error
   */
  throws(fn, expectedError, message = 'Expected function to throw') {
    try {
      fn();
      throw new Error(message);
    } catch (error) {
      if (expectedError) {
        if (typeof expectedError === 'string' && !error.message.includes(expectedError)) {
          throw new Error(`Expected error containing "${expectedError}", got "${error.message}"`);
        }
        if (expectedError instanceof RegExp && !expectedError.test(error.message)) {
          throw new Error(`Expected error matching ${expectedError}, got "${error.message}"`);
        }
      }
    }
  },

  /**
   * Verifica que una función asíncrona lance un error
   * @param {Function} fn - Función asíncrona a ejecutar
   * @param {string|RegExp} expectedError - Error esperado
   * @param {string} message - Mensaje de error
   */
  async throwsAsync(fn, expectedError, message = 'Expected async function to throw') {
    try {
      await fn();
      throw new Error(message);
    } catch (error) {
      if (expectedError) {
        if (typeof expectedError === 'string' && !error.message.includes(expectedError)) {
          throw new Error(`Expected error containing "${expectedError}", got "${error.message}"`);
        }
        if (expectedError instanceof RegExp && !expectedError.test(error.message)) {
          throw new Error(`Expected error matching ${expectedError}, got "${error.message}"`);
        }
      }
    }
  },

  /**
   * Verifica que un array contenga un elemento
   * @param {Array} array - Array a verificar
   * @param {any} element - Elemento a buscar
   * @param {string} message - Mensaje de error
   */
  contains(array, element, message) {
    if (!Array.isArray(array) || !array.includes(element)) {
      throw new Error(message || `Expected array to contain ${element}`);
    }
  },

  /**
   * Verifica el tipo de un valor
   * @param {any} value - Valor a verificar
   * @param {string} expectedType - Tipo esperado
   * @param {string} message - Mensaje de error
   */
  isType(value, expectedType, message) {
    const actualType = typeof value;
    if (actualType !== expectedType) {
      throw new Error(message || `Expected type ${expectedType}, got ${actualType}`);
    }
  },

  /**
   * Implementación de igualdad profunda
   * @private
   */
  _deepEqual(a, b) {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (typeof a !== typeof b) return false;
    
    if (typeof a === 'object') {
      if (Array.isArray(a) !== Array.isArray(b)) return false;
      
      const keysA = Object.keys(a);
      const keysB = Object.keys(b);
      
      if (keysA.length !== keysB.length) return false;
      
      for (const key of keysA) {
        if (!keysB.includes(key)) return false;
        if (!this._deepEqual(a[key], b[key])) return false;
      }
      
      return true;
    }
    
    return false;
  }
};

/**
 * Utilidades para mocking
 */
export const mock = {
  /**
   * Crea un mock de función
   * @param {Function} originalFn - Función original (opcional)
   * @returns {Function} - Función mock
   */
  fn(originalFn) {
    const mockFn = function(...args) {
      mockFn.calls.push(args);
      mockFn.callCount++;
      
      if (mockFn._implementation) {
        return mockFn._implementation(...args);
      }
      
      if (originalFn) {
        return originalFn(...args);
      }
    };
    
    mockFn.calls = [];
    mockFn.callCount = 0;
    mockFn._implementation = null;
    
    mockFn.mockImplementation = function(fn) {
      mockFn._implementation = fn;
      return mockFn;
    };
    
    mockFn.mockReturnValue = function(value) {
      mockFn._implementation = () => value;
      return mockFn;
    };
    
    mockFn.mockResolvedValue = function(value) {
      mockFn._implementation = () => Promise.resolve(value);
      return mockFn;
    };
    
    mockFn.mockRejectedValue = function(error) {
      mockFn._implementation = () => Promise.reject(error);
      return mockFn;
    };
    
    mockFn.reset = function() {
      mockFn.calls = [];
      mockFn.callCount = 0;
      mockFn._implementation = null;
    };
    
    return mockFn;
  },

  /**
   * Crea un mock de objeto
   * @param {Object} originalObj - Objeto original
   * @returns {Object} - Objeto mock
   */
  object(originalObj = {}) {
    const mockObj = { ...originalObj };
    mockObj._mocks = new Map();
    
    mockObj.mockMethod = function(methodName, implementation) {
      const originalMethod = mockObj[methodName];
      const mockMethod = mock.fn(originalMethod);
      
      if (implementation) {
        mockMethod.mockImplementation(implementation);
      }
      
      mockObj[methodName] = mockMethod;
      mockObj._mocks.set(methodName, { original: originalMethod, mock: mockMethod });
      
      return mockMethod;
    };
    
    mockObj.restore = function() {
      for (const [methodName, { original }] of mockObj._mocks) {
        mockObj[methodName] = original;
      }
      mockObj._mocks.clear();
    };
    
    return mockObj;
  }
};

// Crear instancia global del test runner
export const testRunner = new TestRunner(); 