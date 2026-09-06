const fs = require('fs');
let code = fs.readFileSync('android/app/src/main/java/com/example/juls/ui/HomeScreen.kt', 'utf8');

const targetFunctionStart = code.indexOf('fun HomeScreen(');
const returnStart = code.indexOf('    Box(', targetFunctionStart);
const returnEnd = code.lastIndexOf('}'); // we will just slice up to the end of HomeScreen if possible.

// Let's do a targeted replace for the Box content
