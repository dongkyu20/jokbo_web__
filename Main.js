const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const FileStore = require('session-file-store')(session);
const path = require('path');
const fs = require('fs');
const mysql = require('mysql2');

const authRouter = require('./lib_login/auth');
const authCheck = require('./lib_login/authCheck.js');
const template = require('./lib_login/template.js');

const app = express();
const port = 3000;

const sessionDir = path.join(__dirname, 'sessions');

if (!fs.existsSync(sessionDir)){
    fs.mkdirSync(sessionDir, { recursive: true });
}

const fileStoreOptions = {
  path: sessionDir,
  logFn: function(logMessage) {
    console.log(logMessage);
  }
};

// MySQL 연결 설정
const db = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: '3604',
  database: 'jokbo_db'
});

db.connect((err) => {
  if (err) {
    console.error('MySQL 연결 오류:', err);
  } else {
    console.log('MySQL 연결 성공');
  }
});

app.use('/home_css', express.static(path.join(__dirname, 'home_css')));
app.use('/public', express.static(path.join(__dirname, 'public')));  // 정적 파일 제공 설정
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
  secret: '~~~',
  resave: false,
  saveUninitialized: true,
  store: new FileStore(fileStoreOptions),
}));

function loginRequired(req, res, next) {
  if (!req.session.is_logined) {
    return res.status(401).send('로그인이 필요합니다.');
  }
  next();
}

app.get('/', (req, res) => {
  res.redirect('/main');
});

app.use('/auth', authRouter);

app.get('/main', (req, res) => {
  let authStatusUI = authCheck.statusUI(req, res);
  let bodyContent = '';

  if (authCheck.isOwner(req, res)) {
    bodyContent = `<hr>
    <h2>로그인 성공</h2>
    <a href="/mypage">마이페이지로 이동</a>`; 
  } else {
    bodyContent = `<hr>
    <h2>비로그인 상태입니다.</h2>`;
  }

  let html = template.HTML('Welcome', bodyContent, authStatusUI);
  res.send(html);
});

app.get('/mypage', loginRequired, (req, res) => {
  const query = 'SELECT username, school FROM usertable WHERE id = ?';
  db.query(query, [req.session.userId], (err, results) => {
    if (err) {
      console.error('MySQL 쿼리 오류:', err);
      return res.status(500).send('데이터베이스 오류');
    }

    if (results.length > 0) {
      const user = {
        name: results[0].username,
        school: results[0].school,
        profileImage: '/public/profile-image.png'  // 고정 프로필 이미지 경로
      };

      let authStatusUI = authCheck.statusUI(req, res);
      let html = template.HTML('My Page', template.myPage(user), authStatusUI);
      res.send(html);
    } else {
      res.status(404).send('사용자 정보를 찾을 수 없습니다.');
    }
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
