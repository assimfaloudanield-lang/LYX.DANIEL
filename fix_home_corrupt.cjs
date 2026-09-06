const fs = require('fs');
let lines = fs.readFileSync('android/app/src/main/java/com/example/juls/ui/HomeScreen.kt', 'utf8').split('\n');

const duplicateIndex = lines.findIndex((line, idx) => idx > 0 && line.includes('package com.example.juls.ui'));

if (duplicateIndex !== -1) {
    // Keep lines up to the duplicate
    let cleanLines = lines.slice(0, duplicateIndex);
    
    // Add the footer and closing braces
    cleanLines.push(`            // FOOTER WRLD`);
    cleanLines.push(`            Box(modifier = Modifier.fillMaxWidth().padding(bottom = 16.dp), contentAlignment = Alignment.Center) {`);
    cleanLines.push(`                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.Center) {`);
    cleanLines.push(`                    Box(modifier = Modifier.height(1.dp).width(30.dp).background(Color(0xFF38BDF8).copy(alpha = 0.3f)))`);
    cleanLines.push(`                    Spacer(modifier = Modifier.width(12.dp))`);
    cleanLines.push(`                    Text(text = "DEVELOPED BY WRLD", color = Color(0xFF38BDF8).copy(alpha = 0.8f), fontSize = 7.sp, letterSpacing = 2.5.sp, fontWeight = FontWeight.Light)`);
    cleanLines.push(`                    Spacer(modifier = Modifier.width(12.dp))`);
    cleanLines.push(`                    Box(modifier = Modifier.height(1.dp).width(30.dp).background(Color(0xFF38BDF8).copy(alpha = 0.3f)))`);
    cleanLines.push(`                }`);
    cleanLines.push(`            }`);
    cleanLines.push(`        }`);
    cleanLines.push(`    }`);
    cleanLines.push(`}`);

    fs.writeFileSync('android/app/src/main/java/com/example/juls/ui/HomeScreen.kt', cleanLines.join('\n'));
    console.log('Android file cleaned up and footer added');
} else {
    console.log('No duplicate found');
}
