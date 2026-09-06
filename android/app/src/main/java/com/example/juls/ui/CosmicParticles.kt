package com.example.juls.ui

import androidx.compose.animation.core.*
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import kotlin.random.Random

private data class Particle(
    var x: Float,
    var y: Float,
    val radius: Float,
    val speedY: Float,
    val alpha: Float,
    val color: Color
)

@Composable
fun CosmicParticlesCanvas(modifier: Modifier = Modifier) {
    val infiniteTransition = rememberInfiniteTransition(label = "particles")
    val time by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 10000, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "particleTime"
    )

    val particles = remember {
        val colors = listOf(
            Color(0xFF38BDF8), // Cyan
            Color(0xFFEC4899), // Pink
            Color(0xFFA855F7), // Purple
            Color(0xFF818CF8)  // Indigo
        )
        List(35) {
            Particle(
                x = Random.nextFloat(),
                y = Random.nextFloat(),
                radius = Random.nextFloat() * 3f + 1f,
                speedY = Random.nextFloat() * 0.0005f + 0.0002f,
                alpha = Random.nextFloat() * 0.6f + 0.2f,
                color = colors[Random.nextInt(colors.size)]
            )
        }
    }

    Canvas(modifier = modifier.fillMaxSize()) {
        val width = size.width
        val height = size.height

        particles.forEach { particle ->
            particle.y -= particle.speedY
            if (particle.y < 0f) {
                particle.y = 1f
                particle.x = Random.nextFloat()
            }

            val px = particle.x * width
            val py = particle.y * height

            drawCircle(
                color = particle.color.copy(alpha = particle.alpha),
                radius = particle.radius,
                center = Offset(px, py)
            )
        }
    }
}
