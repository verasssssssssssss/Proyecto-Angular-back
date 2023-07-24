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


/////////////////////////////////////////////////////////////
//HOME
/////////////////////////////////////////////////////////////

//CLiente
/*
GET = información de todos los tatuadores.
GET = información de portafolio de un tatuador en específico.
-Obteniendo el id del tatuador
-retorna Todas las fotografías perteneceisntes al portafolio.
Get = información de todos los tatuajes destacados.
*/


//Tatuador
/*
Todas las anteriores
POST = Crear portafolio propio
POST = agregar tatuaje a portafolio propio
DELETE = eliminar tatuaje del portafolio propio
*/


//Administrador
/*
Todas las anteriores (las peticiones de tatuadores son para todos los tatuadores)
Get = información de todos los tatuajes no destacados.
PUT = agregar tatuaje/ descripción de tatuaje realizado.
PUT = eliminar tatuaje/ descripción de tatuaje realizado.
PUT = editar tatuaje/ descripción de tatuaje realizado.
*/

/////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////


//////////////////////////////////////////////////////////////// CLiente
//GET = información de todos los tatuadores.
app.get('/Tatuadores', function (req, res) {
  mc.query('SELECT usuario.IdUsuario, usuario.Nombre, usuario.Apellido, usuario.AñosExperiencia, usuario.Fotografia, es.NomEspecialidad FROM usuario INNER JOIN ( SELECT especialidades.IdUsuario, especialidad.NomEspecialidad FROM especialidad INNER JOIN especialidades ON especialidades.IdEspecialidad= especialidad.IdEspecialidad ) AS es ON es.IdUsuario = usuario.IdUsuario WHERE usuario.idRol = 2', function (error, results, fields) {
      if (error) throw error;
      return res.send({
          error: false,
          data: results,
          message: 'Lista de tatuadores.'
      });
  });
});



//GET = información de portafolio de un tatuador en específico.
app.get('/PortafolioTataudor/:id', (req, res, next) => {
  let id = req.params.id;
  console.log('id:' + id);
  mc.query("SELECT es.LinkImagen FROM usuario INNER JOIN ( SELECT portafolio.IdUsuarioT,imágenes.LinkImagen FROM portafolio INNER JOIN imágenes ON portafolio.IdPortafolio= imágenes.IdPortafolio ) AS es ON es.IdUsuarioT = usuario.IdUsuario WHERE usuario.idRol = 2 AND usuario.IdUsuario = ?", id, function (err, result, fields) {
      return res.send({
          error: false,
          data: result,
          message: 'El portafolio existe.'
      });
  });
});



//GET = información de todos los tatuajes destacados.
app.get('/TatuajesDestacados', function (req, res) {
  mc.query('SELECT usuario.Nombre,usuario.Apellido,es.IdImagen,es.NomImagen,es.LinkImagen,es.Fecha,es.Descripcion FROM usuario INNER JOIN ( SELECT portafolio.IdUsuarioT,imágenes.IdImagen,imágenes.NomImagen,imágenes.LinkImagen,imágenes.Fecha,imágenes.Descripcion FROM imágenes INNER JOIN portafolio ON imágenes.IdPortafolio = portafolio.IdPortafolio WHERE imágenes.IdTipoImg = 2 ) AS es ON es.IdUsuarioT = usuario.IdUsuario WHERE usuario.IdRol=2', function (error, results, fields) {
      if (error) throw error;
      return res.send({
          error: false,
          data: results,
          message: 'Lista de tatuajes destacados.'
      });
  });
});



//////////////////////////////////////////////////////////////// Tatuador
//POST = Crear portafolio propio
app.post('/portafolio', function (req, res) {
  let datosPortafolio = {
    NomPortafolio:req.body.NomPortafolio,
    FechaPortafolio:req.body.FechaPortafolio,	
    IdUsuarioT:req.body.IdUsuarioT, 
  };

  if (mc) {
      mc.query("INSERT INTO portafolio SET ?", datosPortafolio, function (error, results) {
          if (error) {
              res.status(500).json({ "Mensaje": "Error" });
          }
          else {
              res.status(201).json({ "Mensaje": "Insertado" });
          }
      });
  }
});



