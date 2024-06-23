var express = require('express');
var router = express.Router();

var template = require('./template.js');
var db = require('./db');

// 로그인 화면
router.get('/login', function (request, response) {
    var title = '로그인';
    var html = template.HTML(title, `
        <style>
            .login-container {
                background-color: white;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                text-align: center;
                width: 300px;
                margin: 0 auto;
                margin-top: 100px;
            }
            .login-title {
                margin-bottom: 20px;
                font-size: 24px;
                color: #333;
            }
            .login-form p {
                margin: 10px 0;
            }
            .login-input {
                width: 100%;
                padding: 10px;
                margin: 5px 0;
                border: 1px solid #ddd;
                border-radius: 5px;
            }
            .login-button {
                width: 100%;
                padding: 10px;
                background-color: #6A679E;
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                transition: background-color 0.3s;
            }
            .login-button:hover {
                background-color: #595787;
            }
            .register-link {
                margin-top: 15px;
            }
            .register-link a {
                display: inline-block;
                padding: 10px 20px;
                border: 2px solid #6A679E;
                color: #6A679E;
                text-decoration: none;
                border-radius: 5px;
                transition: background-color 0.3s, color 0.3s;
            }
            .register-link a:hover {
                background-color: #6A679E;
                color: white;
            }
        </style>
        <div class="login-container">
            <h2 class="login-title">로그인</h2>
            <form action="/auth/login_process" method="post" class="login-form">
                <p><input class="login-input" type="text" name="username" placeholder="아이디"></p>
                <p><input class="login-input" type="password" name="pwd" placeholder="비밀번호"></p>
                <p><input class="login-button" type="submit" value="로그인"></p>
            </form>            
            <p class="register-link">계정이 없으신가요? <a href="/auth/register">회원가입</a></p>
        </div>
    `, '<button class="been-login-button" onclick="location.href=`/auth/login`">로그인</button> | &nbsp; <button class="been-signup-button" onclick="location.href=`/auth/register`">회원가입</button>');
    response.send(html);
});



// 로그인 프로세스
router.post('/login_process', function (request, response) {
    var username = request.body.username;
    var password = request.body.pwd;
    if (username && password) {             // id와 pw가 입력되었는지 확인
        
        db.query('SELECT * FROM usertable WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
            if (error) throw error;
            if (results.length > 0) {       // db에서의 반환값이 있으면 로그인 성공
                request.session.is_logined = true;      // 세션 정보 갱신
                request.session.nickname = username;
                request.session.save(function () {
                    response.redirect(`/`);
                });
            } else {              
                response.send(`<script type="text/javascript">alert("로그인 정보가 일치하지 않습니다."); 
                document.location.href="/auth/login";</script>`);    
            }            
        });

    } else {
        response.send(`<script type="text/javascript">alert("아이디와 비밀번호를 입력하세요!"); 
        document.location.href="/auth/login";</script>`);    
    }
});

// 로그아웃
router.get('/logout', function (request, response) {
    request.session.destroy(function (err) {
        response.redirect('/');
    });
});

// 회원가입 화면
router.get('/register', function(request, response) {
    db.query('SELECT 학교명 FROM school', function(error, schools){
        if (error) throw error;
        var options = '';
        schools.forEach((row) => {
            options += `<option value="${row.학교명}">${row.학교명}</option>`;
        });
        var title = '회원가입';    
        var html = template.HTML(title, `
            <style>
                .register-container {
                    background-color: white;
                    padding: 30px;
                    border-radius: 10px;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                    text-align: center;
                    width: 400px;
                    margin: 0 auto;

                    border: 1px solid #ddd;
                }
                .register-title {
                    margin-bottom: 20px;
                    font-size: 24px;
                    color: #333;
                }
                .register-form p {
                    margin: 10px 0;
                }
                .register-input {
                    width: 100%;
                    padding: 10px;
                    margin: 5px 0;
                    border: 1px solid #ddd;
                    border-radius: 5px;
                }
                .register-button {
                    width: 100%;
                    padding: 10px;
                    background-color: #6A679E;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    transition: background-color 0.3s;
                }
                .register-button:hover {
                    background-color: #595787;
                }
                .login-link {
                    margin-top: 15px;
                }
                .login-link a {
                    display: inline-block;
                    padding: 10px 20px;
                    border: 2px solid #6A679E;
                    color: #6A679E;
                    text-decoration: none;
                    border-radius: 5px;
                    transition: background-color 0.3s, color 0.3s;
                }
                .login-link a:hover {
                    background-color: #6A679E;
                    color: white;
                }
            </style>
            <div class="register-container">
                <h2 class="register-title">회원가입</h2>
                <form action="/auth/register_process" method="post" class="register-form">
                    <p><input class="register-input" type="text" name="username" placeholder="아이디"></p>
                    <p><input class="register-input" type="password" name="pwd" placeholder="비밀번호"></p>    
                    <p><input class="register-input" type="password" name="pwd2" placeholder="비밀번호 재확인"></p>
                    <p><input class="register-input" type="text" list="list" id="daehak" name="daehak"/>
                    <datalist id="list">
                    ${options}</datalist></p>
                    <p><input class="register-input" type="email" name="mail" required placeholder="이메일"></p>
                    <p><input class="register-button" type="submit" value="제출"></p>
                </form>            
                <p class="login-link">계정이 있으신가요? <a href="/auth/login">로그인</a></p>
            </div>
        `, '');
        response.send(html);
    })
});


 
// 회원가입 프로세스
router.post('/register_process', function(request, response) {    
    var username = request.body.username;
    var password = request.body.pwd;
    var password2 = request.body.pwd2;
    var school = request.body.daehak;
    var email = request.body.mail;

    console.log("Received registration data:", { username, password, password2, school, email });

    if (username && password && password2 && school && email) {
        if (password !== password2) {
            response.send(`<script>alert("비밀번호가 일치하지 않습니다."); history.back();</script>`);
            return;
        }

        db.query('SELECT * FROM usertable WHERE username = ?', [username], function(error, results, fields) {
            if (error) throw error;

            if (results.length <= 0) {     // DB에 같은 이름의 회원아이디가 없는 경우 
                db.query('INSERT INTO usertable (username, password, school, email) VALUES(?,?,?,?)', [username, password, school, email], function (error, data) {
                    if (error) throw error;  // 여기서 error2를 error로 수정
                    response.send(`<script>alert("회원가입이 완료되었습니다!"); window.location.href="/";</script>`);
                });
            } else {                                                  // DB에 같은 이름의 회원아이디가 있는 경우
                response.send(`<script>alert("이미 존재하는 아이디 입니다."); history.back();</script>`);    
            }            
        });

    } else {        // 입력되지 않은 정보가 있는 경우
        response.send(`<script>alert("입력되지 않은 정보가 있습니다."); history.back();</script>`);
    }
});

module.exports = router;
