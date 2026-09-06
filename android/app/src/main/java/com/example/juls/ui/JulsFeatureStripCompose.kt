package com.example.juls.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.ChatBubbleOutline
import androidx.compose.material.icons.rounded.Mic
import androidx.compose.material.icons.rounded.AutoAwesome
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun JulsFeatureStripCompose(
    modifier: Modifier = Modifier
) {
    Row(
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = 12.dp),
        horizontalArrangement = Arrangement.SpaceEvenly,
        verticalAlignment = Alignment.Top
    ) {
        FeatureItemCompose(
            icon = Icons.Rounded.ChatBubbleOutline,
            title = "CONVERSE NATURALMENTE",
            subtitle = "Fale sem precisar digitar.",
            iconColor = Color(0xFF38BDF8),
            modifier = Modifier.weight(1f)
        )

        DividerCompose()

        FeatureItemCompose(
            icon = Icons.Rounded.Mic,
            title = "FALE DO SEU JEITO",
            subtitle = "Uma conversa por voz, sem comandos rígidos.",
            iconColor = Color(0xFFA855F7),
            modifier = Modifier.weight(1f)
        )

        DividerCompose()

        FeatureItemCompose(
            icon = Icons.Rounded.AutoAwesome,
            title = "TENHA UMA VOZ SEMPRE POR PERTO",
            subtitle = "Converse quando quiser, com resposta rápida e natural.",
            iconColor = Color(0xFFEC4899),
            modifier = Modifier.weight(1f)
        )
    }
}

@Composable
private fun FeatureItemCompose(
    icon: ImageVector,
    title: String,
    subtitle: String,
    iconColor: Color,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Box(
            modifier = Modifier.size(32.dp),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = icon,
                contentDescription = title,
                tint = iconColor,
                modifier = Modifier.size(18.dp)
            )
        }

        Spacer(modifier = Modifier.height(4.dp))

        Text(
            text = title,
            fontSize = 8.sp,
            fontWeight = FontWeight.SemiBold,
            color = Color(0xFFE2E8F0),
            textAlign = TextAlign.Center,
            lineHeight = 10.sp,
            letterSpacing = 0.5.sp
        )

        Spacer(modifier = Modifier.height(2.dp))

        Text(
            text = subtitle,
            fontSize = 7.sp,
            fontWeight = FontWeight.Normal,
            color = Color(0xFF94A3B8),
            textAlign = TextAlign.Center,
            lineHeight = 9.sp,
            letterSpacing = 0.2.sp
        )
    }
}

@Composable
private fun DividerCompose() {
    Box(
        modifier = Modifier
            .width(1.dp)
            .height(36.dp)
            .background(Color.White.copy(alpha = 0.08f))
    )
}
