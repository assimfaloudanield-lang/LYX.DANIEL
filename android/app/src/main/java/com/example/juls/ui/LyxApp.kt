package com.example.juls.ui

import androidx.compose.runtime.Composable
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.example.juls.ui.chat.ChatScreen
import com.example.juls.ui.chat.ChatMessage
import com.example.juls.ui.profile.ProfileScreen
import com.example.juls.ui.settings.SettingsScreen

@Composable
fun LyxApp(
    isOn: Boolean,
    isListening: Boolean,
    voiceStatus: String?,
    onTogglePower: () -> Unit,
    messages: List<ChatMessage>,
    onSendMessage: (String) -> Unit
) {
    val navController = rememberNavController()

    NavHost(navController = navController, startDestination = "auth") {
        
        composable("auth") {
            AuthScreen(
                onLoginSuccess = { 
                    navController.navigate("home") {
                        popUpTo("auth") { inclusive = true }
                    }
                }
            )
        }
        
        composable("home") {
            HomeScreen(
                isOn = isOn,
                isListening = isListening,
                voiceStatus = voiceStatus,
                onTogglePower = onTogglePower,
                onNavigateToChat = { navController.navigate("chat") },
                onNavigateToProfile = { navController.navigate("profile") },
                onNavigateToSettings = { navController.navigate("settings") }
            )
        }
        
        composable("profile") {
            ProfileScreen(
                onNavigateBack = { navController.popBackStack() },
                onNavigateToSettings = { navController.navigate("settings") }
            )
        }

        composable("chat") {
            ChatScreen(
                isListening = isListening,
                onToggleMic = onTogglePower,
                messages = messages,
                onSendMessage = onSendMessage,
                onNavigateBack = { navController.popBackStack() }
            )
        }

        composable("settings") {
            SettingsScreen(
                onNavigateBack = { navController.popBackStack() }
            )
        }
    }
}
