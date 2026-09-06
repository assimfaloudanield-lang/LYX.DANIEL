const fs = require('fs');
const code = fs.readFileSync('temp_home.kt', 'utf8');

const newCode = code
  // Fix spacers
  .replace('Spacer(modifier = Modifier.weight(0.4f))', 'Spacer(modifier = Modifier.weight(1f))')
  .replace('Spacer(modifier = Modifier.weight(0.25f))', 'Spacer(modifier = Modifier.weight(1.5f))')
  .replace('Spacer(modifier = Modifier.weight(2.0f))', 'Spacer(modifier = Modifier.weight(2f))')
  // Remove INSTRUCTION block
  .replace(/Spacer\(modifier = Modifier\.height\(16\.dp\)\)\s*\/\/\s*INSTRUCTION\s*Text\(\s*text = "CLIQUE NA ORBE\\nPARA FALAR",[\s\S]*?fontWeight = FontWeight\.Light\s*\)/, '')
  // Keep CHAT PANEL weight the same initially, but add one after "NOVAS FUNÇÕES"
  .replace('Spacer(modifier = Modifier.weight(0.8f))', 'Spacer(modifier = Modifier.weight(1.5f))');

// To ensure PREP BAR always shows for layout structure in the visual check (or keep it conditional if `isPreparing` is false? The user asked to "Adicionar/reposicionar a barra ... semelhante à 2a referencia". I'll keep the `isPreparing` check, but wait, the prompt says "Adicionar/reposicionar a barra 'LYX ESTÁ SE PREPARANDO 0%' na parte inferior da composição...". If the prompt implies it should always be visible in the current preview state, I can remove the `if(isPreparing)` wrapper just for layout display, but standard practice is to respect the logic. Since they provided a visual hierarchy including it, maybe I'll leave the `if(isPreparing)` but change the condition? I will leave the `if` but adjust its style so it looks exactly like reference (progress bar). Currently the progress bar in Android doesn't have an actual progress bar line, just text.

const prepBarStr = `            if (isPreparing) {
                // COMPACT PREPARATION BAR
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(16.dp))
                        .background(Color(0xFF0F172A).copy(alpha = 0.6f))
                        .border(0.5.dp, Color(0xFF6366F1).copy(alpha = 0.4f), RoundedCornerShape(16.dp))
                        .padding(horizontal = 16.dp, vertical = 12.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(modifier = Modifier.size(6.dp).clip(CircleShape).background(Color(0xFF38BDF8)))
                        Spacer(modifier = Modifier.width(10.dp))
                        Text(
                            text = "LYX ESTÁ SE PREPARANDO",
                            color = Color.White.copy(alpha = 0.9f),
                            fontSize = 9.sp,
                            letterSpacing = 1.sp,
                            fontWeight = FontWeight.Medium
                        )
                    }
                    Text(
                        text = "\${prepProgress}%",
                        color = Color.White.copy(alpha = 0.7f),
                        fontSize = 9.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
                Spacer(modifier = Modifier.height(24.dp))
            }`;

const newPrepBarStr = `            // PROGRESS BAR (Sempre presente na estrutura visual solicitada ou condicional)
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
            Spacer(modifier = Modifier.height(16.dp))`;

let codeReplaced = newCode.replace(prepBarStr, newPrepBarStr);

// To ensure we inject it back correctly to HomeScreen.kt
let originalFull = fs.readFileSync('android/app/src/main/java/com/example/juls/ui/HomeScreen.kt', 'utf8');
const startIdx = originalFull.indexOf('        Column(');
const endIdx = originalFull.lastIndexOf('}'); // End of HomeScreen
const newContent = originalFull.substring(0, startIdx) + codeReplaced + "    }\n}\n";

fs.writeFileSync('android/app/src/main/java/com/example/juls/ui/HomeScreen.kt', newContent);
console.log("Updated HomeScreen.kt layout");
