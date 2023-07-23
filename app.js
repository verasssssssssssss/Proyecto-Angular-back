var express = require("express");
const mysql = require("mysql");
const bodyParser = require("body-parser");



var jwt = require("jsonwebtoken");

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//CORS middleware
app.use(function (req, res, next) {
  //Enabling CORS
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, x-client-key, x-client-token, x-client-secret, Authorization"
  );
  next();
});

const mc = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "tattoores",
});
mc.connect();

//Login
app.post("/login", (req, res) => {
  var body = req.body;
  mc.query(
    "SELECT * FROM usuario WHERE CorreoElectronico = ?",
    body.email,
    function (err, results, fields) {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: "Error al buscar usuario",
          errors: err,
        });
      }
      if (!results.length) {
        return res.status(400).json({
          ok: false,
          mensaje: "Credenciales incorrectas - email",
          errors: err,
        });
      }
      console.log(results);
      /* if(!bcrypt.compareSync(body.password,results[0].userPassword)){
      return res.status(400).json({
        ok:false, mensaje: 'Credenciales incorrectas - password', errors:err
      });
     *//* clg  
        if(body.password!=results[0].Constraseña){
            return res.status(400).json({
                ok:false, mensaje: 'Credenciales incorrectas - password', errors:err
              });
        } */
      //crear un token
      let SEED = "esta-es-una-semilla";
      let token = jwt.sign({ usuario: results[0].userPassword }, SEED, {
        expiresIn: 14400,
      });
      res.status(200).json({
        ok: true,
        usuario: results,
        id: results[0].userId,
        token: token,
      });
    }
  );
});

/* app.use('/', (req, res, next) => {
  let token = req.query.token;
  let SEED = "esta-es-una-semilla";
  console.log(token);
  jwt.verify(token, SEED, (err, decoded) => {
    if (err) {
      return res.status(401).json({
        ok: false,
        mensaje: "Token incorrecto",
        errors: err,
      });
    }
    req.usuario = decoded.usuario;
    next();
  });
}); */

//Registrar usuario
app.post("/usuario", function (req, res) {
  let datosUsuario = {
    Nombre: req.body.name,
    CorreoElectronico: req.body.email,
    Contraseña: req.body.password,
    
    
  };
  console.log(datosUsuario.userPassword);
  if (mc) {
    mc.query(
      "INSERT INTO usuario SET ?",
      datosUsuario,
      function (err, result) {
        if (err) {
          return res.status(400).json({
            ok: false,
            mensaje: "Error al crear usuario",
            errors: err,
          });
        } else {
          return res.status(201).json({
            ok: true,
            usuario: result,
          });
        }
      }
    );
  }
});



//Rutas
app.get("/", (req, res, next) => {
  res.status(200).json({
    ok: true,
    mensaje: "Peticion realizada correctamente",
  });
});



app.listen(3000, () => {
  console.log("Express Server - puerto 3000 online");
});
