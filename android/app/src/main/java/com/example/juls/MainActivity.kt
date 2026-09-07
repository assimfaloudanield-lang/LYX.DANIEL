package com.example.juls

import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import com.google.android.gms.auth.api.signin.GoogleSignIn
import com.google.android.gms.auth.api.signin.GoogleSignInClient
import com.google.android.gms.auth.api.signin.GoogleSignInOptions
import com.google.android.gms.common.api.ApiException
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.GoogleAuthProvider
import com.google.firebase.auth.ktx.auth
import com.google.firebase.ktx.Firebase

class MainActivity : AppCompatActivity() {

    private lateinit var auth: FirebaseAuth
    private lateinit var googleSignInClient: GoogleSignInClient

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        // 1. Inicializa o Firebase Auth
        auth = Firebase.auth

        // 2. Configura o Login do Google (o ID do cliente Web é lido do google-services.json)
        val gso = GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
            .requestIdToken(getString(R.string.default_web_client_id)) 
            .requestEmail()
            .build()
        googleSignInClient = GoogleSignIn.getClient(this, gso)

        // 3. Mapeia os elementos do layout (XML)
        val campoEmail = findViewById<EditText>(R.id.editEmail)
        val campoSenha = findViewById<EditText>(R.id.editSenha)
        val btnLogar = findViewById<Button>(R.id.btnLogar)
        val btnCadastrar = findViewById<Button>(R.id.btnCadastrar)
        val btnGoogle = findViewById<Button>(R.id.btnGoogle)

        // 4. Ações para E-mail e Senha
        btnCadastrar.setOnClickListener {
            cadastrar(campoEmail.text.toString().trim(), campoSenha.text.toString().trim())
        }
        btnLogar.setOnClickListener {
            logar(campoEmail.text.toString().trim(), campoSenha.text.toString().trim())
        }

        // 5. Captura o resultado da tela de login do Google
        val googleLauncher = registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
            val task = GoogleSignIn.getSignedInAccountFromIntent(result.data)
            try {
                val account = task.getResult(ApiException::class.java)!!
                firebaseAuthWithGoogle(account.idToken!!)
            } catch (e: Exception) {
                showToast("Erro no Google Sign-In: ${e.message}")
            }
        }

        btnGoogle.setOnClickListener {
            googleLauncher.launch(googleSignInClient.signInIntent)
        }
    }

    private fun cadastrar(email: String, deSenha: String) {
        if (email.isEmpty() || deSenha.isEmpty()) return showToast("Preencha todos os campos!")
        auth.createUserWithEmailAndPassword(email, deSenha)
            .addOnCompleteListener(this) { task ->
                if (task.isSuccessful) showToast("Conta criada!") else showToast("Erro: ${task.exception?.message}")
            }
    }

    private fun logar(email: String, deSenha: String) {
        if (email.isEmpty() || deSenha.isEmpty()) return showToast("Preencha todos os campos!")
        auth.signInWithEmailAndPassword(email, deSenha)
            .addOnCompleteListener(this) { task ->
                if (task.isSuccessful) showToast("Conectado com Sucesso!") else showToast("Erro: ${task.exception?.message}")
            }
    }

    private fun firebaseAuthWithGoogle(idToken: String) {
        val credential = GoogleAuthProvider.getCredential(idToken, null)
        auth.signInWithCredential(credential)
            .addOnCompleteListener(this) { task ->
                if (task.isSuccessful) showToast("Logado com o Google!") else showToast("Erro no Firebase: ${task.exception?.message}")
            }
    }

    private fun showToast(msg: String) = Toast.makeText(this, msg, Toast.LENGTH_SHORT).show()
}
