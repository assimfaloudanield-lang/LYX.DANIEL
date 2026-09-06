const fs = require('fs');

let code = fs.readFileSync('index.html', 'utf8');

// The error is because eruda might not be loaded yet when onload fires, 
// or the script tag fails to load due to CSP or network.
// Let's use a safer approach for the dev console injection.

const erudaScriptStart = '<!-- Sandbox Mobile Developer Console (Eruda) -->';
const erudaScriptEnd = '</script>';

if (code.includes(erudaScriptStart)) {
    const startIndex = code.indexOf(erudaScriptStart);
    const endIndex = code.indexOf(erudaScriptEnd, startIndex) + erudaScriptEnd.length;
    
    code = code.substring(0, startIndex) + code.substring(endIndex);
    
    const saferEruda = `
    <!-- Sandbox Mobile Developer Console (Eruda) -->
    <script>
      (function() {
        if (
          window.location.hostname.includes('-dev-') || 
          window.location.hostname.includes('localhost') || 
          window.location.search.includes('debug=true')
        ) {
          var script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/npm/eruda';
          document.body.appendChild(script);
          script.onload = function () {
            if (typeof eruda !== 'undefined') {
              eruda.init({
                defaults: {
                  displaySize: 50,
                  theme: 'dark'
                }
              });
            }
          };
        }
      })();
    </script>`;
    
    code = code.replace('</body>', saferEruda + '\n  </body>');
    fs.writeFileSync('index.html', code);
    console.log('Eruda script updated to be safer');
}
