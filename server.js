const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const multer = require('multer');
const path = require('path');

const server = express();
server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());

// Establish Database Connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: 'blogNodejs',
  port: 3306,
});

db.connect(function (error) {
  if (error) {
    console.log("Error connecting to the Database");
  } else {
    console.log("Successfully connected to DB");
  }
});

// Set up storage for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/images/'); 
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); 
  },
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 }, 
});

// Create The Records
server.post("/api/blog_posts/add", upload.single('images'),(req, res) => {
    console.log('File received:', req.file);
    let details = {
        title: req.body.title,
        users: req.body.users,
        date: req.body.date,
        comments: req.body.comments,
        images: req.file.filename,
    };

    let sql = "INSERT INTO blog_posts SET ?";
    db.query(sql, details, (error, result) => {
        if (error) {
            console.error('Error creating blog post:', error);
            res.status(500).json({ status: false, message: 'Blog post creation failed', error: error });
        } else {
            res.json({ status: true, message: 'Blog post created successfully', postId: result.insertId });
        }
    });
});

// View The Records
server.get("/api/blog_posts", (req, res) => {
  var sql = "SELECT * FROM blog_posts";
  db.query(sql, function (error, result) {
    if (error) {
      console.log("Error connecting to the database");
    } else {
      res.send({ status: true, data: result });
    }
  });
});

// Search Records
server.get("/api/blog_posts/:id", (req, res) => {
  var blog_postsid = req.params.id;
  var sql = "SELECT * FROM blog_posts WHERE id =" + blog_postsid;
  db.query(sql, function (error, result) {
    if (error) {
      console.log("Error connecting to the database");
    } else {
      res.send({ status: true, data: result });
    }
  });
});

// Update Records
server.put("/api/blog_posts/update/:id", upload.single('images'), (req, res) => {
    const postId = req.params.id;
    const { title, users, date, comments } = req.body;

    // To Update the new Image
    const newImage = req.file ? req.file.filename : null;

    // Update the previous detail with the new.
    let updateDetails;
    if (newImage) {
        updateDetails = {
            title: title,
            users: users,
            date: date,
            comments: comments,
            images: newImage,
        };
    } else {
        updateDetails = {
            title: title,
            users: users,
            date: date,
            comments: comments,
        };
    }

    const sql = "UPDATE blog_posts SET ? WHERE id = ?";
    db.query(sql, [updateDetails, postId], (error, result) => {
        if (error) {
            console.error('Error updating blog post:', error);
            res.status(500).json({ status: false, message: 'Blog post update failed', error: error });
        } else {
            res.json({ status: true, message: 'Blog post updated successfully' });
        }
    });
});

// Delete Records
server.delete("/api/blog_posts/delete/:id", (req, res) => {
  let sql = "DELETE FROM blog_posts WHERE id=" + req.params.id + "";
  db.query(sql, (error) => {
    if (error) {
      res.send({ status: false, message: "Blog post deletion failed" });
    } else {
      res.send({ status: true, message: "Blog post deleted successfully" });
    }
  });
});

// Create a route for handling image uploads
server.post('/api/blog_posts/uploadImage', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ status: false, message: 'No file uploaded' });
  }

  const imageUrl = `uploads/${req.file.filename}`;
  res.json({ status: true, message: 'Image uploaded successfully', imageUrl: imageUrl });
});

// Start the server
server.listen(8080, function check(error) {
  if (error) {
    console.log('Error.......!!!');
  } else {
    console.log('Started on localhost:8080....!!');
  }
});
