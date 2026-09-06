const fs = require('fs');
let code = fs.readFileSync('android/app/src/main/java/com/example/juls/ui/HomeScreen.kt', 'utf8');

const targetStr = `        // Background Image
        Image(
            painter = painterResource(id = R.drawable.backgroundlyx),
            contentDescription = "Background",
            modifier = Modifier.fillMaxSize(),
            contentScale = ContentScale.Crop,
            alpha = 0.85f
        )`;

const replacementStr = `        // Background Image (Galaxia)
        Image(
            painter = painterResource(id = R.drawable.backgroundlyx),
            contentDescription = "Background",
            modifier = Modifier.fillMaxSize(),
            contentScale = ContentScale.Crop,
            alpha = 0.85f
        )
        // Nova imagem adicionada (50% opacidade) abaixo do overlay
        Image(
            painter = painterResource(id = R.drawable.eda55b6a_2d3e),
            contentDescription = "Custom Background",
            modifier = Modifier.fillMaxSize(),
            contentScale = ContentScale.Crop,
            alpha = 0.5f
        )`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, replacementStr);
  fs.writeFileSync('android/app/src/main/java/com/example/juls/ui/HomeScreen.kt', code);
  console.log('Added placeholder for eda55b6a_2d3e in HomeScreen.kt');
} else {
  console.log('Target string not found in HomeScreen.kt');
}
