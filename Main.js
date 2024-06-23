const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const FileStore = require('session-file-store')(session);
const path = require('path');
const db = require('./lib_login/db');
const multer = require('multer');
const fs = require('fs');

const authRouter = require('./lib_login/auth');
const authCheck = require('./lib_login/authCheck.js');
const template = require('./lib_login/template.js');

const app = express();
const port = 3000;

app.use('/home_css', express.static(path.join(__dirname, 'home_css')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
  secret: 'secret key', // 원하는 문자 입력
  resave: false,
  saveUninitialized: true,
  store: new FileStore(),
}));

// 업로드 디렉토리 설정
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Multer 설정
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

app.get('/', (req, res) => {
  res.redirect('/main');
});

// 인증 라우터
app.use('/auth', authRouter);

// 메인 페이지
app.get('/main', (req, res) => {
  let authStatusUI = authCheck.statusUI(req, res);
  let bodyContent = '';

  if (authCheck.isOwner(req, res)) {
    bodyContent = `
    <h2>로그인 성공</h2>`;
  } else {
    bodyContent = `
    <h2>비로그인 상태입니다.</h2>`;
  }

  let html = template.HTML('Welcome', bodyContent, authStatusUI);
  res.send(html);
});


app.get('/lecture', (req, res) => {
  let authStatusUI = authCheck.statusUI(req, res);
  db.query('SELECT * FROM lectures', (error, results) => {
    if (error) throw error;
    let bodyContent = `<h2>강의</h2>`;
    results.forEach(lecture => {
      bodyContent += `<div><a href="/lecture/${lecture.id}"><h3>${lecture.title}</h3></a><hr></div>`;
    });
    bodyContent += `<a href="/lecture/upload">업로드</a>`
    let html = template.HTML('Lecture', bodyContent, authStatusUI);
    res.send(html);
  });
});

app.get('/lecture/upload', (req, res) => {
  let authStatusUI = authCheck.statusUI(req, res);
  let bodyContent = `
    <h2>File Upload Form</h2>
    <form action="/lecture/upload" method="post" enctype="multipart/form-data">
      <label for="title">title:</label>
      <input type="text" id="title" name="title" required><br><br>
      <label for="price">Price:</label>
      <input type="number" id="price" name="price" step="1" required><br><br>
      <label for="subject">Subject:</label>
      <input type="text" id="subject" name="subject" required><br><br>
      <label for="school">school:</label>
      <input type="text" id="school" name="school" required><br><br>
      <label for="professor">Professor:</label>
      <input type="text" id="professor" name="professor" required><br><br>
      <label for="file">File:</label>
      <input type="file" id="file" name="file" required><br><br>
      <button type="submit">Upload</button>
    </form>`;
  let html = template.HTML('Upload', bodyContent, authStatusUI);
  res.send(html);
});


// 파일 업로드 처리
app.post('/lecture/upload', upload.single('file'), (req, res) => {
  const { title, price, subject, school, professor } = req.body;
  const author = authCheck.resUsername(req, res);
  const file_path = req.file.path;
  const upload_date = new Date();

  db.query(
    'INSERT INTO lectures (title, author, upload_date, file_path, price, subject, school, professor) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [ title, author, upload_date, file_path, price, subject, school, professor],
    (error, results) => {
      if (error) throw error;
      res.redirect('/main');
    }
  );
});

app.get('/lecture/:id', (req, res) => {
  let authStatusUI = authCheck.statusUI(req, res);
  const lectureId = req.params.id;

  db.query('SELECT * FROM lectures WHERE id = ?', [lectureId], (error, results) => {
    if (error) throw error;

    if (results.length > 0) {
      const lecture = results[0];
      let bodyContent = `
        <h2>${lecture.title}</h2>
        <p><strong>Author:</strong> ${lecture.author}</p>
        <p><strong>Upload Date:</strong> ${lecture.upload_date}</p>
        <p><strong>Price:</strong> ${lecture.price}</p>
        <p><strong>Subject:</strong> ${lecture.subject}</p>
        <p><strong>School:</strong> ${lecture.school}</p>
        <p><strong>Professor:</strong> ${lecture.professor}</p>
        <a href="/download/${lecture.id}">Download File</a>
        <hr>`;
      let html = template.HTML('Lecture Details', bodyContent, authStatusUI);
      res.send(html);
    } else {
      res.send('Lecture not found');
    }
  });
});


app.get('/download/:id', (req, res) => {
  const lectureId = req.params.id;

  db.query('SELECT file_path FROM lectures WHERE id = ?', [lectureId], (error, results) => {
    if (error) throw error;

    if (results.length > 0) {
      const filePath = results[0].file_path;
      res.download(filePath, (err) => {
        if (err) {
          console.log('Error downloading file:', err);
          res.status(500).send('Error downloading file');
        }
      });
    } else {
      res.send('File not found');
    }
  });
});




app.get('/jokbo', (req, res) => {
  let authStatusUI = authCheck.statusUI(req, res);
  let bodyContent = '';

  bodyContent = `
  <h2>족보</h2>`;

  let html = template.HTML('Welcome', bodyContent, authStatusUI);
  res.send(html);
});

app.get('/assignment', (req, res) => {
  let authStatusUI = authCheck.statusUI(req, res);
  let bodyContent = '';

  bodyContent = `
  <h2>과제</h2>`;

  let html = template.HTML('Welcome', bodyContent, authStatusUI);
  res.send(html);
});

app.get('/note', (req, res) => {
  let authStatusUI = authCheck.statusUI(req, res);
  let bodyContent = '';

  bodyContent = `
  <h2>필기노트</h2>`;

  let html = template.HTML('Welcome', bodyContent, authStatusUI);
  res.send(html);
});




app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
