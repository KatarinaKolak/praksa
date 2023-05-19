import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import fs from'fs';
import excelJS from 'exceljs';
const app = express();
const port = 3000;

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

function getColumn1Style(ws, cell){
    ws.getCell(cell).alignment = {
        vertical: 'middle', horizontal: 'center',
        wrapText: true
    };

    ws.getCell(cell).border = {
        top: {style:'medium', color: {argb:'000'}},
        left: {style:'medium', color: {argb:'000'}},
        bottom: {style:'medium', color: {argb:'000'}},
        right: {style:'medium', color: {argb:'000'}}
      };

    ws.getCell(cell).fill = {
        type: 'pattern',
        pattern:'solid',
        fgColor:{argb:'eeeeee'}
    };

    ws.getCell(cell).font = {
        bold: true
    };
}

function getRow1Style(ws, cell, align){
    ws.getCell(cell).alignment = {
        vertical: 'middle', horizontal: align,
        wrapText: true
    };

    ws.getCell(cell).border = {
        bottom: {style:'medium', color: {argb:'000'}},
        right: {style:'thin', color: {argb:'000'}}
      };

    ws.getCell(cell).font = {
        color: { argb: 'ff0000'}
    };
}

function getRow2Style(ws, cell, align){
    ws.getCell(cell).alignment = {
        vertical: 'middle', horizontal: align,
        wrapText: true
    };

    ws.getCell(cell).border = {
        top: {style:'thin', color: {argb:'000'}},
        left: {style:'thin', color: {argb:'000'}},
        bottom: {style:'thin', color: {argb:'000'}},
        right: {style:'thin', color: {argb:'000'}}
    };

    ws.getCell(cell).font = {
        color: { argb: 'ff0000'}
    };
}


function setWidth(ws){
    ws.columns = [
        { header: '', key: 'A', width: 7 },
        { header: '', key: 'B', width: 19 },
        { header: '', key: 'C', width: 22 },
        { header: '', key: 'D', width: 22 },
        { header: '', key: 'E', width: 7 },
        { header: '', key: 'F', width: 9 },
        { header: '', key: 'G', width: 8 },
        { header: '', key: 'H', width: 11 },
        { header: '', key: 'I', width: 11 },
        { header: '', key: 'J', width: 11 },
        { header: '', key: 'K', width: 9 },
        { header: '', key: 'L', width: 9 },
        { header: '', key: 'M', width: 9 },
        { header: '', key: 'N', width: 9 },
        { header: '', key: 'O', width: 9 },
        { header: '', key: 'P', width: 9 }
    ];

}

function getIndexStyle(ws, index, i){
    ws.getCell(index).value = i;

        ws.getCell(index).alignment = {
            vertical: 'middle', horizontal: 'center',
            wrapText: true
        };

        ws.getCell(index).border = {
            top: {style:'thin', color: {argb:'000'}},
            left: {style:'thin', color: {argb:'000'}},
            bottom: {style:'thin', color: {argb:'000'}},
            right: {style:'thin', color: {argb:'000'}}
        };

        ws.getCell(index).font = {
            color: { argb: '000000'}
        }
}

function getLastRowStyle(ws, cell, align){
    ws.getCell(cell).alignment = {
        vertical: 'middle', horizontal: align,
        wrapText: true
    };

    ws.getCell(cell).border = {
        top: {style:'medium', color: {argb:'000'}},
        left: {style:'medium', color: {argb:'000'}},
        bottom: {style:'medium', color: {argb:'000'}},
        right: {style:'medium', color: {argb:'000'}}
    };

    ws.getCell(cell).font = {
        bold: true
    };
}

/**************************** drugi zadatak **********************************/


