const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const FileStore = require('session-file-store')(session);
const path = require('path');

const authRouter = require('./lib_login/auth');
const authCheck = require('./lib_login/authCheck.js');
const template = require('./lib_login/template.js');

const app = express();
const port = 3000;

app.use('/home_css', express.static(path.join(__dirname, 'home_css')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
  secret: 'secret key', // 원하는 문자 입력
  resave: false,
  saveUninitialized: true,
  store: new FileStore(),
}));

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
    bodyContent = `<hr>
    <h2>로그인 성공</h2>`;
  } else {
    bodyContent = `<hr>
    <h2>비로그인 상태입니다.</h2>`;
  }

  let html = template.HTML('Welcome', bodyContent, authStatusUI);
  res.send(html);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
