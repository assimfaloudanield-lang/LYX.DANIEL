const fs = require('fs');
let code = fs.readFileSync('android/app/src/main/java/com/example/juls/ui/HomeScreen.kt', 'utf8');

// 1. Swap background (EDA55B6A base, Galaxy overlay)
const oldBgBlock = `        // Background Image (Galaxia)
        Image(
            painter = painterResource(id = R.drawable.backgroundlyx),
            contentDescription = "Background",
            modifier = Modifier.fillMaxSize(),
            contentScale = ContentScale.Crop,
            alpha = 0.85f
        )
        // Nova imagem adicionada (50% opacidade) abaixo do overlay
        Image(
            painter = painterResource(id = R.drawable.eda55b6a_2d3e),
            contentDescription = "Custom Background",
            modifier = Modifier.fillMaxSize(),
            contentScale = ContentScale.Crop,
            alpha = 0.5f
        )`;

const newBgBlock = `        // Nova imagem (Base)
        Image(
            painter = painterResource(id = R.drawable.eda55b6a_2d3e),
            contentDescription = "Custom Background",
            modifier = Modifier.fillMaxSize(),
            contentScale = ContentScale.Crop,
            alpha = 0.8f
        )
        // Background Image (Galaxia) - Overlay
        Image(
            painter = painterResource(id = R.drawable.backgroundlyx),
            contentDescription = "Background",
            modifier = Modifier.fillMaxSize(),
            contentScale = ContentScale.Crop,
            alpha = 0.5f
        )
        // Escurecimento
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(Color(0xFF010006).copy(alpha = 0.6f))
        )`;

if (code.includes(oldBgBlock)) {
    code = code.replace(oldBgBlock, newBgBlock);
}

// 2. Change Lock Icon to Gold + Blue
const oldLockBlock = `                // Cadeado (Sobressaindo)
                Box(
                    modifier = Modifier
                        .offset(y = (-14).dp)
                        .size(28.dp)
                        .clip(CircleShape)
                        .background(
                            Brush.verticalGradient(
                                colors = listOf(Color(0xFF1E293B), Color.Black)
                            )
                        )
                        .border(0.5.dp, Color(0xFF818CF8).copy(alpha = 0.4f), CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Outlined.Lock,
                        contentDescription = "Lock",
                        tint = Color.White.copy(alpha = 0.7f),
                        modifier = Modifier.size(12.dp)
                    )
                }`;

const newLockBlock = `                // Cadeado (Sobressaindo - Gold/Blue)
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

if (code.includes(oldLockBlock)) {
    code = code.replace(oldLockBlock, newLockBlock);
}

// 3. Shift CTA and Novas Funcoes up
// Increase bottom spacer from 16.dp to 48.dp
const oldBottomSpacer = `Spacer(modifier = Modifier.height(16.dp))`;
const newBottomSpacer = `Spacer(modifier = Modifier.height(48.dp))`;

if (code.includes(oldBottomSpacer)) {
    code = code.replace(oldBottomSpacer, newBottomSpacer);
}

fs.writeFileSync('android/app/src/main/java/com/example/juls/ui/HomeScreen.kt', code);
console.log('HomeScreen.kt visual changes applied');
