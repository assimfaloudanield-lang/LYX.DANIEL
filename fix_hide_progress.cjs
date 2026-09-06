const fs = require('fs');

// 1. WEB APP
let webCode = fs.readFileSync('src/App.tsx', 'utf8');

const webProgressTarget = `{/* PROGRESS BAR */}
        <div className="w-full max-w-[280px] mt-2 mb-2 p-3.5 rounded-[16px] bg-[#0A061C]/20 border-[0.5px] border-white/10 backdrop-blur-md flex flex-col gap-2.5">
          <div className="flex items-center justify-between w-full">
            <span className="text-[9px] font-semibold tracking-widest text-white/60">LYX ESTÁ SE PREPARANDO</span>
            <span className="text-[9px] font-mono text-sky-400">0%</span>
          </div>
          <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
             <div className="h-full bg-sky-400 w-0 rounded-full shadow-[0_0_10px_#38BDF8]" />
          </div>
        </div>`;

const webProgressReplace = `{/* PROGRESS BAR (GUARDADO - Botão/Barra de Download desativada a pedido)
        <div className="w-full max-w-[280px] mt-2 mb-2 p-3.5 rounded-[16px] bg-[#0A061C]/20 border-[0.5px] border-white/10 backdrop-blur-md flex flex-col gap-2.5">
          <div className="flex items-center justify-between w-full">
            <span className="text-[9px] font-semibold tracking-widest text-white/60">LYX ESTÁ SE PREPARANDO</span>
            <span className="text-[9px] font-mono text-sky-400">0%</span>
          </div>
          <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
             <div className="h-full bg-sky-400 w-0 rounded-full shadow-[0_0_10px_#38BDF8]" />
          </div>
        </div>
        */}`;

if (webCode.includes(webProgressTarget)) {
    webCode = webCode.replace(webProgressTarget, webProgressReplace);
    fs.writeFileSync('src/App.tsx', webCode);
    console.log('Web progress bar hidden');
} else {
    console.log('Web progress bar not found exactly');
}

// 2. ANDROID APP
let ktCode = fs.readFileSync('android/app/src/main/java/com/example/juls/ui/HomeScreen.kt', 'utf8');

const ktProgressTarget = `            // PROGRESS BAR (Sempre presente na estrutura visual solicitada ou condicional)
            Column(
                modifier = Modifier
                    .fillMaxWidth(0.9f)
                    .clip(RoundedCornerShape(16.dp))
                    .background(Color.White.copy(alpha = 0.02f))
                    .border(0.5.dp, Color.White.copy(alpha = 0.1f), RoundedCornerShape(16.dp))
                    .padding(16.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "LYX ESTÁ SE PREPARANDO",
                        color = Color.White.copy(alpha = 0.6f),
                        fontSize = 10.sp,
                        letterSpacing = 1.5.sp,
                        fontWeight = FontWeight.SemiBold
                    )
                    Text(
                        text = "\${prepProgress}%",
                        color = Color(0xFF38BDF8),
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
                Spacer(modifier = Modifier.height(12.dp))
                // Barra de progresso
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(4.dp)
                        .clip(RoundedCornerShape(50))
                        .background(Color.White.copy(alpha = 0.1f))
                ) {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth(if (prepProgress > 0) prepProgress / 100f else 0.0f)
                            .height(4.dp)
                            .clip(RoundedCornerShape(50))
                            .background(Color(0xFF38BDF8))
                    )
                }
            }`;

const ktProgressReplace = `            /* PROGRESS BAR (GUARDADO - Botão/Barra de Download desativada a pedido)
            Column(
                modifier = Modifier
                    .fillMaxWidth(0.9f)
                    .clip(RoundedCornerShape(16.dp))
                    .background(Color.White.copy(alpha = 0.02f))
                    .border(0.5.dp, Color.White.copy(alpha = 0.1f), RoundedCornerShape(16.dp))
                    .padding(16.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "LYX ESTÁ SE PREPARANDO",
                        color = Color.White.copy(alpha = 0.6f),
                        fontSize = 10.sp,
                        letterSpacing = 1.5.sp,
                        fontWeight = FontWeight.SemiBold
                    )
                    Text(
                        text = "\${prepProgress}%",
                        color = Color(0xFF38BDF8),
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
                Spacer(modifier = Modifier.height(12.dp))
                // Barra de progresso
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(4.dp)
                        .clip(RoundedCornerShape(50))
                        .background(Color.White.copy(alpha = 0.1f))
                ) {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth(if (prepProgress > 0) prepProgress / 100f else 0.0f)
                            .height(4.dp)
                            .clip(RoundedCornerShape(50))
                            .background(Color(0xFF38BDF8))
                    )
                }
            }
            */`;

if (ktCode.includes(ktProgressTarget)) {
    ktCode = ktCode.replace(ktProgressTarget, ktProgressReplace);
    fs.writeFileSync('android/app/src/main/java/com/example/juls/ui/HomeScreen.kt', ktCode);
    console.log('Android progress bar hidden');
} else {
    console.log('Android progress bar not found exactly');
}
