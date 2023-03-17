/*********************************************************************************
*  WEB322 – Assignment 05
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part of this
*  assignment has been copied manually or electronically from any other source (including web sites) or 
*  distributed to other students.
* 
*  Name: Rohan Kashyap Student ID: 158391201 Date: 17 March 2023
*
*  Cyclic Web App URL: ________________________________________________________
*
*  GitHub Repository URL: ______________________________________________________
*
********************************************************************************/ 

const express = require('express')
const app = express()
const path = require('path');
const multer = require("multer");
const exphbs = require('express-handlebars')
const cloudinary = require('cloudinary').v2
const streamifier = require('streamifier')
const stripJs = require('strip-js');
const { 
    getPosts, 
    getCategories, 
    getPublishedPosts,
    getPublishedPostsByCategory, 
    initialize, 
    addPost, 
    getPostById, 
    getPostsByCategory, 
    getPostsByMinDate 
} = require('./blog-service')

cloudinary.config({
    cloud_name: 'mtw',
    api_key: '523873693214562',
    api_secret: 'tmviDLH-5JTBKhZ1cSvE_3f5eYI',
    secure: true
});

app.engine('.hbs', exphbs.engine({ 
    extname: '.hbs', 
    defaultLayout: "main",
    helpers : {
        navLink: function(url, options) {
            return '<li' +
            ((url == app.locals.activeRoute) ? ' class="active" ' : '') +
            '><a href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3)
            throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        },
        safeHTML: function(context){
            return stripJs(context);
        }
    }

}));
app.set('view engine', '.hbs');
app.set('views', './views');

const upload = multer();

app.use(express.static('public'));

app.use(function(req,res,next){
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    app.locals.viewingCategory = req.query.category;
    next();
});

app.get('/',(req,res) => {
    res.redirect('/blog')
})

app.get('/about',function(req,res) {
    res.render('about');
});

app.get('/posts/add',function(req,res) {
    res.render('addPost');
});

app.post('/posts/add',upload.single("featureImage"),function(req,res) {
    let streamUpload = (req) => {
        return new Promise((resolve, reject) => {
                let stream = cloudinary.uploader.upload_stream((error, result) => {
                    if (result) {
                        resolve(result);
                    } else {
                        reject(error);
                    }
                }
            );
            streamifier.createReadStream(req.file.buffer).pipe(stream);
        });
    };

    async function upload(req) {
        let result = await streamUpload(req);
        console.log(result);
        return result;
    }

    upload(req).then((uploaded)=> {

        req.body.featureImage = uploaded.url;
        const { title, body, category, published, featureImage  } = req.body;
        postData = {
            title, body, category, published, featureImage
        }
        addPost(postData).then((data) => {
            res.json(data)
        }).catch((err)=> {
            console.log(err);
        })
    });
});


app.get('/blog', async (req, res) => {
    let viewData = {};

    try{
        let posts = [];
        if(req.query.category){
            posts = await getPublishedPostsByCategory(req.query.category);
        }else{
            posts = await getPublishedPosts();
        }
        posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));
        let post = posts[0]; 
        viewData.posts = posts;
        viewData.post = post;

    }catch(err){
        viewData.message = "Results Not Found";
    }
    try{
        let categories = await getCategories();
        viewData.categories = categories;
    }catch(err){
        viewData.categoriesMessage = "Results Not Found"
    }
    res.render("blog", {data: viewData})
});

app.get('/blog/:id', async (req, res) => {
    let viewData = {};

    try{
        let posts = [];

        if(req.query.category){
            posts = await getPublishedPostsByCategory(req.query.category);
        }else{
            posts = await getPublishedPosts();
        }
        posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));
        viewData.posts = posts;

    }catch(err){
        viewData.message = "Results Not Found";
    }

    try{
        const post = await getPostById(req.params.id);
        viewData.post = post[0]
    }catch(err){
        viewData.message = "Results Not Found"; 
    }

    try{
        let categories = await getCategories();
        viewData.categories = categories;
    }catch(err){
        viewData.categoriesMessage = "Results Not Found"
    }
  
    res.render("blog", {data: viewData})
});


app.get('/posts', async (req,res)=> {
    if(req.query.category != null){
        getPostsByCategory(req.query.category).then((posts) => {
            res.render('posts',{ posts })
        }).catch((err)=> {
            res.render("posts", {message: "Results Not Found"});
        })
    }

    if(req.query.minDate != null){
        getPostsByMinDate(req.query.minDate).then((posts) => {
            res.render('posts',{ posts })
        }).catch((err)=> {
            res.render("posts", {message: "Results Not Found"});
        })
    }

    getPosts().then((posts) => {
        res.render('posts',{ posts })
    }).catch((err)=> {
        res.render("posts", {message: "Results Not Found"});
    })
})

app.get('/posts/:value', async (req,res)=> {
    getPostById(req.params.value).then((posts) => {
        res.json(posts);
    }).catch((err)=> {
        console.log(err);
    })
})

app.get('/categories', async (req,res)=> {
    getCategories().then((categories) => {
        res.render('categories',{ categories })
    }).catch((err)=> {
        res.render("categories", {message: "Results Not Found"});
    })
})

app.use((req, res) => {
    res.status(404).render("404")
})

const port = process.env.PORT || 8080

initialize().then(({msg}) => {
    app.listen(port, () => console.log(`${msg}!, Server is Running on port ${port}`))
}).catch((err)=> {
    console.log(err);
})

