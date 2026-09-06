package com.example.juls.ui

import androidx.compose.animation.core.*
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.juls.R

@Composable
fun IPhonePowerButtonCompose(
    isOn: Boolean,
    isListening: Boolean,
    statusText: String?,
    onToggle: () -> Unit,
    modifier: Modifier = Modifier
) {
    val infiniteTransition = rememberInfiniteTransition(label = "powerPulse")
    val pulseScale by infiniteTransition.animateFloat(
        initialValue = 1f,
        targetValue = if (isOn) 1.05f else 1f,
        animationSpec = infiniteRepeatable(
            animation = tween(1500, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "pulse"
    )

    Column(
        modifier = modifier,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Box(
            contentAlignment = Alignment.Center,
            modifier = Modifier.size(160.dp)
        ) {
            // Outer subtle glow
            Box(
                modifier = Modifier
                    .size(if (isOn) 150.dp else 120.dp)
                    .scale(if (isOn) pulseScale else 1f)
                    .clip(CircleShape)
                    .background(
                        Brush.radialGradient(
                            colors = if (isOn) listOf(
                                Color(0xFF38BDF8).copy(alpha = 0.4f),
                                Color(0xFFA855F7).copy(alpha = 0.2f),
                                Color.Transparent
                            ) else listOf(
                                Color(0xFF38BDF8).copy(alpha = 0.1f),
                                Color.Transparent
                            )
                        )
                    )
            )

            // Orb Button
            Box(
                modifier = Modifier
                    .size(110.dp) // Delicately sized
                    .clip(CircleShape)
                    .border(
                        width = 0.5.dp, // THIN stroke
                        brush = Brush.sweepGradient(
                            colors = listOf(
                                Color(0xFF38BDF8).copy(alpha = 0.8f),
                                Color(0xFFA855F7).copy(alpha = 0.6f),
                                Color(0xFF38BDF8).copy(alpha = 0.8f)
                            )
                        ),
                        shape = CircleShape
                    )
                    .clickable(
                        interactionSource = remember { MutableInteractionSource() },
                        indication = null,
                        onClick = onToggle
                    ),
                contentAlignment = Alignment.Center
            ) {
                // Background dark layer
                Box(modifier = Modifier.fillMaxSize().background(Color.Black.copy(alpha = 0.6f)))
                
                // Avatar/Image
                Image(
                    painter = painterResource(id = R.drawable.lyx_button),
                    contentDescription = "LYX Orb",
                    modifier = Modifier.fillMaxSize().clip(CircleShape)
                )
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

        // Status
        Row(
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(5.dp)
                    .clip(CircleShape)
                    .background(
                        when {
                            isOn && isListening -> Color(0xFF38BDF8)
                            isOn -> Color(0xFF38BDF8).copy(alpha = 0.6f)
                            else -> Color(0xFF38BDF8).copy(alpha = 0.3f)
                        }
                    )
            )
            Spacer(modifier = Modifier.width(8.dp))
            Text(
                text = statusText ?: if (isOn) "LYX ESTÁ OUVINDO" else "LYX ESTÁ ESPERANDO",
                fontSize = 9.sp,
                fontWeight = FontWeight.Normal,
                letterSpacing = 2.sp,
                color = Color(0xFF38BDF8).copy(alpha = 0.9f)
            )
        }
    }
}
