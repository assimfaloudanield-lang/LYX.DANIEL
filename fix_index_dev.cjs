const fs = require('fs');

let code = fs.readFileSync('index.html', 'utf8');

// Add the eruda script back
const erudaScript = `
    <!-- Sandbox Mobile Developer Console (Eruda) -->
    <script>
      if (
        window.location.hostname.includes('-dev-') || 
        window.location.hostname.includes('localhost') || 
        window.location.search.includes('debug=true')
      ) {
        var script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/eruda';
        document.body.appendChild(script);
        script.onload = function () {
          eruda.init({
            defaults: {
              displaySize: 50,
              theme: 'dark'
            }
          });
        };
      }
    </script>`;

if (!code.includes('eruda.init')) {
    code = code.replace('</body>', erudaScript + '\n  </body>');
    fs.writeFileSync('index.html', code);
    console.log('Eruda script added back to index.html');
} else {
    console.log('Eruda script already present');
}
