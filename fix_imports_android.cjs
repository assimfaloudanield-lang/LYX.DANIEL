const fs = require('fs');
let code = fs.readFileSync('android/app/src/main/java/com/example/juls/ui/HomeScreen.kt', 'utf8');

if (!code.includes('import androidx.compose.ui.draw.drawWithCache')) {
  code = code.replace('import androidx.compose.ui.draw.clip', 'import androidx.compose.ui.draw.clip\nimport androidx.compose.ui.draw.drawWithCache');
}
if (!code.includes('import androidx.compose.ui.graphics.drawscope.rotate')) {
  code = code.replace('import androidx.compose.ui.graphics.Color', 'import androidx.compose.ui.graphics.Color\nimport androidx.compose.ui.graphics.drawscope.rotate');
}

fs.writeFileSync('android/app/src/main/java/com/example/juls/ui/HomeScreen.kt', code);
console.log('Imports added');
