import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import fs from'fs';

const app = express();
const port = 3000;
const appRouter = express.Router();
var data = fs.readFileSync('data.json');
  
const usersArray = JSON.parse(data).users;
const postsArray = JSON.parse(data).posts;

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json({type: 'application/json'}));

app.use("/app", appRouter);

// GET = (userID) => po user ID-u da odgovor budu svi podaci o tom user-u
appRouter.get('/user/:id', cors(), (req, res)=>{
    const userId = req.params.id;
    
    var user = Object.keys(usersArray).filter(function(key) {
        return usersArray[key].id == userId;
    }).reduce(function(obj, key){
         return usersArray[key];
        
    }, {});

    return res.send(user);
});

// GET = (postID) => po post ID-u da odgovor budu svi podaci o tom post-u
appRouter.get('/post/:id', cors(), (req, res)=>{
    const postId = req.params.id;
    
    var post = Object.keys(postsArray).filter(function(key) {
        return postsArray[key].id == postId;
    }).reduce(function(obj, key){
         return postsArray[key];
        
    }, {});

    return res.send(post);
});

function formattedDate(date){
    var nDate = new Date(date);
    var dd = nDate.getDate();
    var mm = nDate.getMonth()+1; 
    var yyyy = nDate.getFullYear();

    if(dd<10) {
        dd = '0'+dd;
    }
    if(mm<10) {
        mm = '0'+mm;
    }

    var nDate = yyyy + '' + mm + '' + dd ;
    return nDate;

}

// GET = (DatumOd, DatumDo) => po dva datuma da odgovor budu svi post-ovi koji su u range-u ta dva datuma (npr. DatumOd: 2019-01-01, DatumDo: 2019-01-03)
appRouter.get('/postByDate/:startDate/:endDate', cors(), (req, res)=>{
    const startDate = req.params.startDate;
    const endDate = req.params.endDate;

    var posts = [];
    Object.keys(postsArray).map((item)=>{
            if ((formattedDate(postsArray[item].last_update) > formattedDate(startDate)) && (formattedDate(postsArray[item].last_update) < formattedDate(endDate))){
                posts.push(postsArray[item]);
            }
    })
   /* var posts = Object.keys(postsArray).filter(function(key) {
        return new Date(postsArray[key].last_update) > startDate && new Date(postsArray[key].last_update) < endDate;
    }).reduce(function(obj, key){
        obj[key] = postsArray[key];
        return obj;
    }, {});*/

    return res.send(posts);
});

// POST = (userID, noviEmail) => koji dopusta mijenjanje email-a usera po user ID-u
appRouter.post('/updateEmail/:id/:newMail', cors(), (req, res)=>{
    const userId = req.params.id;
    
    let json = JSON.parse(data);

    Object.keys(usersArray).map((item, key) => {
        if (parseInt(usersArray[item].id) === parseInt(userId)){
            usersArray[item].email = req.params.newMail;
            json.users[key] = usersArray[item];

            try {
                fs.writeFileSync("data.json", JSON.stringify(json, null, 2));
                console.log("Data successfully saved");
                return res.send(usersArray[item]);
            } catch (error) {
                console.log("An error has occurred ", error);
            }
        }
    })
    return null;
    
})

function getCurrentDate(){
    let date_ob = new Date();
    let date = ("0" + date_ob.getDate()).slice(-2);
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    let year = date_ob.getFullYear();
    let hours = date_ob.getHours();
    let minutes = date_ob.getMinutes();
    let seconds = date_ob.getSeconds();
    let current = year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds;

    return current;
}

// PUT = (userID, title, body) => koji dopustava kreiranje novog post-a (parametri bi bili; user ID, title, body)
appRouter.put('/addPost/:userId/:title/:body', cors(), (req, res)=>{
    let id = parseInt(Object.keys(postsArray).at(-1)) + 2;
    let newPost = {"id": id, "title": req.params.title, "body": req.params.body, "user_id": req.params.userId, "last_update": getCurrentDate()}
    console.log(newPost);

    let json = JSON.parse(data);

    json.posts.push(newPost);

    try {
        fs.writeFileSync("data.json", JSON.stringify(json, null, 2));
        console.log("Data successfully saved");
    } catch (error) {
        console.log("An error has occurred ", error);
    }

    return res.send(newPost);
})

app.listen(port, ()=>{
    console.log("Running on port " + port); 
})