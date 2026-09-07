package com.example.juls.ui

import android.widget.Toast
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
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.credentials.CredentialManager
import androidx.credentials.GetCredentialRequest
import androidx.credentials.exceptions.GetCredentialException
import com.example.juls.R
import com.google.android.libraries.identity.googleid.GetGoogleIdOption
import com.google.android.libraries.identity.googleid.GoogleIdTokenCredential
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.GoogleAuthProvider
import com.google.firebase.auth.ktx.auth
import com.google.firebase.ktx.Firebase
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AuthScreen(onLoginSuccess: () -> Unit) {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()
    val auth = remember { Firebase.auth }
    val credentialManager = remember { CredentialManager.create(context) }

    var isLogin by remember { mutableStateOf(true) }
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var name by remember { mutableStateOf("") }
    var isLoading by remember { mutableStateOf(false) }

    fun showToast(msg: String) = Toast.makeText(context, msg, Toast.LENGTH_SHORT).show()

    fun performGoogleSignIn() {
        coroutineScope.launch {
            isLoading = true
            try {
                val serverClientId = context.getString(R.string.default_web_client_id)
                val googleIdOption = GetGoogleIdOption.Builder()
                    .setFilterByAuthorizedAccounts(false)
                    .setServerClientId(serverClientId)
                    .setAutoSelectEnabled(false)
                    .build()

                val request = GetCredentialRequest.Builder()
                    .addCredentialOption(googleIdOption)
                    .build()

                val result = credentialManager.getCredential(
                    request = request,
                    context = context
                )

                val credential = result.credential
                if (credential is androidx.credentials.CustomCredential &&
                    credential.type == GoogleIdTokenCredential.TYPE_GOOGLE_ID_TOKEN_CREDENTIAL
                ) {
                    val googleIdToken = GoogleIdTokenCredential.createFrom(credential.data)
                    val firebaseCred = GoogleAuthProvider.getCredential(googleIdToken.idToken, null)
                    auth.signInWithCredential(firebaseCred)
                        .addOnCompleteListener { task ->
                            isLoading = false
                            if (task.isSuccessful) {
                                showToast("Logado com sucesso!")
                                onLoginSuccess()
                            } else {
                                showToast("Erro no Firebase: ${task.exception?.message}")
                            }
                        }
                } else {
                    isLoading = false
                    showToast("Tipo de credencial não suportado.")
                }
            } catch (e: GetCredentialException) {
                isLoading = false
                showToast("Login Google cancelado ou falhou: ${e.message}")
            } catch (e: Exception) {
                isLoading = false
                showToast("Erro: ${e.message}")
            }
        }
    }

    fun handleEmailAuth() {
        val trimmedEmail = email.trim()
        val trimmedPassword = password.trim()

        if (trimmedEmail.isEmpty() || trimmedPassword.isEmpty()) {
            showToast("Preencha todos os campos!")
            return
        }

        isLoading = true
        if (isLogin) {
            auth.signInWithEmailAndPassword(trimmedEmail, trimmedPassword)
                .addOnCompleteListener { task ->
                    isLoading = false
                    if (task.isSuccessful) {
                        showToast("Bem-vindo(a) de volta!")
                        onLoginSuccess()
                    } else {
                        showToast("Erro: ${task.exception?.message}")
                    }
                }
        } else {
            auth.createUserWithEmailAndPassword(trimmedEmail, trimmedPassword)
                .addOnCompleteListener { task ->
                    isLoading = false
                    if (task.isSuccessful) {
                        showToast("Conta criada com sucesso!")
                        onLoginSuccess()
                    } else {
                        showToast("Erro: ${task.exception?.message}")
                    }
                }
        }
    }

    fun handleResetPassword() {
        val trimmedEmail = email.trim()
        if (trimmedEmail.isEmpty()) {
            showToast("Informe seu e-mail para recuperar a senha!")
            return
        }
        isLoading = true
        auth.sendPasswordResetEmail(trimmedEmail)
            .addOnCompleteListener { task ->
                isLoading = false
                if (task.isSuccessful) {
                    showToast("E-mail de recuperação enviado!")
                } else {
                    showToast("Erro: ${task.exception?.message}")
                }
            }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF03010A))
    ) {
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
                modifier = Modifier.padding(bottom = 32.dp)
            )

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

                Button(
                    onClick = { performGoogleSignIn() },
                    enabled = !isLoading,
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
                        fontSize = 11.sp,
                        modifier = Modifier.align(Alignment.End).padding(bottom = 12.dp).clickable {
                            handleResetPassword()
                        }
                    )
                }

                Button(
                    onClick = { handleEmailAuth() },
                    enabled = !isLoading,
                    modifier = Modifier.fillMaxWidth().height(48.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF38BDF8)),
                    shape = RoundedCornerShape(24.dp)
                ) {
                    if (isLoading) {
                        CircularProgressIndicator(modifier = Modifier.size(20.dp), color = Color.White, strokeWidth = 2.dp)
                    } else {
                        Text(if (isLogin) "Entrar na LYX" else "Criar minha conta", color = Color.White, fontSize = 13.sp)
                    }
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
