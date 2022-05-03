var express = require('express');
var router = express.Router();
const PM25Controller = require("../controller/controller");

const multer = require('multer')
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads')
    },
    filename: (req, file, cb) => {
        cb(null, 'file-' + Date.now() + '.' +
        file.originalname.split('.')[file.originalname.split('.').length-1])}
})

const upload = multer({ storage: storage })

router.get('/', function(req, res, next) {
  res.render('index' ,{ title: "PM25" });
});

router.get('/uploads', function(req, res, next) {
  res.render('uploads', { title: "PM25" , message : "" });
});

router.post('/uploads', upload.single('fileupload'), async (req, res) => {
  let filename = req.file.filename
  const { message , error } = await new PM25Controller().getdata(filename) 

  if (error) {
      res.status(400).json({ message : message });
  } else {
    console.log(filename)
    res.render('uploads', { title: "PM25" , message : message});
  }
});

router.get('/perform', function(req, res, next) {
  res.render('perform', { title: "Perform the following queries" , message : "" });
});

router.post('/perform', async (req, res) => {
  let select = req.body.queries
  let country_input = req.body.country_input
  let year_input = req.body.year_input
  let color_pm25 = req.body.color_pm25
  const { result, message, error } = await new PM25Controller().performQuerie(select, country_input, year_input, color_pm25);

  if (error) {
      res.status(400).json({ message : message });
  } else { 
    // console.log(result, message)
    res.download("./download/" + select + "/" + result);
  }
});

router.get("/pm25multipoint", async (req, res) => {
  let queries = req.query.queries
  let year_input = req.query.year_input
  console.log("queries : " +queries)
  console.log("year_input : " + year_input)
  if (queries === undefined && year_input === undefined) {
    console.log("undefined")
    const { result, message, error } = await new PM25Controller().getPM25point(queries, year_input);
  
    if (error) {
      res.status(400).json({ message: message, result: result });
    } else {
      res.status(200).json({ message: message, result: result });
    }
  }
  else if (queries == "" && year_input == "") {
    console.log("undefined")
    const { result, message, error } = await new PM25Controller().getPM25point(queries, year_input);
  
    if (error) {
      res.status(400).json({ message: message, result: result });
    } else {
      res.status(200).json({ message: message, result: result });
    }
  }
  else if (queries != null && year_input == "") {
    if (queries == "b" && year_input == "") {
      console.log("b")
      const { result, message, error } = await new PM25Controller().getPM25point(queries, year_input);

      if (error) {
        res.status(400).json({ message: message, result: result });
      } else {
        res.status(200).json({ message: message, result: result });
      }
    }
    if (queries == "c" && year_input == "") {
      console.log("c")
      const { result, message, error } = await new PM25Controller().getPM25point(queries, year_input);

      if (error) {
        res.status(400).json({ message: message, result: result });
      } else {
        res.status(200).json({ message: message, result: result });
      }
    }
    if (queries == "d" && year_input == "") {
      console.log("d")
      const { result, polygon, message, error } = await new PM25Controller().getPM25pointnoD(queries);
      if (error) {
        res.status(400).json({ polygon: polygon, message: message, result: result });
      } else {
        res.status(200).json({ polygon: polygon, message: message, result: result });
      }
    }
    if (queries == "e" && year_input == "") {
      console.log("e")
      const { result, message, error } = await new PM25Controller().getPM25point(queries, year_input);

      if (error) {
        res.status(400).json({ message: message, result: result });
      } else {
        res.status(200).json({ message: message, result: result });
      }
    }
  }
  else if (queries != "" && year_input !== "") {
    if (queries == "a" && year_input !== "") {
      console.log("a")
      const { result, message, error } = await new PM25Controller().getPM25point(queries, year_input);

      if (error) {
        res.status(400).json({ message: message, result: result });
      } else {
        res.status(200).json({ message: message, result: result });
      }
    }
    if (queries == "f" && year_input !== "") {
      console.log("f")
      const { result, message, error } = await new PM25Controller().getPM25point(queries, year_input);

      if (error) {
        res.status(400).json({ message: message, result: result });
      } else {
        res.status(200).json({ message: message, result: result });
      }
    }
  }
});


module.exports = router;
