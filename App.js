const express = require('express');
const bodyParser =require('body-parser')
const morgan = require('morgan');
const multer = require('multer')
const app = express();
const port = 3002;
const path = require('path')





app.set('view engine', 'ejs'); // Set EJS as the view engine
app.set('views');

const admin = require('firebase-admin')
const credentials = require('./key.json');

const { log, Console } = require('console');

// initialize admin
admin.initializeApp({
    credential: admin.credential.cert(credentials),
    storageBucket: "employee-management-8ebeb.appspot.com",
})

const db = admin.firestore()


// app.use(express.json())
// app.use(express.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static('public'))


//config muleter for file uploads
const storageMulter = multer.memoryStorage();
const upload = multer({ storage: storageMulter });


const image = "https://www.bing.com/images/search?view=detailV2&ccid=oJiCZZQy&id=954E0960F0E378C12DBCD46581BAE263E055C5AB&thid=OIP.oJiCZZQyKjj1EZHGbQUUhwHaFj&mediaurl=https%3a%2f%2fcdnassets.hw.net%2f42%2fd1%2f9b178efd4166a4e3ebfb47d32ef1%2ffemale-construction-worker.jpg&cdnurl=https%3a%2f%2fth.bing.com%2fth%2fid%2fR.a098826594322a38f51191c66d051487%3frik%3dq8VV4GPiuoFl1A%26pid%3dImgRaw%26r%3d0&exph=1500&expw=2000&q=workers&simid=608015297763614753&FORM=IRPRST&ck=11ABC562D3AAD404AC39EAB849CA42F6&selectedIndex=23"


console.log('hello')

// middleware
app.use(morgan('dev'))

//middleware for static files

//create a post
app.post('/form',upload.single('image'), async (req, res) => {
    // res.render('Form', { title: 'Form' });
    console.log(req.body.name);
    try {

        const bucket = admin.storage().bucket()
        const file = bucket.file(req.file.originalname)
        const result = await file.createReadStream().end(req.file.buffer)
        const downloadUrl = await file.getSignedUrl({
            action:'read',
            expires : '21-12-2025'
  
        })
        console.log(result);

        // const imgJson ={
        //     imageUrl: downloadUrl[0]
        // }
        // const employeeJson = {
        //     name: req.body.name,
        //     idNumber: req.body.idNumber,
        //     email: req.body.email,
        //     employeePosition: req.body.employeePosition,
        //     phoneNumber: req.body.phoneNumber,
        //     image: downloadUrl[0]

        // }
        // console.log(employeeJson)
        // // console.log(raq.params);
        // // console.log(req.body)
        // // console.log(req.query);
        // const response = await db.collection('employees').add(employeeJson)
        // .then((data) => {
        //    console.log(data)
        //     res.redirect('/form')
        //     console.log('added')
        // }).catch((error) => {
        //         console.log(error);
        // })
        // res.send(response)
    } catch (error) {
        console.log('imageErr');
        res.send(error)
    }
});

//Getting data in the form page
app.get('/form', async (req, res) => {
    try {
        const employeeRef = db.collection('employees');
        const response = await employeeRef.get();
        let responseArray = [];
        response.forEach((results) => {
            responseArray.push({ ...results.data(), image: image, id: results.id })
        })
        // console.log(responseArray)
        res.render('form', { title: 'form', responseArray });

        // res.status(200).send(responseArray)

    } catch (error) {
        console.log(error);
    }
})

//read data 
app.get('/', async (req, res) => {
    try {
        const employeeRef = db.collection('employees');
        const response = await employeeRef.get();
        let responseArray = [];
        response.forEach((results) => {
            responseArray.push({ ...results.data(), image: image, id: results.id })
        })
        res.render('View', { title: 'home', responseArray })
        // res.status(200).send(responseArray)

    } catch (error) {
        console.log(error);
    }
})

//Delete an employee
app.delete('/delete/:id', async (req, res) => {
    try {
        const response = await db.collection('employees').doc(req.params.id).delete();
        res.send(response)
        console.log('employee deleted')


    } catch (error) {
        console.log(error);
        res.send(error)
    }
})

//update an employee
app.put('/update/:id', (req, res) => {
    const id = req.params.id;
    console.log(req.params.id);
    const updateData = {
        name: req.body.name,
        idNumber: req.body.idNumber,
        email: req.body.email,
        employeePosition: req.body.employeePosition,
        phoneNumber: req.body.phoneNumber,
    }
    console.log(updateData);

    db.collection('employees').doc(id).update(updateData).then(() => {
        console.log(" successefully updated")
        res.send(updated)
    }).catch((error) => {
        console.log(error);
        res.send(error)
    })
})

app.get('/', (req, res) => {
    res.render('View');
});

app.get('/form', (req, res) => {
    res.render('form');
});


app.use((req, res) => {
    res.status(404).render('404', { title: '404' })
})


app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});