            contentScale = ContentScale.Crop,
            alpha = 0.85f
        )

        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(top = 48.dp, bottom = 24.dp, start = 24.dp, end = 24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // TOP BAR
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Settings Button (Thin stroke, small, subtle glass)
                Box(
                    modifier = Modifier
                        .size(42.dp)
                        .clip(CircleShape)
                        .background(Color.White.copy(alpha = 0.03f))
                        .border(0.5.dp, Color(0xFF6366F1).copy(alpha = 0.3f), CircleShape)
                        .clickable { onNavigateToSettings() },
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Outlined.Settings,
                        contentDescription = "Settings",
                        tint = Color.White.copy(alpha = 0.9f),
                        modifier = Modifier.size(20.dp)
                    )
                }

                // Profile Chip (Thin stroke, elegant, no big card)
                Row(
                    modifier = Modifier
                        .clip(RoundedCornerShape(50))
                        .background(Color.White.copy(alpha = 0.03f))
                        .border(0.5.dp, Color(0xFF6366F1).copy(alpha = 0.3f), RoundedCornerShape(50))
                        .clickable { onNavigateToProfile() }
                        .padding(horizontal = 12.dp, vertical = 6.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .size(28.dp)
                            .clip(CircleShape)
                            .border(0.5.dp, Color(0xFF38BDF8).copy(alpha = 0.6f), CircleShape),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Outlined.Person,
                            contentDescription = "Profile",
                            tint = Color(0xFF38BDF8),
                            modifier = Modifier.size(16.dp)
                        )
                    }
                    Spacer(modifier = Modifier.width(10.dp))
                    Column(verticalArrangement = Arrangement.Center) {
                        Text(
                            text = "Olá, Daniel",
                            color = Color.White,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Medium,
                            letterSpacing = 0.2.sp
                        )
                        Text(
                            text = "Bom te ver aqui.",
                            color = Color.White.copy(alpha = 0.5f),
                            fontSize = 9.sp,
                            letterSpacing = 0.1.sp
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.weight(0.4f))

            // BIG LOGO - increased size and centralized
            Image(
                painter = painterResource(id = R.drawable.logotipolyx),
                contentDescription = "Logotipo LYX",
                modifier = Modifier
                    .fillMaxWidth(0.85f)
                    .height(130.dp),
                contentScale = ContentScale.Fit
            )

            Spacer(modifier = Modifier.weight(0.25f))

            // ORB AND STATUS
            IPhonePowerButtonCompose(
                isOn = isOn,
                isListening = isListening,
                statusText = voiceStatus,
                onToggle = onTogglePower
            )

            Spacer(modifier = Modifier.height(16.dp))

            // INSTRUCTION
            Text(
                text = "CLIQUE NA ORBE\nPARA FALAR",
                color = Color.White.copy(alpha = 0.5f),
                fontSize = 10.sp,
                letterSpacing = 2.sp,
                textAlign = TextAlign.Center,
                lineHeight = 16.sp,
                fontWeight = FontWeight.Light
            )

            Spacer(modifier = Modifier.weight(2.0f))

            // CHAT PANEL - Horizontal, refined glass
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(24.dp))
                    .background(
                        Brush.horizontalGradient(
                            colors = listOf(
                                Color(0xFF1E1B4B).copy(alpha = 0.4f),
                                Color(0xFF312E81).copy(alpha = 0.2f)
                            )
                        )
                    )
                    .border(
                        width = 0.5.dp, // EXTREMELY THIN STROKE
                        brush = Brush.horizontalGradient(
                            colors = listOf(
                                Color(0xFF818CF8).copy(alpha = 0.4f),
                                Color(0xFF38BDF8).copy(alpha = 0.1f)
                            )
                        ),
                        shape = RoundedCornerShape(24.dp)
                    )
                    .clickable { onNavigateToChat() }
                    .padding(horizontal = 20.dp, vertical = 20.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    // Chat Icon
                    Box(
                        modifier = Modifier
                            .size(38.dp)
                            .clip(CircleShape)
                            .border(0.5.dp, Color(0xFF818CF8).copy(alpha = 0.3f), CircleShape)
                            .background(Color.White.copy(alpha = 0.05f)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Outlined.ChatBubbleOutline,
                            contentDescription = "Chat",
                            tint = Color.White.copy(alpha = 0.8f),
                            modifier = Modifier.size(16.dp)
                        )
                    }
                    Spacer(modifier = Modifier.width(16.dp))
                    Column {
                        Text(
                            text = "Não pode falar agora?",
                            color = Color.White.copy(alpha = 0.6f),
                            fontSize = 11.sp,
                            letterSpacing = 0.3.sp
                        )
                        Spacer(modifier = Modifier.height(2.dp))
                        Text(
                            text = "Digite.",
                            color = Color(0xFFA5B4FC), // Lavender
                            fontSize = 18.sp,
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
                    modifier = Modifier.size(18.dp)
                )
            }

            Spacer(modifier = Modifier.height(28.dp))

            // NOVAS FUNÇÕES
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.Center
            ) {
                Icon(
                    imageVector = Icons.Outlined.AutoAwesome, // Sparkle icon
                    contentDescription = null,
                    tint = Color(0xFF38BDF8),
                    modifier = Modifier.size(14.dp)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "NOVAS FUNÇÕES",
                    color = Color.White.copy(alpha = 0.7f),
                    fontSize = 9.sp,
                    letterSpacing = 1.5.sp
                )
                Spacer(modifier = Modifier.width(12.dp))
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(50))
                        .background(Color.White.copy(alpha = 0.05f))
                        .border(0.5.dp, Color.White.copy(alpha = 0.15f), RoundedCornerShape(50))
                        .padding(horizontal = 8.dp, vertical = 4.dp)
                ) {
                    Text(
                        text = "EM BREVE",
                        color = Color.White.copy(alpha = 0.5f),
                        fontSize = 7.sp,
                        letterSpacing = 1.sp
                    )
                }
            }

            Spacer(modifier = Modifier.weight(0.8f))

            if (isPreparing) {
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
                        text = "${prepProgress}%",
                        color = Color.White.copy(alpha = 0.7f),
                        fontSize = 9.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
                Spacer(modifier = Modifier.height(24.dp))
            }

            // FOOTER WRLD
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.Center,
                modifier = Modifier.fillMaxWidth()
            ) {
                Box(modifier = Modifier.height(1.dp).width(30.dp).background(Color(0xFF38BDF8).copy(alpha = 0.3f)))
                Spacer(modifier = Modifier.width(12.dp))
                Text(
                    text = "DEVELOPED BY WRLD",
                    color = Color(0xFF38BDF8),
                    fontSize = 7.sp,
                    letterSpacing = 2.5.sp,
                    fontWeight = FontWeight.Medium
                )
                Spacer(modifier = Modifier.width(12.dp))
                Box(modifier = Modifier.height(1.dp).width(30.dp).background(Color(0xFF38BDF8).copy(alpha = 0.3f)))
            }
        }
    }
}
