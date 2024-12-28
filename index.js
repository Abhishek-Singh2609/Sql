require('dotenv').config(); // Load .env file into process.env  
const { faker, el } = require("@faker-js/faker");
const mysql = require("mysql2");
const express = require("express");
const app = express();
const port = 8080;
const path = require("path");
const { log } = require("console");
const methodOverride = require("method-override");
const { v4: uuidv4 } = require("uuid");

app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
});
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err.stack);
    return;
  }
  console.log('Connected to the database as id ' + connection.threadId);
});

let getRandomUser = () => {
  return [
    faker.string.uuid(),
    faker.internet.userName(),
    faker.internet.email(),
    faker.internet.password(),
  ];
};

//home Rout
app.get("/", (req, res) => {
  let q = `Select count(*) from user`;
  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let count = result[0]["count(*)"];
      res.render("home.ejs", { count });
    });
  } catch (err) {
    console.log(err);
    res.send(`some error in database`);
  }

  // res.send("Welcome to home page");
});
//show user Rout
app.get("/user", (req, res) => {
  let q = `Select * from user`;
  try {
    connection.query(q, (err, users) => {
      if (err) throw err;
      //  res.send(result);
      res.render("Showusers.ejs", { users });
    });
  } catch (err) {
    console.log(err);
    res.send(`some error in database`);
  }
});
//edit Rout
app.get("/user/:id/edit", (req, res) => {
  let { id } = req.params;
  let q = `SELECT * FROM user WHERE id = '${id}'`;
  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];
      res.render("edit.ejs", { user });
    });
  } catch (err) {
    console.log(err);
    res.send(`some error in database`);
  }

  // console.log(id);
  // res.render("edit.ejs")
});
//Update (DB) Rout
app.patch("/user/:id", (req, res) => {
  let { id } = req.params;
  let { password: formpass, username: newusername } = req.body;
  let q = `SELECT * FROM user WHERE id = '${id}'`;
  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];
      if (formpass != user.password) {
        res.send("wrong password");
      } else {
        q2 = `UPDATE user SET username='${newusername}' WHERE id= '${id}' `;
        connection.query(q2, (err, result) => {
          if (err) throw err;
          // res.send(result);
          res.redirect("/user")
        });
      }
    });
  } catch (err) {
    console.log(err);
    res.send(`some error in database`);
  }
});
 //post INSERT REQUEST
app.get("/user/new", (req, res) => {
  res.render("new.ejs");
}); 

app.post("/user/new", (req, res) => {
  let { username, email, password } = req.body;
  let id = uuidv4();
  //Query to Insert New User
  let q = `INSERT INTO user (id, username, email, password) VALUES ('${id}','${username}','${email}','${password}') `;

  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      console.log("added new user");
      res.redirect("/user");
    });
  } catch (err) {
    res.send("some error occurred");
  }
});

//Delete request to delete user
app.get("/user/:id/delete", (req, res) => {
  let { id } = req.params;
  let q = `SELECT * FROM user WHERE id='${id}'`;

  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];
      res.render("delete.ejs", { user });
    });
  } catch (err) {
    res.send("some error with DB");
  }
});

app.delete("/user/:id/", (req, res) => {
  let { id } = req.params;
  let { password } = req.body;
  let q = `SELECT * FROM user WHERE id='${id}'`;

  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];

      if (user.password != password) {
        res.send("WRONG Password entered!");
      } else {
        let q2 = `DELETE FROM user WHERE id='${id}'`; //Query to Delete
        connection.query(q2, (err, result) => {
          if (err) throw err;
          else {
            console.log(result);
            console.log("deleted!");
            res.redirect("/user");
          }
        });
      }
    });
  } catch (err) {
    res.send("some error with DB");
  }
});
app.listen("8080", () => {
  console.log("server is listening to 8080");
});






















//Inserting new data
//   let q = "INSERT INTO USER (id ,username,email, password) VALUES ?";
//   // let users =[["abcb","abc_usernameb","abc@gmail.comb","abcb"],
//   //           ["abcc","abc_usernamec","abc@gmail.comc","abcc"]];
// let data=[];
// for(let i= 1 ; i<=100;i++){
//   // console.log(getRandomUser());
//   data.push(getRandomUser());  //100 fake data generated by faker package
// }

//   try {
//     connection.query(q,[data],(err,result)=>{
//         if (err) throw err;
//            console.log(result);

//       })
//   } catch (err) {
//     console.log(err);

//   }
