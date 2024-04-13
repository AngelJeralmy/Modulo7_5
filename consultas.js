const express = require("express");
const { Pool } = require("pg");
const format = require("pg-format");

const app = express();
const port = 4000;

// Servidor encendido
app.listen(port, () => {
  console.log("¡Servidor encendido! en puerto: " + port);
});

// New Pool
const pool = new Pool({
  host: "localhost",
  user: "postgres",
  password: "",
  database: "joyas",
  allowExitOnIdle: true,
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));


//Obtener joyas de Get /joyas
const obtenerJoyas = async ({ limits = 10, order_by = "id_ASC", page = 1 }) => {
  try {
    const [campo, direccion] = order_by.split("_");
    const offset = (page - 1) * limits;
    const formattedQuery = format(
      "SELECT * FROM inventario order by %s %s LIMIT %s OFFSET %s",
      campo,
      direccion,
      limits,
      offset
    );
    const { rows: joyas } = await pool.query(formattedQuery);
    return joyas;
  } catch (error) {
    res.status(500).send(error);
  }
};

//Obtener joyas HATEOAS de Get /joyas
const obtenerJoyasHATEOAS = (joyas, query) => {
  try {
    const indiceGuionBajo = query.order_by.indexOf("_");
    const filtroBusqueda = query.order_by.substring(0, indiceGuionBajo);
    const results = joyas.map((j) => {
      return {
        [filtroBusqueda]: j[filtroBusqueda],
        name: j.nombre,
        href: `/joyas/joya/${j.id}`,
      };
    });
    const total = joyas.length;
    const HATEOAS = {
      total,
      results,
    };
    return HATEOAS;
  } catch (error) {
    res.status(500).send(error);
  }
};





//Obtener joyas de Get /joyas/filtros
const obtenerJoyasPorFiltros = async ({precio_max, precio_min, categoria, metal,}) => {

  let filtros = [];
  const values = [];

  try{
    const agregarFiltro = (campo, comparador, valor) => {
      values.push(valor);
      const { length } = filtros;
      filtros.push(`${campo} ${comparador} $${length + 1}`);
    };
  
    if (precio_max) agregarFiltro('precio', '>', precio_max);
    if (precio_min) agregarFiltro('precio', '<', precio_min);
    if (categoria) agregarFiltro('categoria', '=', categoria);
    if (metal) agregarFiltro('metal', '=', metal);
  
    let consulta = "SELECT * FROM inventario";
    if (filtros.length > 0) {
    filtros = filtros.join(" AND ");
    consulta += ` WHERE ${filtros}`;
    };
  
    const { rows: joyas } = await pool.query(consulta, values);
    return joyas;
  }catch(error){
    res.status(500).send(error);
  }
};



module.exports = { obtenerJoyas, obtenerJoyasHATEOAS, obtenerJoyasPorFiltros };