//POST = agregar tatuaje a portafolio propio
app.post('/portafolio/Tatuaje', function (req, res) {
  let datosTatuajePortafolio = {
    NomImagen:req.body.NomImagen, 
    LinkImagen:req.body.LinkImagen, 
    Fecha:req.body.Fecha, 
    Descripcion:req.body.Descripcion, 
    IdPortafolio:req.body.IdPortafolio, 
    IdTipoImg:1,
  };

  if (mc) {
      mc.query("INSERT INTO imágenes SET ?", datosTatuajePortafolio, function (error, results) {
          if (error) {
              res.status(500).json({ "Mensaje": "Error" });
          }
          else {
              res.status(201).json({ "Mensaje": "Insertado" });
          }
      });
  }
});



//DELETE = eliminar tatuaje del portafolio propio
app.delete('/portafolio/Tatuaje/:id', function (req, res) {
  let id = req.params.id;
  if (mc) {
      console.log(id);
      mc.query("DELETE FROM imágenes WHERE productId = ?", id, function (error, results) {
          if (error) {
              return res.status(500).json({ "Mensaje": "Error" });
          }
          else {
              return res.status(200).json({ "Mensaje": "Fotografia de tatuaje con id= " + id + " Borrado" });
          }
      });
  }
});



//////////////////////////////////////////////////////////////// Administrador
//Get = información de todos los tatuajes no destacados.
app.get('/Tatuajes/NoDestacados', function (req, res) {
  mc.query('SELECT usuario.Nombre,usuario.Apellido,es.IdImagen,es.NomImagen,es.LinkImagen,es.Fecha,es.Descripcion FROM usuario INNER JOIN ( SELECT portafolio.IdUsuarioT,imágenes.IdImagen,imágenes.NomImagen,imágenes.LinkImagen,imágenes.Fecha,imágenes.Descripcion FROM imágenes INNER JOIN portafolio ON imágenes.IdPortafolio = portafolio.IdPortafolio WHERE imágenes.IdTipoImg = 1 ) AS es ON es.IdUsuarioT = usuario.IdUsuario WHERE usuario.IdRol=2', function (error, results, fields) {
      if (error) throw error;
      return res.send({
          error: false,
          data: results,
          message: 'Lista de tatuajes no destacados.'
      });
  });
});



//PUT = agregar tatuaje destacado/ descripción de tatuaje realizado.
app.put('/Tatuajes/DestacadosAgregar/:id', (req, res) => {
  let id = req.params.id;
  if (!id) {
      return res.status(400).send({ error: producto, message: 'Debe proveer un id de una fotografia de tatuajes' });
  }
  mc.query("UPDATE imágenes SET IdTipoImg=2 WHERE IdImagen = ?", id, function (error, results, fields) {
      if (error) throw error;
      return res.status(200).json({ "Mensaje": "Registro con id = " + id + " ha sido actualizado" });
  });
});



//PUT = eliminar tatuaje destacado/ descripción de tatuaje realizado.
app.put('/Tatuajes/DestacadosEliminar/:id', (req, res) => {
  let id = req.params.id;
  if (!id) {
      return res.status(400).send({ error: producto, message: 'Debe proveer un id de una fotografia de tatuajes' });
  }
  mc.query("UPDATE imágenes SET IdTipoImg=1 WHERE IdImagen = ?", id, function (error, results, fields) {
      if (error) throw error;
      return res.status(200).json({ "Mensaje": "Registro con id = " + id + " ha sido actualizado" });
  });
});



//PUT = editar tatuaje/ descripción de tatuaje realizado.
app.put('/Tatuajes/DestacadosEditar/:id', (req, res) => {
  let id = req.params.id;
  let Descripcion = req.params.Descripcion;

  if (!id || !Descripcion) {
      return res.status(400).send({ error: Descripcion, message: 'Debe proveer un id de una fotografia de tatuajes y una descripcion' });
  }
  mc.query("UPDATE imágenes SET Descripcion = ? WHERE IdImagen = ?", [Descripcion, id], function (error, results, fields) {
      if (error) throw error;
      return res.status(200).json({ "Mensaje": "Registro con id = " + id + " ha sido actualizado" });
  });
});

//Rutass
app.get("/", (req, res, next) => {
  res.status(200).json({
    ok: true,
    mensaje: "Peticion realizada correctamente",
  });
});

app.listen(3000, () => {
  console.log("Express Server - puerto 3000 online");
});