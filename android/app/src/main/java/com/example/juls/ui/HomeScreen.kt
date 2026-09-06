package com.example.juls.ui

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.drawWithCache
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.rotate
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.animation.core.*
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.juls.R

@Composable
fun HomeScreen(
    isOn: Boolean,
    isListening: Boolean,
    voiceStatus: String?,
    onTogglePower: () -> Unit,
    onNavigateToChat: () -> Unit,
    onNavigateToProfile: () -> Unit,
    onNavigateToSettings: () -> Unit,
    isPreparing: Boolean = false,
    prepProgress: Int = 0
) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF02000A))
    ) {
        // Nova imagem (Base)
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

            Spacer(modifier = Modifier.weight(1f))

            // BIG LOGO - increased size and centralized
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
                
                // Cadeado (Sobressaindo - Dourado com fundo Azul/Roxo)
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
                }
            }

            Spacer(modifier = Modifier.weight(1f)) // Push progress bar to bottom

            /* // PROGRESS BAR
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
            */
            Spacer(modifier = Modifier.height(100.dp))

            // FOOTER WRLD
            Box(modifier = Modifier.fillMaxWidth().padding(bottom = 24.dp), contentAlignment = Alignment.Center) {
                Text(
                    text = "developed by WRLD feat Antigravity",
                    color = Color.White.copy(alpha = 0.5f), // Cinza bem claro / translúcido
                    fontSize = 10.sp,
                    letterSpacing = 2.0.sp,
                    fontWeight = FontWeight.Thin
                )
            }
        }
    }
}