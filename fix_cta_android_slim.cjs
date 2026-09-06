const fs = require('fs');
let code = fs.readFileSync('android/app/src/main/java/com/example/juls/ui/HomeScreen.kt', 'utf8');

const ctaOld = `            // CHAT PANEL - Horizontal, refined glass, animated stroke
            val infiniteTransitionCta = rememberInfiniteTransition(label = "ctaStroke")
            val angle by infiniteTransitionCta.animateFloat(
                initialValue = 0f,
                targetValue = 360f,
                animationSpec = infiniteRepeatable(
                    animation = tween(4000, easing = LinearEasing),
                    repeatMode = RepeatMode.Restart
                ),
                label = "angle"
            )

            Box(
                modifier = Modifier
                    .fillMaxWidth(0.9f) // Menor
                    .clip(RoundedCornerShape(22.dp))
                    .clickable(
                        interactionSource = remember { MutableInteractionSource() },
                        indication = null, // Sem ripple padrão grosso
                        onClick = { onNavigateToChat() }
                    )
            ) {
                // Fundo animado giratório (Stroke Caminhante)
                Box(
                    modifier = Modifier
                        .matchParentSize()
                        .drawWithCache {
                            onDrawBehind {
                                rotate(angle) {
                                    drawCircle(
                                        brush = Brush.sweepGradient(
                                            colors = listOf(
                                                Color.Transparent,
                                                Color(0xFF38BDF8).copy(alpha = 0.8f),
                                                Color(0xFFA855F7).copy(alpha = 0.8f),
                                                Color.Transparent
                                            ),
                                            center = center
                                        ),
                                        radius = size.width
                                    )
                                }
                            }
                        }
                )
                
                // Conteúdo Principal
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(1.dp) // O espaço da borda
                        .clip(RoundedCornerShape(21.dp))
                        .background(Color(0xFF0A061C).copy(alpha = 0.9f))
                        .padding(horizontal = 16.dp, vertical = 16.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        // Chat Icon
                        Box(
                            modifier = Modifier
                                .size(34.dp)
                                .clip(CircleShape)
                                .border(0.5.dp, Color(0xFF818CF8).copy(alpha = 0.2f), CircleShape)
                                .background(Color.White.copy(alpha = 0.02f)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Outlined.ChatBubbleOutline,
                                contentDescription = "Chat",
                                tint = Color.White.copy(alpha = 0.7f),
                                modifier = Modifier.size(15.dp)
                            )
                        }
                        Spacer(modifier = Modifier.width(16.dp))
                        Column {
                            Text(
                                text = "Não pode falar agora?",
                                color = Color.White.copy(alpha = 0.5f),
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Light,
                                letterSpacing = 0.3.sp
                            )
                            Text(
                                text = "Digite.",
                                color = Color(0xFFA5B4FC), // Lavender
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Normal,
                                letterSpacing = 0.5.sp
                            )
                        }
                    }
                    // Arrow
                    Icon(
                        imageVector = Icons.Outlined.ArrowForward,
                        contentDescription = "Ir",
                        tint = Color.White.copy(alpha = 0.3f),
                        modifier = Modifier.size(16.dp)
                    )
                }
            }`;

const ctaNew = `            // CHAT PANEL - Slim, horizontal, refined glass, animated stroke
            val infiniteTransitionCta = rememberInfiniteTransition(label = "ctaStroke")
            val angle by infiniteTransitionCta.animateFloat(
                initialValue = 0f,
                targetValue = 360f,
                animationSpec = infiniteRepeatable(
                    animation = tween(4000, easing = LinearEasing),
                    repeatMode = RepeatMode.Restart
                ),
                label = "angle"
            )

            Box(
                modifier = Modifier
                    .fillMaxWidth(0.75f) // Bem menor na largura
                    .clip(CircleShape)
                    .clickable(
                        interactionSource = remember { MutableInteractionSource() },
                        indication = null, // Sem ripple padrão grosso
                        onClick = { onNavigateToChat() }
                    )
            ) {
                // Fundo animado giratório (Stroke Caminhante)
                Box(
                    modifier = Modifier
                        .matchParentSize()
                        .drawWithCache {
                            onDrawBehind {
                                rotate(angle) {
                                    drawCircle(
                                        brush = Brush.sweepGradient(
                                            colors = listOf(
                                                Color.Transparent,
                                                Color(0xFF38BDF8).copy(alpha = 0.8f),
                                                Color(0xFFA855F7).copy(alpha = 0.8f),
                                                Color.Transparent
                                            ),
                                            center = center
                                        ),
                                        radius = size.width
                                    )
                                }
                            }
                        }
                )
                
                // Conteúdo Principal
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(1.dp) // O espaço da borda
                        .clip(CircleShape)
                        .background(Color(0xFF0A061C).copy(alpha = 0.9f))
                        .padding(horizontal = 20.dp, vertical = 10.dp), // Menos espesso (fino)
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        // Chat Icon
                        Box(
                            modifier = Modifier
                                .size(30.dp)
                                .clip(CircleShape)
                                .border(0.5.dp, Color(0xFF818CF8).copy(alpha = 0.2f), CircleShape)
                                .background(Color.White.copy(alpha = 0.02f)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Outlined.ChatBubbleOutline,
                                contentDescription = "Chat",
                                tint = Color.White.copy(alpha = 0.7f),
                                modifier = Modifier.size(14.dp)
                            )
                        }
                        Spacer(modifier = Modifier.width(12.dp))
                        Column(verticalArrangement = Arrangement.Center) {
                            Text(
                                text = "Não pode falar agora?",
                                color = Color.White.copy(alpha = 0.5f),
                                fontSize = 9.sp,
                                fontWeight = FontWeight.Light,
                                letterSpacing = 0.2.sp
                            )
                            Text(
                                text = "Digite.",
                                color = Color(0xFFA5B4FC), // Lavender
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Normal,
                                letterSpacing = 0.5.sp
                            )
                        }
                    }
                    // Arrow
                    Icon(
                        imageVector = Icons.Outlined.ArrowForward,
                        contentDescription = "Ir",
                        tint = Color.White.copy(alpha = 0.3f),
                        modifier = Modifier.size(14.dp)
                    )
                }
            }`;

if (code.includes(ctaOld)) {
  code = code.replace(ctaOld, ctaNew);
  fs.writeFileSync('android/app/src/main/java/com/example/juls/ui/HomeScreen.kt', code);
  console.log('Android CTA Updated to Slim');
} else {
  console.log('Could not find the exact old CTA string in Android');
}
