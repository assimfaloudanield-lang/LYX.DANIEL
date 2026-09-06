const fs = require('fs');

// 1. WEB
let webCode = fs.readFileSync('src/App.tsx', 'utf8');

const oldWebStr = `<div className="flex items-center gap-1.5 relative z-10 mb-1">
                <Star size={11} className="text-sky-400 outline-none" strokeWidth={1.5} />
                <span className="text-[10px] tracking-[0.15em] text-white/80 font-medium">NOVAS FUNÇÕES</span>
             </div>`;

const newWebStr = `<div className="flex items-center gap-1.5 relative z-10 mb-1">
                <Star size={11} className="text-sky-400 outline-none" strokeWidth={1.5} />
                <span className="text-[10px] tracking-[0.15em] text-white/80 font-medium">NOVAS FUNÇÕES</span>
                <Star size={11} className="text-sky-400 outline-none" strokeWidth={1.5} />
             </div>`;

if (webCode.includes(oldWebStr)) {
    webCode = webCode.replace(oldWebStr, newWebStr);
    fs.writeFileSync('src/App.tsx', webCode);
    console.log('Web stars updated');
} else {
    console.log('Web stars string not found');
}

// 2. ANDROID
let ktCode = fs.readFileSync('android/app/src/main/java/com/example/juls/ui/HomeScreen.kt', 'utf8');

const oldKtStr = `                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Outlined.AutoAwesome, // Sparkle
                            contentDescription = null,
                            tint = Color(0xFF38BDF8),
                            modifier = Modifier.size(12.dp)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = "NOVAS FUNÇÕES",
                            color = Color.White.copy(alpha = 0.8f),
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Medium,
                            letterSpacing = 1.5.sp
                        )
                    }`;

const newKtStr = `                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Outlined.AutoAwesome, // Sparkle
                            contentDescription = null,
                            tint = Color(0xFF38BDF8),
                            modifier = Modifier.size(12.dp)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = "NOVAS FUNÇÕES",
                            color = Color.White.copy(alpha = 0.8f),
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Medium,
                            letterSpacing = 1.5.sp
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Icon(
                            imageVector = Icons.Outlined.AutoAwesome, // Sparkle
                            contentDescription = null,
                            tint = Color(0xFF38BDF8),
                            modifier = Modifier.size(12.dp)
                        )
                    }`;

if (ktCode.includes(oldKtStr)) {
    ktCode = ktCode.replace(oldKtStr, newKtStr);
    fs.writeFileSync('android/app/src/main/java/com/example/juls/ui/HomeScreen.kt', ktCode);
    console.log('Android stars updated');
} else {
    console.log('Android stars string not found');
}
