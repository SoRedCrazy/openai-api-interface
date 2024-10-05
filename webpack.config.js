const path = require("path");

module.exports = {
  entry: "./src/script.js", // Fichier d'entrée
  output: {
    filename: "script.js", // Nom du fichier de sortie
    path: path.resolve(__dirname, "public"), // Dossier de sortie
  },
  mode: "production", // Mode production pour minification automatique
  module: {
    rules: [
      {
        test: /\.js$/, // Transpiler les fichiers .js avec Babel (optionnel)
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
    ],
  },
};

// module.exports = {
//   entry: "./src/script_images.js", // Fichier d'entrée
//   output: {
//     filename: "script_images.js", // Nom du fichier de sortie
//     path: path.resolve(__dirname, "public"), // Dossier de sortie
//   },
//   mode: "production", // Mode production pour minification automatique
//   module: {
//     rules: [
//       {
//         test: /\.js$/, // Transpiler les fichiers .js avec Babel (optionnel)
//         exclude: /node_modules/,
//         use: {
//           loader: "babel-loader",
//         },
//       },
//     ],
//   },
// };
