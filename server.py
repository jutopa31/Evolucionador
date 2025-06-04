from http.server import HTTPServer, SimpleHTTPRequestHandler
import webbrowser
import os

def run_server(port=8000):
    # Obtener el directorio actual
    current_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(current_dir)
    
    # Configurar el servidor
    server_address = ('', port)
    httpd = HTTPServer(server_address, SimpleHTTPRequestHandler)
    
    # Abrir el navegador automáticamente
    webbrowser.open(f'http://localhost:{port}')
    
    print(f'Servidor iniciado en http://localhost:{port}')
    print('Presiona Ctrl+C para detener el servidor')
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print('\nServidor detenido')
        httpd.server_close()

if __name__ == '__main__':
    run_server() 