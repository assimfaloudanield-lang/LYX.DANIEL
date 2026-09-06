package com.example.juls.ui

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

val DarkBg = Color(0xFF010006)
val PurpleGlow = Color(0xFFA855F7)
val CyanGlow = Color(0xFF38BDF8)
val PinkGlow = Color(0xFFEC4899)
val TextPrimary = Color(0xFFE2E8F0)
val TextSecondary = Color(0xFF94A3B8)

private val DarkColorScheme = darkColorScheme(
    primary = PurpleGlow,
    secondary = CyanGlow,
    tertiary = PinkGlow,
    background = DarkBg,
    surface = Color(0xFF0B0818),
    onPrimary = Color.White,
    onBackground = TextPrimary,
    onSurface = TextPrimary
)

@Composable
fun LyxTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = DarkColorScheme,
        content = content
    )
}
