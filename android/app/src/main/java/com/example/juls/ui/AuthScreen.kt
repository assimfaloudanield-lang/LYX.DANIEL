package com.example.juls.ui

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.juls.R

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AuthScreen(onLoginSuccess: () -> Unit) {
    var isLogin by remember { mutableStateOf(true) }
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var name by remember { mutableStateOf("") }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF03010A))
    ) {
        // Fundo simulando a web (pode usar imagem de galáxia)
        
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            
            Text(
                text = "LYX",
                color = Color.White,
                fontSize = 32.sp,
                fontWeight = FontWeight.Bold,
                letterSpacing = 4.sp,
                modifier = Modifier.padding(bottom = 40.dp)
            )

            // Card
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(28.dp))
                    .background(Color.Black.copy(alpha = 0.4f))
                    .border(0.5.dp, Color.White.copy(alpha = 0.1f), RoundedCornerShape(28.dp))
                    .padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    text = if (isLogin) "Bem-vindo de volta" else "Criar uma conta",
                    color = Color.White,
                    fontSize = 18.sp,
                    fontWeight = FontWeight.SemiBold,
                    modifier = Modifier.padding(bottom = 4.dp)
                )
                
                Text(
                    text = if (isLogin) "Acesse sua inteligência pessoal." else "Sua inteligência pessoal te aguarda.",
                    color = Color.White.copy(alpha = 0.5f),
                    fontSize = 11.sp,
                    modifier = Modifier.padding(bottom = 24.dp)
                )

                // Google Button
                Button(
                    onClick = onLoginSuccess,
                    modifier = Modifier.fillMaxWidth().height(48.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Color.White),
                    shape = RoundedCornerShape(24.dp)
                ) {
                    Text("Continuar com Google", color = Color.Black, fontSize = 12.sp, fontWeight = FontWeight.Medium)
                }

                Row(
                    modifier = Modifier.fillMaxWidth().padding(vertical = 16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(modifier = Modifier.weight(1f).height(1.dp).background(Color.White.copy(alpha = 0.2f)))
                    Text(" OU ", color = Color.White.copy(alpha = 0.6f), fontSize = 9.sp, modifier = Modifier.padding(horizontal = 8.dp))
                    Box(modifier = Modifier.weight(1f).height(1.dp).background(Color.White.copy(alpha = 0.2f)))
                }

                if (!isLogin) {
                    OutlinedTextField(
                        value = name,
                        onValueChange = { name = it },
                        placeholder = { Text("Nome completo", color = Color.White.copy(alpha = 0.3f), fontSize = 12.sp) },
                        modifier = Modifier.fillMaxWidth().padding(bottom = 12.dp),
                        colors = TextFieldDefaults.outlinedTextFieldColors(
                            focusedTextColor = Color.White, unfocusedTextColor = Color.White,
                            containerColor = Color.Black.copy(alpha = 0.4f),
                            unfocusedBorderColor = Color.White.copy(alpha = 0.1f),
                            focusedBorderColor = Color(0xFF5CE1FF).copy(alpha = 0.5f)
                        ),
                        shape = RoundedCornerShape(16.dp),
                        singleLine = true
                    )
                }

                OutlinedTextField(
                    value = email,
                    onValueChange = { email = it },
                    placeholder = { Text("E-mail", color = Color.White.copy(alpha = 0.3f), fontSize = 12.sp) },
                    modifier = Modifier.fillMaxWidth().padding(bottom = 12.dp),
                    colors = TextFieldDefaults.outlinedTextFieldColors(
                        focusedTextColor = Color.White, unfocusedTextColor = Color.White,
                        containerColor = Color.Black.copy(alpha = 0.4f),
                        unfocusedBorderColor = Color.White.copy(alpha = 0.1f),
                        focusedBorderColor = Color(0xFF5CE1FF).copy(alpha = 0.5f)
                    ),
                    shape = RoundedCornerShape(16.dp),
                    singleLine = true
                )

                OutlinedTextField(
                    value = password,
                    onValueChange = { password = it },
                    placeholder = { Text("Senha", color = Color.White.copy(alpha = 0.3f), fontSize = 12.sp) },
                    modifier = Modifier.fillMaxWidth().padding(bottom = 12.dp),
                    colors = TextFieldDefaults.outlinedTextFieldColors(
                        focusedTextColor = Color.White, unfocusedTextColor = Color.White,
                        containerColor = Color.Black.copy(alpha = 0.4f),
                        unfocusedBorderColor = Color.White.copy(alpha = 0.1f),
                        focusedBorderColor = Color(0xFF5CE1FF).copy(alpha = 0.5f)
                    ),
                    shape = RoundedCornerShape(16.dp),
                    singleLine = true
                )

                if (isLogin) {
                    Text(
                        text = "Esqueci a senha",
                        color = Color(0xFF5CE1FF).copy(alpha = 0.8f),
                        fontSize = 10.sp,
                        modifier = Modifier.align(Alignment.End).padding(bottom = 12.dp).clickable { }
                    )
                }

                Button(
                    onClick = onLoginSuccess,
                    modifier = Modifier.fillMaxWidth().height(48.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF38BDF8)),
                    shape = RoundedCornerShape(24.dp)
                ) {
                    Text(if (isLogin) "Entrar na LYX" else "Criar minha conta", color = Color.White, fontSize = 13.sp)
                }
            }

            Spacer(modifier = Modifier.height(32.dp))

            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(
                    text = if (isLogin) "Ainda não tem acesso?" else "Já possui uma conta?",
                    color = Color.White.copy(alpha = 0.5f),
                    fontSize = 11.sp
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = if (isLogin) "Criar conta" else "Fazer login",
                    color = Color.White,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Medium,
                    modifier = Modifier.clickable { isLogin = !isLogin }
                )
            }
        }
    }
}
