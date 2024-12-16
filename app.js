const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const methodOverride = require('method-override'); 
app.use(methodOverride('_method'));


const dbURI = "mongodb://localhost:27017/App";
mongoose.connect(dbURI)
  .then(result => app.listen(3000, () => console.log('Server is running on http://localhost:3000 and Conneted to the Data Base')))
  .catch(err => console.log(err));


app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));


const Schema = mongoose.Schema;


const blogSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  snippet: {
    type: String,
    required: true
  },
  body: {
    type: String,
    required: true
  },
  email: {
    type: String,  
    required: false  
  }
}, { timestamps: true });

const Blog = mongoose.model('Blog', blogSchema);



app.get('/', (req, res) => {
  res.redirect('/blogs');
});


app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, '/views/about.html'));
});


app.get('/blogs', (req, res) => {
  Blog.find().sort({ createdAt: -1 })
    .then(result => {
      res.render('index', { blogs: result, title: 'All Blogs' });
    })
    .catch(err => {
      console.log(err);
    });
});

app.get('/blogs/create', (req, res) => {
  res.sendFile(path.join(__dirname, '/views/create.html'));
});


app.post('/blogs', (req, res) => {
  const blog = new Blog(req.body);
  blog.save()
    .then(result => {
      res.redirect('/blogs');
    })
    .catch(err => {
      console.log(err);
    });
});


app.get('/blogs/:id', (req, res) => {
  const id = req.params.id;
  Blog.findById(id)
    .then(result => {
      res.render('details', { blog: result, title: 'Blog Details' });
    })
    .catch(err => {
      console.log(err);
      res.sendFile(path.join(__dirname, '/views/404.html'));
    });
});

app.delete('/blogs/:id', (req, res) => {
  const id = req.params.id;
  Blog.findByIdAndDelete(id)
    .then(result => {
      res.json({ redirect: '/blogs' });
    })
    .catch(err => {
      console.log(err);
    });
});


app.put('/blogs/:id', (req, res) => {
  const id = req.params.id;
  Blog.findByIdAndUpdate(id, req.body, { new: true })
    .then(result => {
      res.redirect(`/blogs/${id}`);  
    })
    .catch(err => {
      console.log(err);
      res.sendFile(path.join(__dirname, '/views/404.html'));
    });
});


app.get('/blogs/:id/edit', (req, res) => {
  const id = req.params.id;
  Blog.findById(id)
    .then(result => {
      res.render('edit', { blog: result, title: 'Edit Blog' });
    })
    .catch(err => {
      console.log(err);
      res.sendFile(path.join(__dirname, '/views/404.html'));
    });
});



app.use((req, res) => {
  res.sendFile(path.join(__dirname, '/views/404.html'));
});

