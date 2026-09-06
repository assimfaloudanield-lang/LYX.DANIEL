const fs = require('fs');

// 1. WEB APP
let webCode = fs.readFileSync('src/App.tsx', 'utf8');

// Move wrapper up (increase padding bottom)
const wrapperTarget = `<div className="relative z-30 flex flex-col items-center w-full pointer-events-auto gap-4 pb-20 sm:pb-24">`;
const wrapperReplace = `<div className="relative z-30 flex flex-col items-center w-full pointer-events-auto gap-4 pb-32 sm:pb-48">`;
if (webCode.includes(wrapperTarget)) {
    webCode = webCode.replace(wrapperTarget, wrapperReplace);
}

// Update Footer text and style
const footerTarget = `{/* FOOTER */}
        <div className="absolute bottom-4 left-0 w-full flex items-center justify-center gap-4 pointer-events-none">
          <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-sky-400/40" />
          <span className="text-[8px] tracking-[0.25em] font-light text-sky-400/80">DEVELOPED BY WRLD</span>
          <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-sky-400/40" />
        </div>`;
const footerReplace = `{/* FOOTER */}
        <div className="absolute bottom-6 left-0 w-full flex items-center justify-center pointer-events-none">
          <span className="text-[10px] tracking-[0.2em] font-thin text-[#D1D5DB] opacity-60">developed by WRLD</span>
        </div>`;

if (webCode.includes(footerTarget)) {
    webCode = webCode.replace(footerTarget, footerReplace);
} else {
    // fallback regex for footer
    const footerRegex = /\{\/\* FOOTER \*\/\}\s*<div className="absolute bottom-4[\s\S]*?<\/div>/;
    webCode = webCode.replace(footerRegex, footerReplace);
}

fs.writeFileSync('src/App.tsx', webCode);
console.log('Web updated');


// 2. ANDROID APP
let ktCode = fs.readFileSync('android/app/src/main/java/com/example/juls/ui/HomeScreen.kt', 'utf8');

const ktSpacerTarget = `Spacer(modifier = Modifier.height(48.dp))`;
const ktSpacerReplace = `Spacer(modifier = Modifier.height(100.dp))`;
if (ktCode.includes(ktSpacerTarget)) {
    ktCode = ktCode.replace(ktSpacerTarget, ktSpacerReplace);
}

const ktFooterTarget = `            // FOOTER WRLD
            Box(modifier = Modifier.fillMaxWidth().padding(bottom = 16.dp), contentAlignment = Alignment.Center) {
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.Center) {
                    Box(modifier = Modifier.height(1.dp).width(30.dp).background(Color(0xFF38BDF8).copy(alpha = 0.3f)))
                    Spacer(modifier = Modifier.width(12.dp))
                    Text(text = "DEVELOPED BY WRLD", color = Color(0xFF38BDF8).copy(alpha = 0.8f), fontSize = 7.sp, letterSpacing = 2.5.sp, fontWeight = FontWeight.Light)
                    Spacer(modifier = Modifier.width(12.dp))
                    Box(modifier = Modifier.height(1.dp).width(30.dp).background(Color(0xFF38BDF8).copy(alpha = 0.3f)))
                }
            }`;
            
const ktFooterReplace = `            // FOOTER WRLD
            Box(modifier = Modifier.fillMaxWidth().padding(bottom = 24.dp), contentAlignment = Alignment.Center) {
                Text(
                    text = "developed by WRLD",
                    color = Color.White.copy(alpha = 0.5f), // Cinza bem claro / translúcido
                    fontSize = 10.sp,
                    letterSpacing = 2.0.sp,
                    fontWeight = FontWeight.Thin
                )
            }`;

if (ktCode.includes(ktFooterTarget)) {
    ktCode = ktCode.replace(ktFooterTarget, ktFooterReplace);
}

fs.writeFileSync('android/app/src/main/java/com/example/juls/ui/HomeScreen.kt', ktCode);
console.log('Android updated');
