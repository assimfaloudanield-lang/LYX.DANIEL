const fs = require('fs');

// 1. WEB APP
let webCode = fs.readFileSync('src/App.tsx', 'utf8');

const webTarget = `<Star size={11} className="text-sky-400 outline-none" strokeWidth={1.5} />
                <span className="text-[10px] tracking-[0.15em] text-white/80 font-medium">NOVAS FUNÇÕES</span>
                <Star size={11} className="text-sky-400 outline-none" strokeWidth={1.5} />`;

const webReplace = `<svg width="0" height="0" className="absolute">
                  <defs>
                    <linearGradient id="star-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#5CE1FF" />
                      <stop offset="100%" stopColor="#7B5CFF" />
                    </linearGradient>
                  </defs>
                </svg>
                <Star size={11} style={{ stroke: 'url(#star-grad)' }} className="outline-none text-transparent" strokeWidth={1.5} />
                <span className="text-[10px] tracking-[0.15em] text-white/80 font-medium">NOVAS FUNÇÕES</span>
                <Star size={11} style={{ stroke: 'url(#star-grad)' }} className="outline-none text-transparent" strokeWidth={1.5} />`;

if (webCode.includes(webTarget)) {
    webCode = webCode.replace(webTarget, webReplace);
    fs.writeFileSync('src/App.tsx', webCode);
    console.log('Web stars gradient applied');
} else {
    console.log('Web stars not found');
}

// 2. ANDROID APP
let ktCode = fs.readFileSync('android/app/src/main/java/com/example/juls/ui/HomeScreen.kt', 'utf8');

const ktTarget = `                    Row(verticalAlignment = Alignment.CenterVertically) {
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

const ktReplace = `                    Row(verticalAlignment = Alignment.CenterVertically) {
                        val brush = Brush.linearGradient(
                            colors = listOf(Color(0xFF5CE1FF), Color(0xFF7B5CFF))
                        )
                        Icon(
                            imageVector = Icons.Outlined.AutoAwesome, // Sparkle
                            contentDescription = null,
                            tint = Color.Unspecified, // usar drawWithCache
                            modifier = Modifier
                                .size(12.dp)
                                .drawWithCache {
                                    onDrawWithContent {
                                        drawContent()
                                        drawRect(brush, blendMode = androidx.compose.ui.graphics.BlendMode.SrcIn)
                                    }
                                }
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
                            tint = Color.Unspecified,
                            modifier = Modifier
                                .size(12.dp)
                                .drawWithCache {
                                    onDrawWithContent {
                                        drawContent()
                                        drawRect(brush, blendMode = androidx.compose.ui.graphics.BlendMode.SrcIn)
                                    }
                                }
                        )
                    }`;

if (ktCode.includes(ktTarget)) {
    ktCode = ktCode.replace(ktTarget, ktReplace);
    fs.writeFileSync('android/app/src/main/java/com/example/juls/ui/HomeScreen.kt', ktCode);
    console.log('Android stars gradient applied');
} else {
    console.log('Android stars not found');
}
