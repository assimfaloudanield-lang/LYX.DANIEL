const fs = require('fs');
let code = fs.readFileSync('android/app/src/main/java/com/example/juls/ui/HomeScreen.kt', 'utf8');

const targetStart = '            // PROGRESS BAR';
const targetEnd = '            Spacer(modifier = Modifier.height(100.dp))';

if (code.includes(targetStart) && code.includes(targetEnd)) {
    const startIndex = code.indexOf(targetStart);
    const endIndex = code.indexOf(targetEnd);
    
    const before = code.substring(0, startIndex);
    const middle = code.substring(startIndex, endIndex);
    const after = code.substring(endIndex);
    
    const newCode = before + '            /* ' + middle.trim() + '\n            */\n' + after;
    fs.writeFileSync('android/app/src/main/java/com/example/juls/ui/HomeScreen.kt', newCode);
    console.log("Android PB commented out");
} else {
    console.log("Could not find start/end markers");
}
