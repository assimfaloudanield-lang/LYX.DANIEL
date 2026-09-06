const fs = require('fs');
let code = fs.readFileSync('android/app/src/main/java/com/example/juls/ui/HomeScreen.kt', 'utf8');

if (!code.includes('import androidx.compose.material.icons.outlined.Lock')) {
  code = code.replace(
    'import androidx.compose.material.icons.outlined.AutoAwesome',
    'import androidx.compose.material.icons.outlined.AutoAwesome\nimport androidx.compose.material.icons.outlined.Lock'
  );
  fs.writeFileSync('android/app/src/main/java/com/example/juls/ui/HomeScreen.kt', code);
  console.log('Added Lock import');
}
