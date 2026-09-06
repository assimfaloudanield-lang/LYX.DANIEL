const fs = require('fs');

// 1. WEB
let webCode = fs.readFileSync('src/App.tsx', 'utf8');

const oldWebStr = `<div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10 w-7 h-7 rounded-full bg-gradient-to-b from-[#B48529]/20 to-[#785311]/60 border-[1px] border-[#D4AF37]/50 backdrop-blur-md flex items-center justify-center shadow-[0_0_12px_rgba(212,175,55,0.3)]">
             <Lock size={12} className="text-sky-400 outline-none" strokeWidth={2.5} />
          </div>`;

const newWebStr = `<div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10 w-7 h-7 rounded-full bg-gradient-to-br from-[#38BDF8]/40 to-[#A855F7]/60 border-[1px] border-[#D4AF37]/60 backdrop-blur-md flex items-center justify-center shadow-[0_0_12px_rgba(212,175,55,0.3)]">
             <Lock size={12} className="text-white outline-none" strokeWidth={2} />
          </div>`;

if (webCode.includes(oldWebStr)) {
    webCode = webCode.replace(oldWebStr, newWebStr);
    fs.writeFileSync('src/App.tsx', webCode);
    console.log('Web lock updated');
} else {
    console.log('Web lock string not found, trying regex...');
    // Fallback regex
    const regex = /<div className="absolute -top-3\.5 left-1\/2 -translate-x-1\/2 z-10 w-7 h-7 rounded-full[^>]+>[\s\S]*?<Lock[^>]+>[\s\S]*?<\/div>/;
    webCode = webCode.replace(regex, newWebStr);
    fs.writeFileSync('src/App.tsx', webCode);
    console.log('Web lock updated via regex');
}

// 2. ANDROID
let ktCode = fs.readFileSync('android/app/src/main/java/com/example/juls/ui/HomeScreen.kt', 'utf8');

const oldKtStr = `                // Cadeado (Sobressaindo - Gold/Blue)
                Box(
                    modifier = Modifier
                        .offset(y = (-14).dp)
                        .size(28.dp)
                        .clip(CircleShape)
                        .background(
                            Brush.verticalGradient(
                                colors = listOf(Color(0xFFB48529).copy(alpha = 0.3f), Color(0xFF785311).copy(alpha = 0.8f))
                            )
                        )
                        .border(1.dp, Color(0xFFD4AF37).copy(alpha = 0.6f), CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Outlined.Lock,
                        contentDescription = "Lock",
                        tint = Color(0xFF38BDF8), // Blue
                        modifier = Modifier.size(12.dp)
                    )
                }`;

const newKtStr = `                // Cadeado (Sobressaindo - Dourado com fundo Azul/Roxo)
                Box(
                    modifier = Modifier
                        .offset(y = (-14).dp)
                        .size(28.dp)
                        .clip(CircleShape)
                        .background(
                            Brush.verticalGradient(
                                colors = listOf(Color(0xFF38BDF8).copy(alpha = 0.4f), Color(0xFFA855F7).copy(alpha = 0.7f))
                            )
                        )
                        .border(1.dp, Color(0xFFD4AF37).copy(alpha = 0.6f), CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Outlined.Lock,
                        contentDescription = "Lock",
                        tint = Color.White,
                        modifier = Modifier.size(12.dp)
                    )
                }`;

if (ktCode.includes(oldKtStr)) {
    ktCode = ktCode.replace(oldKtStr, newKtStr);
    fs.writeFileSync('android/app/src/main/java/com/example/juls/ui/HomeScreen.kt', ktCode);
    console.log('Android lock updated');
} else {
    console.log('Android lock string not found');
}
