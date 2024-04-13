const express = require("express");


const app = express();
const port = 3000;


const {obtenerJoyas, obtenerJoyasHATEOAS, obtenerJoyasPorFiltros} = require('./consultas.js');


// Servidor encendido
app.listen(port, () => {
    console.log("¡Servidor encendido! en puerto: " + port);
  })


// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

//Middlewares para generar informes o reportes
//Informe de una solicitud
app.use((req, res, next) => {
  console.log(`Solicitud recibida: ${req.method} ${req.url}`);
  next();
});
 

//Get: "/joyas"
app.get("/joyas", async (req, res) => {
    const queryStrings = req.query
    const joyas = await obtenerJoyas(queryStrings);
    const HATEOAS = await obtenerJoyasHATEOAS (joyas, queryStrings);
    res.json(HATEOAS);
})

//Get: "/joyas/filtros"
app.get("/joyas/filtros", async (req, res) => {
  const queryStrings = req.query
  const joyas = await obtenerJoyasPorFiltros(queryStrings);
  res.json(joyas);
})