app.post('/createExcel', cors(), (req, res)=>{
    const fileName = 'nalog.xlsx';   
    const wb = new excelJS.Workbook();
    const ws = wb.addWorksheet('Sheet1');

    setWidth(ws);
    
    const imageId = wb.addImage({ // adding logo
        filename: `./logo.png`,
        extension: 'png',
    });

    ws.addImage(imageId, { tl: { col: 0, row:  0}, ext: { width: 170,height: 90 }});

    ws.mergeCells('A5:C5'); // adding subject 
    ws.getCell('A5').value = {
        'richText': [
            {'font': {'color': {argb: '000000'}},'text': 'Predmet: '},
            {'font': {'color': {argb: 'ff0000'}},'text': 'naziv predmeta sa sifrom'}
        ]
    }

    ws.mergeCells('A6:I11'); // adding lorem ipsum
    ws.getCell('A6').value = {
        'richText': [
            {'font': {'size': 14,'color': {argb: '000000'}, bold: true, 'alignment': {'vertical': 'middle', 'horizontal': 'center'}},'text': 'NALOG ZA ISPLATU\r\n'},
            {'font': {'color': {argb: '000000'}},'text': 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'}
        ]
    };
    ws.getCell(`A6`).alignment = {
        vertical: 'middle', horizontal: 'left',
        wrapText: true
    };

    /*tablica*/

    ws.mergeCells('A12:B12');
    ws.getCell('A12').value = 'Katedra';
    getColumn1Style(ws, 'A12');

    ws.getCell('C12').value = 'Studij';
    getColumn1Style(ws, 'C12');

    ws.getCell('D12').value = 'ak. god.';
    getColumn1Style(ws, 'D12');

    ws.getCell('E12').value = 'stud. god.';
    getColumn1Style(ws, 'E12');

    ws.getCell('F12').value = 'početak turnusa';
    getColumn1Style(ws, 'F12');

    ws.getCell('G12').value = 'kraj turnusa';
    getColumn1Style(ws, 'G12');

    ws.mergeCells('H12:I12');
    ws.getCell('H12').value = 'br sati predviđen programom';
    getColumn1Style(ws, 'H12');

    const row = ws.getRow(12);
    row.height = 75;

    ws.mergeCells('A13:B13');
    ws.getCell('A13').value = 'Katedra';
    getRow1Style(ws, 'A13', "center");

    ws.getCell('C13').value = 'Studiji';
    getRow1Style(ws, 'C13', "left");

    ws.getCell('D13').value = '2022./2023.';
    getRow1Style(ws, 'D13', "left");

    ws.getCell('E13').value = 'npr. 1';
    getRow1Style(ws, 'E13', "left");

    ws.getCell('F13').value = 'datum';
    getRow1Style(ws, 'F13', "left");

    ws.getCell('G13').value = 'datum';
    getRow1Style(ws, 'G13', "left");

    ws.mergeCells('H13:I13');
    ws.getCell('H13').value = {
        'richText': [
            {'text': 'P:'},
            {'font': {'color': {argb: 'FF0000'}},'text': ' XY'},
            {'text': ' S:'},
            {'font': {'color': {argb: 'FF0000'}},'text': ' XY'},
            {'text': ' V:'},
            {'font': {'color': {argb: 'FF0000'}},'text': ' XY'}
        ]
    };

    ws.getCell('H13').alignment = {
        vertical: 'middle', horizontal: 'center',
        wrapText: true
    };

    ws.getCell('H13').border = {
        bottom: {style:'medium', color: {argb:'000'}},
        right: {style:'medium', color: {argb:'000'}}
    };

    ws.mergeCells('A15:A16');
    ws.getCell('A15').value = 'Redni broj';
    getColumn1Style(ws, 'A15');

    ws.mergeCells('B15:B16');
    ws.getCell('B15').value = 'Nastavnik/Suradnik';
    getColumn1Style(ws, 'B15');

    ws.mergeCells('C15:C16');
    ws.getCell('C15').value = 'Zvanje';
    getColumn1Style(ws, 'C15');

    ws.mergeCells('D15:D16');
    ws.getCell('D15').value = 'Status';
    getColumn1Style(ws, 'D15');

    ws.mergeCells('E15:G15');
    ws.getCell('E15').value = 'Sati nastave';
    getColumn1Style(ws, 'E15');
    ws.getCell('E16').value = 'pred';
    getColumn1Style(ws, 'E16');
    ws.getCell('F16').value = 'sem';
    getColumn1Style(ws, 'F16');
    ws.getCell('G16').value = 'vjež';
    getColumn1Style(ws, 'G16');

    ws.mergeCells('H15:H16');
    ws.getCell('H15').value = 'Bruto satnica predavanja (EUR)';
    getColumn1Style(ws, 'H15');

    ws.mergeCells('I15:I16');
    ws.getCell('I15').value = 'Bruto satnica seminar (EUR)';
    getColumn1Style(ws, 'I15');

    ws.mergeCells('J15:J16');
    ws.getCell('J15').value = 'Bruto satnica vježbe (EUR)';
    getColumn1Style(ws, 'J15');

    ws.mergeCells('K15:M15');
    ws.getCell('K15').value = 'Bruto iznos';
    getColumn1Style(ws, 'K15');
    ws.getCell('K16').value = 'pred';
    getColumn1Style(ws, 'K16');
    ws.getCell('L16').value = 'sem';
    getColumn1Style(ws, 'L16');
    ws.getCell('M16').value = 'vjež';
    getColumn1Style(ws, 'M16');

    ws.mergeCells('N15:N16');
    ws.getCell('N15').value = 'Ukupno za isplatu (EUR)';
    getColumn1Style(ws, 'N15');
    const row2 = ws.getRow(16);
    row2.height = 105;

    var index = 17;
    // for 
    for(let i = 1; i < 9; i++){
        ws.getCell('A' + index).value = i; // 1.
        getIndexStyle(ws, 'A' + index, i);

        getRow1Style(ws, 'B' + index, "left");
        getRow1Style(ws, 'C' + index, "left");
        getRow1Style(ws, 'D' + index, "left");
        getRow1Style(ws, 'E' + index, "center");
        getRow1Style(ws, 'F' + index, "center");
        getRow1Style(ws, 'G' + index, "center");
        getRow1Style(ws, 'H' + index, "left");
        getRow1Style(ws, 'I' + index, "left");
        getRow1Style(ws, 'J' + index, "left");
        getRow1Style(ws, 'K' + index, "right");
        getRow1Style(ws, 'L' + index, "right");
        getRow1Style(ws, 'M' + index, "right");
        getRow1Style(ws, 'N' + index, "right");
        
        index++;
    }

    ws.mergeCells('A' + index + ':C' + index);
    ws.getCell('A' + index + ':C' + index).value = 'UKUPNO';
    getLastRowStyle(ws, 'A' + index + ':C' + index, "center");

    getLastRowStyle(ws, 'D' + index, "center");

    getLastRowStyle(ws, 'E' + index, "center");
    getLastRowStyle(ws, 'F' + index, "center");
    getLastRowStyle(ws, 'G' + index, "center");
    getLastRowStyle(ws, 'H' + index, "center");
    getLastRowStyle(ws, 'I' + index, "center");
    getLastRowStyle(ws, 'J' + index, "center");
    getLastRowStyle(ws, 'K' + index, "right");
    getLastRowStyle(ws, 'L' + index, "right");
    getLastRowStyle(ws, 'M' + index, "right");
    getLastRowStyle(ws, 'N' + index, "right");
	
    ws.mergeCells('A' + (index + 3) +':C' + (index + 4));
    ws.getCell('A' + (index + 3)).value = {
        'richText': [
            {'text': 'Prodekanica za nastavu i studentska pitanja\r\nProf. dr. sc.'},
            {'font': {'color': {argb: 'FF0000'}},'text': ' Ime Prezime'}
        ]
    };
    ws.getCell('A' + (index + 3)).alignment = {
        vertical: 'middle', horizontal: 'left',
        wrapText: true
    };

    ws.mergeCells('A' + (index + 9) +':C' + (index + 10));
    ws.getCell('A' + (index + 9)).value = {
        'richText': [
            {'text': 'Prodekan za financije i upravljanje\r\nProf. dr. sc.'},
            {'font': {'color': {argb: 'FF0000'}},'text': ' Ime Prezime'}
        ]
    };

    ws.getCell(`A` + (index + 9)).alignment = {
        vertical: 'middle', horizontal: 'left',
        wrapText: true
    };

    ws.mergeCells('J' + (index + 9) +':L' + (index + 10));
    ws.getCell('J' + (index + 9)).value = {
        'richText': [
            {'text': 'Dekan\r\nProf. dr. sc.'},
            {'font': {'color': {argb: 'FF0000'}},'text': ' Ime Prezime'}
        ]
    };
    ws.getCell(`J` + (index + 9)).alignment = {
        vertical: 'middle', horizontal: 'left',
        wrapText: true
    };

    wb.xlsx.writeFile(fileName).then(() => {
        console.log('File created');
    }).catch(err => {
        console.log(err.message);
    });
})

app.listen(port, ()=>{
    console.log("Running on port " + port); 
})