import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import fs from'fs';

const app = express();
const port = 3000;
//var data = fs.readFileSync('data.json');

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json({type: 'application/json'}));

// GET = (userID) => po user ID-u da odgovor budu svi podaci o tom user-u
app.get('/user/:id', cors(), (req, res)=>{
    var user = null;

    fs.readFile("data.json", function (err, data) {
        if (err) {
            console.error(err); 
        }

        user = JSON.parse(data).users.filter(function(key) {
            console.log("KEY: ", key);
            return key.id == req.params.id;
        }).reduce(function(obj, key){
             return key;
            
        }, {});

        return res.send(user);
    });
});

// GET = (postID) => po post ID-u da odgovor budu svi podaci o tom post-u
app.get('/post/:id', cors(), (req, res)=>{
    var post = null;
    
    fs.readFile("data.json", function (err, data) {
        if (err) {
            console.error(err); 
        }
        
        post = JSON.parse(data).posts.filter(function(key) {
            return key.id == req.params.id;
        }).reduce(function(obj, key){
             return key;
            
        }, {});

        return res.send(post);
    });
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
app.get('/postByDate/:startDate/:endDate', cors(), (req, res)=>{
    const startDate = req.params.startDate;
    const endDate = req.params.endDate;

    fs.readFile("data.json", function (err, data) {
        if (err) {
            console.error(err); 
        }
        
        var posts = [];
        JSON.parse(data).posts.map((item) => {
            if ((formattedDate(item.last_update) > formattedDate(startDate)) && (formattedDate(item.last_update) < formattedDate(endDate))){
                console.log("ITEMMM: ", item);
                posts.push(item);
            }
        })

        return res.send(posts);
    });
    
});

// POST = (userID, noviEmail) => koji dopusta mijenjanje email-a usera po user ID-u
app.put('/updateEmail/:id', cors(), (req, res)=>{
    let json = JSON.parse(fs.readFileSync('data.json'));

    fs.readFile("data.json", function (err, data) {
        if (err) {
            console.error(err); 
        }

        JSON.parse(data).users.map((item, key) => {
            if ((item.id) === parseInt(req.params.id)){
                item.email = req.body.email;
                json.users[key] = item;
    
                try {
                    fs.writeFileSync("data.json", JSON.stringify(json, null, 2));
                    console.log("Data successfully saved");
                    return res.send(item);
                } catch (error) {
                    console.log("An error has occurred ", error);
                }
            }
        })
    });
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
app.post('/addPost', cors(), (req, res)=>{
    let json = JSON.parse(fs.readFileSync('data.json'));
    let newPost = {"id": parseInt(json.posts.length + 1), "title": req.body.title, "body": req.body.body, "user_id": req.body.userId, "last_update": getCurrentDate()}
    
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