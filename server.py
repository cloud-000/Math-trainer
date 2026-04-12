import os
import http.server
from urllib.parse import urlparse
# AI generated server
class MyRequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # Check if the requested file exists in the filesystem
        if self.path != '/' and not os.path.exists(self.path[1:]):
            # If the path doesn't exist, redirect to /index.html (SPA behavior)
            self.path = '/index.html'

        # Call the parent class to handle the request
        return super().do_GET()

# Serve static files from the current directory (the public directory)
if __name__ == '__main__':
    os.chdir('public')  # Change to your 'public' folder where static files are stored

    # Set up the server with custom handler
    port = 8000
    httpd = http.server.HTTPServer(('localhost', port), MyRequestHandler)
    print(f"Serving on http://localhost:{port}")
    httpd.serve_forever()