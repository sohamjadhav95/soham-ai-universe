"""Serve dist/ the way Cloudflare Pages does: it ignores HTTP Range requests
and always sends the whole file (200, never 206). Use it to check that video
seeking still works (it does with the HLS streams; a plain MP4 restarts).

    npm run build
    python3 scripts/qa/no-range-server.py            # http://127.0.0.1:4180
    python3 scripts/qa/no-range-server.py dist 4180

Unknown paths fall back to index.html, like the real host.
"""
import http.server
import os
import socketserver
import sys

ROOT = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else 'dist')
PORT = int(sys.argv[2]) if len(sys.argv) > 2 else 4180


class Handler(http.server.SimpleHTTPRequestHandler):
    extensions_map = {
        **http.server.SimpleHTTPRequestHandler.extensions_map,
        '.m3u8': 'application/vnd.apple.mpegurl',
        '.m4s': 'video/iso.segment',
        '.mp4': 'video/mp4',
        '.webm': 'video/webm',
    }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def translate_path(self, path):
        full = super().translate_path(path)
        return full if os.path.exists(full) else os.path.join(ROOT, 'index.html')

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

    def log_message(self, *args):
        pass


class Server(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True


print(f'Serving {ROOT} without range support on http://127.0.0.1:{PORT}')
Server(('127.0.0.1', PORT), Handler).serve_forever()
