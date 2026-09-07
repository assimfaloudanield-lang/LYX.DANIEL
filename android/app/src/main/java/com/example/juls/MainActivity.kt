package com.example.juls

import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.credentials.CredentialManager
import androidx.credentials.GetCredentialRequest
import androidx.credentials.exceptions.GetCredentialException
import androidx.lifecycle.lifecycleScope
import com.google.android.libraries.identity.googleid.GetGoogleIdOption
import com.google.android.libraries.identity.googleid.GoogleIdTokenCredential
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.GoogleAuthProvider
import com.google.firebase.auth.ktx.auth
import com.google.firebase.ktx.Firebase
import kotlinx.coroutines.launch

class MainActivity : AppCompatActivity() {

    private lateinit var auth: FirebaseAuth
    private lateinit var credentialManager: CredentialManager

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        // 1. Inicializa o Firebase Auth
        auth = Firebase.auth
        credentialManager = CredentialManager.create(this)

        // 2. Mapeia os elementos do layout (XML)
        val campoEmail = findViewById<EditText>(R.id.editEmail)
        val campoSenha = findViewById<EditText>(R.id.editSenha)
        val btnLogar = findViewById<Button>(R.id.btnLogar)
        val btnCadastrar = findViewById<Button>(R.id.btnCadastrar)
        val btnRecuperarSenha = findViewById<Button>(R.id.btnRecuperarSenha)
        val btnGoogle = findViewById<Button>(R.id.btnGoogle)

        // 3. Ações para E-mail e Senha
        btnCadastrar.setOnClickListener {
            cadastrar(campoEmail.text.toString().trim(), campoSenha.text.toString().trim())
        }
        btnLogar.setOnClickListener {
            logar(campoEmail.text.toString().trim(), campoSenha.text.toString().trim())
        }
        btnRecuperarSenha.setOnClickListener {
            recuperarSenha(campoEmail.text.toString().trim())
        }

        // 4. Fluxo moderno CredentialManager + GetGoogleIdOption
        btnGoogle.setOnClickListener {
            realizarGoogleSignIn()
        }
    }

    private fun realizarGoogleSignIn() {
        lifecycleScope.launch {
            try {
                val serverClientId = getString(R.string.default_web_client_id)
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
                    context = this@MainActivity
                )

                val credential = result.credential
                if (credential is androidx.credentials.CustomCredential &&
                    credential.type == GoogleIdTokenCredential.TYPE_GOOGLE_ID_TOKEN_CREDENTIAL
                ) {
                    val googleIdToken = GoogleIdTokenCredential.createFrom(credential.data)
                    firebaseAuthWithGoogle(googleIdToken.idToken)
                } else {
                    showToast("Tipo de credencial não suportado.")
                }
            } catch (e: GetCredentialException) {
                showToast("Falha no login Google: ${e.message}")
            } catch (e: Exception) {
                showToast("Erro: ${e.message}")
            }
        }
    }

    private fun cadastrar(email: String, deSenha: String) {
        if (email.isEmpty() || deSenha.isEmpty()) return showToast("Preencha todos os campos!")
        auth.createUserWithEmailAndPassword(email, deSenha)
            .addOnCompleteListener(this) { task ->
                if (task.isSuccessful) {
                    showToast("Conta criada com sucesso!")
                } else {
                    showToast("Erro: ${task.exception?.message}")
                }
            }
    }

    private fun logar(email: String, deSenha: String) {
        if (email.isEmpty() || deSenha.isEmpty()) return showToast("Preencha todos os campos!")
        auth.signInWithEmailAndPassword(email, deSenha)
            .addOnCompleteListener(this) { task ->
                if (task.isSuccessful) {
                    showToast("Conectado com Sucesso!")
                } else {
                    showToast("Erro: ${task.exception?.message}")
                }
            }
    }

    private fun recuperarSenha(email: String) {
        if (email.isEmpty()) return showToast("Informe o seu e-mail para recuperar a senha!")
        auth.sendPasswordResetEmail(email)
            .addOnCompleteListener(this) { task ->
                if (task.isSuccessful) {
                    showToast("E-mail de recuperação enviado! Verifique sua caixa de entrada.")
                } else {
                    showToast("Erro ao recuperar senha: ${task.exception?.message}")
                }
            }
    }

    private fun firebaseAuthWithGoogle(idToken: String) {
        val credential = GoogleAuthProvider.getCredential(idToken, null)
        auth.signInWithCredential(credential)
            .addOnCompleteListener(this) { task ->
                if (task.isSuccessful) {
                    val user = auth.currentUser
                    showToast("Logado com o Google: ${user?.displayName ?: user?.email}")
                } else {
                    showToast("Erro no Firebase: ${task.exception?.message}")
                }
            }
    }

    private fun showToast(msg: String) = Toast.makeText(this, msg, Toast.LENGTH_SHORT).show()
}
