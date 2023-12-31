//imports
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const bodyParser = require("body-parser");
const Handlebars = require("handlebars");
const handlebars = require("express-handlebars");
const {
  allowInsecurePrototypeAccess,
} = require("@handlebars/allow-prototype-access");

const MongoStore = require("connect-mongo");
const passport = require("passport");
const cookieParser = require("cookie-parser");
const initializePassport = require("./passport/passport.config");
const config = require("./config/config.js");
const swaggerJsdoc = require("swagger-jsdoc");
const SwaggerUiExpress = require("swagger-ui-express");

//routes
const productsRouter = require("./routes/product.router");
const cartRouter = require("./routes/cart.router");
const usersRouter = require("./routes/users.router");
const ticketsRouter = require("./routes/tickets.router");
const mailRouter = require("./routes/mail.router");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Conectado a la BD");
  })
  .catch((error) => {
    console.error("Error en la conexión", error);
  });

const swaggerOptions = {
  definition: {
    openapi: "3.0.1",
    info: {
      title: "Documentacion",
      description: "Api ecommerce Swagger",
    },
  },
  apis: [
    "src/docs/Products.yaml",
    "src/docs/Carts.yaml",
    "src/docs/Users.yaml",
  ],
};

const specs = swaggerJsdoc(swaggerOptions);
app.use("/apidocs", SwaggerUiExpress.serve, SwaggerUiExpress.setup(specs));

app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  session({
    store: MongoStore.create({
      mongoUrl: config.mongoURL,
      mongoOptions: { useNewUrlParser: true, useUnifiedTopology: true },
      ttl: 1000,
    }),
    secret: "coderhouse",
    resave: false,
    saveUninitialized: true,
  })
);

initializePassport(passport);
app.use(passport.initialize());
app.use(passport.session());
app.use(cookieParser());

//vistas
app.engine(
  "handlebars",
  handlebars.engine({
    handlebars: allowInsecurePrototypeAccess(Handlebars),
  })
);
app.set("views", __dirname + "/views");
app.set("view engine", "handlebars");

//routes
app.use("/api/sessions", usersRouter);
app.use("/api/products", productsRouter);
app.use("/api/carts", cartRouter);
app.use("/api/tickets", ticketsRouter);
app.use("/api/mail", mailRouter);

app.get("/", async (req, res) => {
  res.render("home");
});

app.listen(config.port, () => {
  console.log(`Servidor en ejecución en el puerto ${config.port} `);
});
