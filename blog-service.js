const fs = require("fs"); 

let Posts = []
let Categories = []

function initialize(){
    Posts = JSON.parse(fs.readFileSync('./data/posts.json').toString());
    Categories = JSON.parse(fs.readFileSync('./data/categories.json').toString());

    return new Promise((resolve, reject)=> {
        if (Posts && Categories) {
            resolve({msg: 'Successful'})
        } else {
            reject({msg: 'Error Reading the File, Try Again'})
        }
    })
}

function getPosts(){
    return new Promise((resolve, reject)=> {
        if (Posts.length != 0) {
            resolve(Posts)
        } else {
            reject({msg: 'No Results Returned'})
        }
    })
}

function getPublishedPosts(){
   return new Promise((resolve, reject)=> {
        if (Posts.length != 0) {
            resolve(Posts.filter(post => post.published == true))
        } else {
            reject({msg: 'Not Found'})
        }
    })
}

function getCategories(){
    return new Promise((resolve, reject)=> {
        if (Categories.length != 0) {
            resolve(Categories)
        } else {
            reject({msg: 'Not FOund'})
        }
    })
}

function addPost(postData){
    return new Promise((resolve, reject)=> {
        if(postData!= null){
            if (postData.published == undefined) {
                postData.published = false
            } 
            postData.id = Posts.length+1;
            postData.postDate = formatDate(new Date())
            Posts.push(postData)
            resolve(postData)
        } else {
            reject({msg: 'Not Found'})
        }
    })
}

function getPostById(id){
    return new Promise((resolve, reject)=> {
         if (Posts.length != 0) {
             resolve(Posts.filter(post => post.id == id))
         } else {
             reject({msg: 'Not Found'})
         }
     })
 }

 function getPostsByCategory(category){
    return new Promise((resolve, reject)=> {
         if (Posts.length != 0) {
             resolve(Posts.filter(post => post.category == category))
         } else {
             reject({msg: 'Not Found'})
         }
     })
 }

 function getPostsByMinDate(minDateStr){
    return new Promise((resolve, reject)=> {
         if (Posts.length != 0) {
             resolve(Posts.filter(post => post.postDate >= minDateStr))
         } else {
             reject({msg: 'Not Found'})
         }
     })
 }

 function getPublishedPostsByCategory(category){
    return new Promise((resolve, reject)=> {
        if (Posts.length != 0) {
            resolve(Posts.filter(post =>  post.published == true && post.category == category))
        } else {
            reject({msg: 'Not Found'})
        }
    })
 }

 function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [year, month, day].join('-');
}

module.exports = { initialize, getPosts, getPublishedPosts, getCategories, addPost, getPostById, getPostsByCategory, getPostsByMinDate, getPublishedPostsByCategory }