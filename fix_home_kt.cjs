const fs = require('fs');
let code = fs.readFileSync('android/app/src/main/java/com/example/juls/ui/HomeScreen.kt', 'utf8');

// Replace the bottom layout starting from Logo
const startStr = '            // BIG LOGO - increased size and centralized';
const startIdx = code.indexOf(startStr);
const endStr = '            // DEVELOPED BY WRLD';
const endIdx = code.indexOf(endStr);

const newLayout = `            // BIG LOGO - increased size and centralized
            Image(
                painter = painterResource(id = R.drawable.logotipolyx),
                contentDescription = "Logotipo LYX",
                modifier = Modifier
                    .fillMaxWidth(0.85f)
                    .height(110.dp), // reduced slightly to prevent touching
                contentScale = ContentScale.Fit
            )

            Spacer(modifier = Modifier.height(24.dp)) // Fixed distance to keep it close but not touching

            // ORB AND STATUS
            IPhonePowerButtonCompose(
                isOn = isOn,
                isListening = isListening,
                statusText = voiceStatus,
                onToggle = onTogglePower
            )
            
            Spacer(modifier = Modifier.height(24.dp))

            // CHAT PANEL - Slim, horizontal, refined glass, animated stroke
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
                
                // Conteúdo Principal (Transparente)
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(1.dp) // O espaço da borda
                        .clip(CircleShape)
                        .background(Color(0xFF0A061C).copy(alpha = 0.4f)) // Mais transparente
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
                                .border(0.5.dp, Color(0xFF818CF8).copy(alpha = 0.3f), CircleShape)
                                .background(Color.White.copy(alpha = 0.05f)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Outlined.ChatBubbleOutline,
                                contentDescription = "Chat",
                                tint = Color.White.copy(alpha = 0.8f),
                                modifier = Modifier.size(14.dp)
                            )
                        }
                        Spacer(modifier = Modifier.width(12.dp))
                        Column(verticalArrangement = Arrangement.Center) {
                            Text(
                                text = "Não pode falar agora?",
                                color = Color.White.copy(alpha = 0.7f),
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
                        tint = Color.White.copy(alpha = 0.4f),
                        modifier = Modifier.size(14.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            // NOVAS FUNÇÕES CARD (CADEADO SOBRESSAINDO)
            Box(
                modifier = Modifier
                    .fillMaxWidth(0.75f)
                    .padding(top = 14.dp), // Espaço para o cadeado
                contentAlignment = Alignment.TopCenter
            ) {
                // Card Glass
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(20.dp))
                        .background(Color(0xFF0A061C).copy(alpha = 0.3f))
                        .border(0.5.dp, Color(0xFF818CF8).copy(alpha = 0.2f), RoundedCornerShape(20.dp))
                        .padding(top = 20.dp, bottom = 12.dp, start = 16.dp, end = 16.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
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
                    }
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "Integração visual e novos módulos de produtividade estarão disponíveis em breve.",
                        color = Color.White.copy(alpha = 0.4f),
                        fontSize = 9.sp,
                        textAlign = androidx.compose.ui.text.style.TextAlign.Center,
                        lineHeight = 12.sp
                    )
                }
                
                // Cadeado (Sobressaindo)
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
                }
            }

            Spacer(modifier = Modifier.weight(1f)) // Push progress bar to bottom

            // PROGRESS BAR
            Column(
                modifier = Modifier
                    .fillMaxWidth(0.75f)
                    .clip(RoundedCornerShape(16.dp))
                    .background(Color(0xFF0A061C).copy(alpha = 0.2f))
                    .border(0.5.dp, Color.White.copy(alpha = 0.1f), RoundedCornerShape(16.dp))
                    .padding(14.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "LYX ESTÁ SE PREPARANDO",
                        color = Color.White.copy(alpha = 0.6f),
                        fontSize = 9.sp,
                        fontWeight = FontWeight.SemiBold,
                        letterSpacing = 1.sp
                    )
                    Text(
                        text = "0%",
                        color = Color(0xFF38BDF8),
                        fontSize = 9.sp,
                        fontFamily = androidx.compose.ui.text.font.FontFamily.Monospace
                    )
                }
                Spacer(modifier = Modifier.height(10.dp))
                // Track
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(4.dp)
                        .clip(CircleShape)
                        .background(Color.White.copy(alpha = 0.1f))
                ) {
                    // Fill (0%)
                    Box(
                        modifier = Modifier
                            .fillMaxHeight()
                            .fillMaxWidth(0f)
                            .clip(CircleShape)
                            .background(Color(0xFF38BDF8))
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

`;

code = code.substring(0, startIdx) + newLayout + code.substring(endIdx);
fs.writeFileSync('android/app/src/main/java/com/example/juls/ui/HomeScreen.kt', code);
console.log('Android layout updated');
