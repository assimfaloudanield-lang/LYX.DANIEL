const fs = require('fs');

let code = fs.readFileSync('android/app/src/main/java/com/example/juls/ui/LyxApp.kt', 'utf8');

// replace startDestination = "home" with startDestination = "auth"
code = code.replace('startDestination = "home"', 'startDestination = "auth"');

// insert composable("auth") block before composable("home")
const authBlock = `        composable("auth") {
            AuthScreen(
                onLoginSuccess = { 
                    navController.navigate("home") {
                        popUpTo("auth") { inclusive = true }
                    }
                }
            )
        }
        
        composable("home") {`;

code = code.replace('composable("home") {', authBlock);

fs.writeFileSync('android/app/src/main/java/com/example/juls/ui/LyxApp.kt', code);
console.log('LyxApp.kt updated for Auth navigation');

