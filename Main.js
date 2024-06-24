const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const FileStore = require('session-file-store')(session);
const path = require('path');
const db = require('./lib_login/db');
const multer = require('multer');
const fs = require('fs');
const util = require('util');

db.query = util.promisify(db.query); // 프로미스화

const authRouter = require('./lib_login/auth');
const authCheck = require('./lib_login/authCheck.js');
const template = require('./lib_login/template.js');

const getUserSchool = async (username) => {
  try {
    const results = await db.query('SELECT school FROM usertable WHERE username = ?', [username]);
    if (results.length > 0) {
      return results[0].school;
    } else {
      return null;
    }
  } catch (error) {
    throw new Error('Error fetching user school information');
  }
};

const app = express();
const port = 3000;

app.use('/home_css', express.static(path.join(__dirname, 'home_css')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
  secret: 'secret key',
  resave: false,
  saveUninitialized: true,
  store: new FileStore(),
}));

const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

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

app.use('/auth', authRouter);

app.get('/main', (req, res) => {
  let authStatusUI = authCheck.statusUI(req, res);
  let bodyContent = `
  <div class="slider-content">
                <img class="slide" src="./assets/LECBEN.png" alt="Slide 1">
                <img class="slide" src="./assets/ASSBEN.png" alt="Slide 2">
                <img class="slide" src="./assets/TESBEN.png" alt="Slide 3">
                <img class="slide" src="./assets/NOTBEN.png" alt="Slide 4">
            </div>
    <section class="been-notes">
      <div class="been-note-container">
        <div class="been-note-title-left">
          <h2>뜨끈뜨끈 최신 과제풀이</h2>
          <div class="been-notes-click-container">`;
          db.query('SELECT * FROM assignments ORDER BY id DESC LIMIT 3', (error, results) => {
            if (error) throw error;
            results.forEach(assignment => {
              bodyContent += `<div class="been-notes-click-left been-note-item">${assignment.title} - ${assignment.professor}<br>${assignment.price}</div>`;
            });
            bodyContent += `
          </div>
        </div>
        <div class="been-note-title-right">
          <h2>뜨끈뜨끈 최신 필기</h2>
          <div class="been-notes-click-container">`;
        db.query('SELECT * FROM notes ORDER BY id DESC LIMIT 3', (error, results) => {
          if (error) throw error;
          results.forEach(note => {
            bodyContent += `<div class="been-notes-click-right been-note-item">${note.title} - ${note.professor}<br>${note.price}</div>`;
          });
          bodyContent += `
          </div>
        </div>
      </div>
    </section>
    <section class="been-upload-section">
      <div class="been-title">
        <h2>유니파일 코너</h2>
      </div>
      <div class="been-uploads">
        <div class="been-uploads-item">
          <div class="been-image-container">
            <img src="/assets/UPL1.png" alt="업로드 이미지">
            <a href="#" class="been-upload-button">Upload</a>
          </div>
        </div>
        <div class="been-uploads-item">
          <div class="been-image-container">
            <img src="/assets/UPL1.png" alt="업로드 이미지">
            <a href="#" class="been-upload-button">Upload</a>
          </div>
        </div>
        <div class="been-uploads-item">
          <div class="been-image-container">
            <img src="./assets/UPL1.png" alt="업로드 이미지">
            <a href="#" class="been-upload-button">Upload</a>
          </div>
        </div>
        <div class="been-uploads-item">
          <div class="been-image-container">
            <img src="./assets/UPL1.png" alt="업로드 이미지">
            <a href="#" class="been-upload-button">Upload</a>
          </div>
        </div>
      </div>
    </section>
    <footer class="been-footer">
      <div class="been-container">
        <p>개인정보처리방침 | 이용약관</p>
        <p>(주)유니파일 제작자: 김남현 서석빈 이경준 정다빈 진유택 한동규</p>
        <p>©UNIFILE ALL RIGHTS RESERVED</p>
      </div>
    </footer>
    <script>
    document.addEventListener('DOMContentLoaded', () => {
      const slides = document.querySelectorAll('.slide');
  

      const slideContainer = document.querySelector('.slider-content');
      const slideWidth = slides[0].clientWidth;
      const interval = 4000; // 4 seconds
      let currentIndex = 0; // 변수 정의를 함수 외부로 이동

      function nextSlide() {
        currentIndex = (currentIndex + 1) % slides.length;
        slideContainer.style.transition = 'transform 1s ease';
        slideContainer.style.transform = 'translateX(' + (-currentIndex * slideWidth) + 'px)';
      }
      setInterval(nextSlide, interval);
    });</script>
  `;
  let html = template.HTML('Welcome', bodyContent, authStatusUI);
  res.send(html);
  });
});
});

app.get('/lecture', (req, res) => {
  let authStatusUI = authCheck.statusUI(req, res);
  db.query('SELECT * FROM lectures ORDER BY id DESC', (error, results) => {
    if (error) throw error;
    let bodyContent = `
      <div class="taek-container">
        <h1 class="taek-title">강의영상</h1>
        <hr>
        <button onclick="location.href='/lecture/upload'" class="taek-upload-button">글 올리기</button>
    `;
    results.forEach(lecture => {
      bodyContent += `<div id="taek-notesSection"><a href="/lecture/${lecture.id}"><h3>${lecture.title} - ${lecture.professor}</h3></a><hr></div>`;
    });
    bodyContent += `
      <div class="taek-pagination" id="taek-pagination"></div>
    </div>
    <script src="./Pilgi-main-page.js"></script>
    `;
    let html = template.HTML('Lecture', bodyContent, authStatusUI);
    res.send(html);
  });
});


app.get('/lecture/upload', (req, res) => {
  let authStatusUI = authCheck.statusUI(req, res);
  let bodyContent = '';
  if (authCheck.isOwner(req, res)) {
    bodyContent = `
      <h2>File Upload Form</h2>
      <form action="/lecture/upload" method="post" enctype="multipart/form-data">
        <label for="title">title:</label>
        <input type="text" id="title" name="title" required><br><br>
        <label for="price">Price:</label>
        <input type="number" id="price" name="price" step="1" required><br><br>
        <label for="subject">Subject:</label>
        <input type="text" id="subject" name="subject" required><br><br>
        <label for="professor">Professor:</label>
        <input type="text" id="professor" name="professor" required><br><br>
        <label for="file">File:</label>
        <input type="file" id="file" name="file" required><br><br>
        <button type="submit">Upload</button>
      </form>
    `;
  } else {
    bodyContent = `
      <script>
        alert('로그인 후 이용하세요');
        window.location.href = "/lecture";
      </script>
    `;
  }
  let html = template.HTML('Upload', bodyContent, authStatusUI);
  res.send(html);
});

app.post('/lecture/upload', upload.single('file'), async (req, res) => {
  const { title, price, subject, professor } = req.body;
  const username = authCheck.resUsername(req, res);
  const file_path = req.file.path;
  const upload_date = new Date();

  try {
    const school = await getUserSchool(username);

    if (!school) {
      return res.send('User school not found');
    }

    await db.query(
      'INSERT INTO lectures (title, username, upload_date, file_path, price, subject, school, professor) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [title, username, upload_date, file_path, price, subject, school, professor]
    );

    res.redirect('/main');
  } catch (error) {
    res.send('Error uploading lecture');
  }
});

app.get('/lecture/download/:id', (req, res) => {
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


app.get('/lecture/:id', (req, res) => {
  let authStatusUI = authCheck.statusUI(req, res);
  const lectureId = req.params.id;
  const username = authCheck.resUsername(req, res);

  db.query('SELECT * FROM lectures WHERE id = ?', [lectureId], (error, results) => {
    if (error) throw error;

    if (results.length > 0) {
      const lecture = results[0];
      let bodyContent = `<div style="margin-left:40px">
        <h2>${lecture.title}</h2>
        <p><strong>업로더 :</strong> ${lecture.username}</p>
        <p><strong>업로드 일시 :</strong> ${lecture.upload_date}</p>
        <p><strong>가격 :</strong> ${lecture.price}</p>
        <p><strong>과목명 :</strong> ${lecture.subject}</p>
        <p><strong>대학교 :</strong> ${lecture.school}</p>
        <p><strong>교수명 :</strong> ${lecture.professor}</p>
        </div>
      `;

      if (username) {
        db.query('SELECT * FROM actionlog WHERE lecture_id = ? AND username = ?', [lectureId, username], (error, actionLogResults) => {
          if (error) throw error;

          if (actionLogResults.length > 0) {
            bodyContent += `<div style="margin-left:40px">
            <a href="/lecture/download/${lecture.id}">파일 다운로드</a></div>`;
          } else {
            bodyContent += `<form action="/lecture/purchase/${lecture.id}" method="post">
                              <button type="submit">Purchase for ${lecture.price}</button>
                            </form>`;
          }
          bodyContent += `<hr>`;
          let html = template.HTML('Lecture Details', bodyContent, authStatusUI);
          res.send(html);
        });
      } else {
        bodyContent += `
          <p>Please <a href="/auth/login">login</a> to purchase or download this lecture.</p>
          <hr>
        `;
        let html = template.HTML('Lecture Details', bodyContent, authStatusUI);
        res.send(html);
      }
    } else {
      res.send('Lecture not found');
    }
  });
});

app.post('/lecture/purchase/:id', (req, res) => {
  const lectureId = req.params.id;
  const username = authCheck.resUsername(req, res);

  if (!username) {
    return res.redirect('/auth/login');
  }

  db.query('SELECT * FROM lectures WHERE id = ?', [lectureId], (error, lectureResults) => {
    if (error) throw error;

    if (lectureResults.length > 0) {
      const lecture = lectureResults[0];
      const price = lecture.price;
      const sellername = lecture.username;

      db.query('SELECT * FROM usertable WHERE username = ?', [username], (error, userResults) => {
        if (error) throw error;

        if (userResults.length > 0) {
          const user = userResults[0];

          if (user.point >= price) {
            db.query('UPDATE usertable SET point = point - ? WHERE username = ?', [price, username], (error) => {
              if (error) throw error;

              db.query('INSERT INTO actionlog (lecture_id, username, sellername, price) VALUES (?, ?, ?, ?)', 
                [lectureId, username, sellername, price], 
                (error) => {
                  if (error) throw error;
                  res.redirect(`/lecture/${lectureId}`);
              });
            });
          } else {
            res.send('Insufficient points to make the purchase.');
          }
        } else {
          res.redirect('/auth/login');
        }
      });
    } else {
      res.send('Lecture not found');
    }
  });
});


app.get('/jokbo', (req, res) => {
  let authStatusUI = authCheck.statusUI(req, res);
  db.query('SELECT * FROM jokbos ORDER BY id DESC', (error, results) => {
    if (error) throw error;
    let bodyContent = `
      <div class="taek-container">
        <h1 class="taek-title">족보</h1>
        <hr>
        <button onclick="location.href='/jokbo/upload'" class="taek-upload-button">글 올리기</button>
    `;
    results.forEach(jokbo => {
      bodyContent += `<div id="taek-notesSection"><a href="/jokbo/${jokbo.id}"><h3>${jokbo.title} - ${jokbo.professor}</h3></a><hr></div>`;
    });
    bodyContent += `
      <div class="taek-pagination" id="taek-pagination"></div>
    </div>
    <script src="./Pilgi-main-page.js"></script>
    `;
    let html = template.HTML('Jokbo', bodyContent, authStatusUI);
    res.send(html);
  });
});


app.get('/jokbo/upload', (req, res) => {
  let authStatusUI = authCheck.statusUI(req, res);
  let bodyContent = '';
  if (authCheck.isOwner(req, res)) {
    bodyContent = `
      <h2>File Upload Form</h2>
      <form action="/jokbo/upload" method="post" enctype="multipart/form-data">
        <label for="title">title:</label>
        <input type="text" id="title" name="title" required><br><br>
        <label for="price">Price:</label>
        <input type="number" id="price" name="price" step="1" required><br><br>
        <label for="subject">Subject:</label>
        <input type="text" id="subject" name="subject" required><br><br>
        <label for="professor">Professor:</label>
        <input type="text" id="professor" name="professor" required><br><br>
        <label for="file">File:</label>
        <input type="file" id="file" name="file" required><br><br>
        <button type="submit">Upload</button>
      </form>
    `;
  } else {
    bodyContent = `
      <script>
        alert('로그인 후 이용하세요');
        window.location.href = "/jokbo";
      </script>
    `;
  }
  let html = template.HTML('Upload', bodyContent, authStatusUI);
  res.send(html);
});

app.post('/jokbo/upload', upload.single('file'), async (req, res) => {
  const { title, price, subject, professor } = req.body;
  const username = authCheck.resUsername(req, res);
  const file_path = req.file.path;
  const upload_date = new Date();

  try {
    const school = await getUserSchool(username);

    if (!school) {
      return res.send('User school not found');
    }

    await db.query(
      'INSERT INTO jokbos (title, username, upload_date, file_path, price, subject, school, professor) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [title, username, upload_date, file_path, price, subject, school, professor]
    );

    res.redirect('/main');
  } catch (error) {
    res.send('Error uploading jokbo');
  }
});

app.get('/jokbo/download/:id', (req, res) => {
  const jokboId = req.params.id;

  db.query('SELECT file_path FROM jokbos WHERE id = ?', [jokboId], (error, results) => {
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


app.get('/jokbo/:id', (req, res) => {
  let authStatusUI = authCheck.statusUI(req, res);
  const jokboId = req.params.id;
  const username = authCheck.resUsername(req, res);

  db.query('SELECT * FROM jokbos WHERE id = ?', [jokboId], (error, results) => {
    if (error) throw error;

    if (results.length > 0) {
      const jokbo = results[0];
      let bodyContent = `<div style="margin-left:40px">
        <h2>${jokbo.title}</h2>
        <p><strong>업로더 :</strong> ${jokbo.username}</p>
        <p><strong>업로드 일시 :</strong> ${jokbo.upload_date}</p>
        <p><strong>가격 :</strong> ${jokbo.price}</p>
        <p><strong>과목명 :</strong> ${jokbo.subject}</p>
        <p><strong>대학교 :</strong> ${jokbo.school}</p>
        <p><strong>교수명 :</strong> ${jokbo.professor}</p>
        </div>
      `;

      if (username) {
        db.query('SELECT * FROM actionlog WHERE lecture_id = ? AND username = ?', [jokboId, username], (error, actionLogResults) => {
          if (error) throw error;

          if (actionLogResults.length > 0) {
            bodyContent += `<div style="margin-left:40px">
            <a href="/jokbo/download/${jokbo.id}">파일 다운로드</a></div>`;
          } else {
            bodyContent += `<form action="/jokbo/purchase/${jokbo.id}" method="post">
                              <button type="submit">Purchase for ${jokbo.price}</button>
                            </form>`;
          }
          bodyContent += `<hr>`;
          let html = template.HTML('Jokbo Details', bodyContent, authStatusUI);
          res.send(html);
        });
      } else {
        bodyContent += `
          <p>Please <a href="/auth/login">login</a> to purchase or download this jokbo.</p>
          <hr>
        `;
        let html = template.HTML('Jokbo Details', bodyContent, authStatusUI);
        res.send(html);
      }
    } else {
      res.send('Jokbo not found');
    }
  });
});

app.post('/jokbo/purchase/:id', (req, res) => {
  const jokboId = req.params.id;
  const username = authCheck.resUsername(req, res);

  if (!username) {
    return res.redirect('/auth/login');
  }

  db.query('SELECT * FROM jokbos WHERE id = ?', [jokboId], (error, jokboResults) => {
    if (error) throw error;

    if (jokboResults.length > 0) {
      const jokbo = jokboResults[0];
      const price = jokbo.price;
      const sellername = jokbo.username;

      db.query('SELECT * FROM usertable WHERE username = ?', [username], (error, userResults) => {
        if (error) throw error;

        if (userResults.length > 0) {
          const user = userResults[0];

          if (user.point >= price) {
            db.query('UPDATE usertable SET point = point - ? WHERE username = ?', [price, username], (error) => {
              if (error) throw error;

              db.query('INSERT INTO actionlog (lecture_id, username, sellername, price) VALUES (?, ?, ?, ?)', 
                [jokboId, username, sellername, price], 
                (error) => {
                  if (error) throw error;
                  res.redirect(`/jokbo/${jokboId}`);
              });
            });
          } else {
            res.send('Insufficient points to make the purchase.');
          }
        } else {
          res.redirect('/auth/login');
        }
      });
    } else {
      res.send('Jokbo not found');
    }
  });
});







app.get('/assignment', (req, res) => {
  let authStatusUI = authCheck.statusUI(req, res);
  db.query('SELECT * FROM assignments ORDER BY id DESC', (error, results) => {
    if (error) throw error;
    let bodyContent = `
      <div class="taek-container">
        <h1 class="taek-title">과제풀이</h1>
        <hr>
        <button onclick="location.href='/assignment/upload'" class="taek-upload-button">글 올리기</button>
    `;
    results.forEach(assignment => {
      bodyContent += `<div id="taek-notesSection"><a href="/assignment/${assignment.id}"><h3>${assignment.title} - ${assignment.professor}</h3></a><hr></div>`;
    });
    bodyContent += `
      <div class="taek-pagination" id="taek-pagination"></div>
    </div>
    <script src="./Pilgi-main-page.js"></script>
    `;
    let html = template.HTML('Assignment', bodyContent, authStatusUI);
    res.send(html);
  });
});

app.get('/assignment/upload', (req, res) => {
  let authStatusUI = authCheck.statusUI(req, res);
  let bodyContent = '';
  if (authCheck.isOwner(req, res)) {
    bodyContent = `
      <h2>File Upload Form</h2>
      <form action="/assignment/upload" method="post" enctype="multipart/form-data">
        <label for="title">title:</label>
        <input type="text" id="title" name="title" required><br><br>
        <label for="price">Price:</label>
        <input type="number" id="price" name="price" step="1" required><br><br>
        <label for="subject">Subject:</label>
        <input type="text" id="subject" name="subject" required><br><br>
        <label for="professor">Professor:</label>
        <input type="text" id="professor" name="professor" required><br><br>
        <label for="file">File:</label>
        <input type="file" id="file" name="file" required><br><br>
        <button type="submit">Upload</button>
      </form>
    `;
  } else {
    bodyContent = `
      <script>
        alert('로그인 후 이용하세요');
        window.location.href = "/assignment";
      </script>
    `;
  }
  let html = template.HTML('Upload', bodyContent, authStatusUI);
  res.send(html);
});

app.post('/assignment/upload', upload.single('file'), async (req, res) => {
  const { title, price, subject, professor } = req.body;
  const username = authCheck.resUsername(req, res);
  const file_path = req.file.path;
  const upload_date = new Date();

  try {
    const school = await getUserSchool(username);

    if (!school) {
      return res.send('User school not found');
    }

    await db.query(
      'INSERT INTO assignments (title, username, upload_date, file_path, price, subject, school, professor) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [title, username, upload_date, file_path, price, subject, school, professor]
    );

    res.redirect('/main');
  } catch (error) {
    res.send('Error uploading assignment');
  }
});

app.get('/assignment/download/:id', (req, res) => {
  const assignmentId = req.params.id;

  db.query('SELECT file_path FROM assignments WHERE id = ?', [assignmentId], (error, results) => {
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


app.get('/assignment/:id', (req, res) => {
  let authStatusUI = authCheck.statusUI(req, res);
  const assignmentId = req.params.id;
  const username = authCheck.resUsername(req, res);

  db.query('SELECT * FROM assignments WHERE id = ?', [assignmentId], (error, results) => {
    if (error) throw error;

    if (results.length > 0) {
      const assignment = results[0];
      let bodyContent = `<div style="margin-left:40px">
        <h2>${assignment.title}</h2>
        <p><strong>업로더 :</strong> ${assignment.username}</p>
        <p><strong>업로드 일시 :</strong> ${assignment.upload_date}</p>
        <p><strong>가격 :</strong> ${assignment.price}</p>
        <p><strong>과목명 :</strong> ${assignment.subject}</p>
        <p><strong>대학교 :</strong> ${assignment.school}</p>
        <p><strong>교수명 :</strong> ${assignment.professor}</p>
        </div>
      `;

      if (username) {
        db.query('SELECT * FROM actionlog WHERE lecture_id = ? AND username = ?', [assignmentId, username], (error, actionLogResults) => {
          if (error) throw error;

          if (actionLogResults.length > 0) {
            bodyContent += `<div style="margin-left:40px">
            <a href="/assignment/download/${assignment.id}">파일 다운로드</a></div>`;
          } else {
            bodyContent += `<form action="/assignment/purchase/${assignment.id}" method="post">
                              <button type="submit">Purchase for ${assignment.price}</button>
                            </form>`;
          }
          bodyContent += `<hr>`;
          let html = template.HTML('Assignment Details', bodyContent, authStatusUI);
          res.send(html);
        });
      } else {
        bodyContent += `
          <p>Please <a href="/auth/login">login</a> to purchase or download this assignment.</p>
          <hr>
        `;
        let html = template.HTML('Assignment Details', bodyContent, authStatusUI);
        res.send(html);
      }
    } else {
      res.send('Assignment not found');
    }
  });
});

app.post('/assignment/purchase/:id', (req, res) => {
  const assignmentId = req.params.id;
  const username = authCheck.resUsername(req, res);

  if (!username) {
    return res.redirect('/auth/login');
  }

  db.query('SELECT * FROM assignments WHERE id = ?', [assignmentId], (error, assignmentResults) => {
    if (error) throw error;

    if (assignmentResults.length > 0) {
      const assignment = assignmentResults[0];
      const price = assignment.price;
      const sellername = assignment.username;

      db.query('SELECT * FROM usertable WHERE username = ?', [username], (error, userResults) => {
        if (error) throw error;

        if (userResults.length > 0) {
          const user = userResults[0];

          if (user.point >= price) {
            db.query('UPDATE usertable SET point = point - ? WHERE username = ?', [price, username], (error) => {
              if (error) throw error;

              db.query('INSERT INTO actionlog (lecture_id, username, sellername, price) VALUES (?, ?, ?, ?)', 
                [assignmentId, username, sellername, price], 
                (error) => {
                  if (error) throw error;
                  res.redirect(`/assignment/${assignmentId}`);
              });
            });
          } else {
            res.send('Insufficient points to make the purchase.');
          }
        } else {
          res.redirect('/auth/login');
        }
      });
    } else {
      res.send('Assignment not found');
    }
  });
});

app.get('/note', (req, res) => {
  let authStatusUI = authCheck.statusUI(req, res);
  db.query('SELECT * FROM notes ORDER BY id DESC', (error, results) => {
    if (error) throw error;
    let bodyContent = `
      <div class="taek-container">
        <h1 class="taek-title">필기노트</h1>
        <hr>
        <button onclick="location.href='/note/upload'" class="taek-upload-button">글 올리기</button>
    `;
    results.forEach(note => {
      bodyContent += `<div id="taek-notesSection"><a href="/note/${note.id}"><h3>${note.title} - ${note.professor}</h3></a><hr></div>`;
    });
    bodyContent += `
      <div class="taek-pagination" id="taek-pagination"></div>
    </div>
    <script src="./Pilgi-main-page.js"></script>
    `;
    let html = template.HTML('Note', bodyContent, authStatusUI);
    res.send(html);
  });
});



app.get('/note/upload', (req, res) => {
  let authStatusUI = authCheck.statusUI(req, res);
  let bodyContent = '';
  if (authCheck.isOwner(req, res)) {
    bodyContent = `
      <h2>File Upload Form</h2>
      <form action="/note/upload" method="post" enctype="multipart/form-data">
        <label for="title">title:</label>
        <input type="text" id="title" name="title" required><br><br>
        <label for="price">Price:</label>
        <input type="number" id="price" name="price" step="1" required><br><br>
        <label for="subject">Subject:</label>
        <input type="text" id="subject" name="subject" required><br><br>
        <label for="professor">Professor:</label>
        <input type="text" id="professor" name="professor" required><br><br>
        <label for="file">File:</label>
        <input type="file" id="file" name="file" required><br><br>
        <button type="submit">Upload</button>
      </form>
    `;
  } else {
    bodyContent = `
      <script>
        alert('로그인 후 이용하세요');
        window.location.href = "/note";
      </script>
    `;
  }
  let html = template.HTML('Upload', bodyContent, authStatusUI);
  res.send(html);
});

app.post('/note/upload', upload.single('file'), async (req, res) => {
  const { title, price, subject, professor } = req.body;
  const username = authCheck.resUsername(req, res);
  const file_path = req.file.path;
  const upload_date = new Date();

  try {
    const school = await getUserSchool(username);

    if (!school) {
      return res.send('User school not found');
    }

    await db.query(
      'INSERT INTO notes (title, username, upload_date, file_path, price, subject, school, professor) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [title, username, upload_date, file_path, price, subject, school, professor]
    );

    res.redirect('/main');
  } catch (error) {
    res.send('Error uploading note');
  }
});

app.get('/note/download/:id', (req, res) => {
  const noteId = req.params.id;

  db.query('SELECT file_path FROM notes WHERE id = ?', [noteId], (error, results) => {
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


app.get('/note/:id', (req, res) => {
  let authStatusUI = authCheck.statusUI(req, res);
  const noteId = req.params.id;
  const username = authCheck.resUsername(req, res);

  db.query('SELECT * FROM notes WHERE id = ?', [noteId], (error, results) => {
    if (error) throw error;

    if (results.length > 0) {
      const note = results[0];
      let bodyContent = `<div style="margin-left:40px">
        <h2>${note.title}</h2>
        <p><strong>업로더 :</strong> ${note.username}</p>
        <p><strong>업로드 일시 :</strong> ${note.upload_date}</p>
        <p><strong>가격 :</strong> ${note.price}</p>
        <p><strong>과목명 :</strong> ${note.subject}</p>
        <p><strong>대학교 :</strong> ${note.school}</p>
        <p><strong>교수명 :</strong> ${note.professor}</p>
        </div>
      `;

      if (username) {
        db.query('SELECT * FROM actionlog WHERE lecture_id = ? AND username = ?', [noteId, username], (error, actionLogResults) => {
          if (error) throw error;

          if (actionLogResults.length > 0) {
            bodyContent += `<div style="margin-left:40px">
            <a href="/note/download/${note.id}">파일 다운로드</a></div>`;
          } else {
            bodyContent += `<form action="/note/purchase/${note.id}" method="post">
                              <button type="submit">Purchase for ${note.price}</button>
                            </form>`;
          }
          bodyContent += `<hr>`;
          let html = template.HTML('Note Details', bodyContent, authStatusUI);
          res.send(html);
        });
      } else {
        bodyContent += `
          <p>Please <a href="/auth/login">login</a> to purchase or download this note.</p>
          <hr>
        `;
        let html = template.HTML('Note Details', bodyContent, authStatusUI);
        res.send(html);
      }
    } else {
      res.send('Note not found');
    }
  });
});

app.post('/note/purchase/:id', (req, res) => {
  const noteId = req.params.id;
  const username = authCheck.resUsername(req, res);

  if (!username) {
    return res.redirect('/auth/login');
  }

  db.query('SELECT * FROM notes WHERE id = ?', [noteId], (error, noteResults) => {
    if (error) throw error;

    if (noteResults.length > 0) {
      const note = noteResults[0];
      const price = note.price;
      const sellername = note.username;

      db.query('SELECT * FROM usertable WHERE username = ?', [username], (error, userResults) => {
        if (error) throw error;

        if (userResults.length > 0) {
          const user = userResults[0];

          if (user.point >= price) {
            db.query('UPDATE usertable SET point = point - ? WHERE username = ?', [price, username], (error) => {
              if (error) throw error;

              db.query('INSERT INTO actionlog (lecture_id, username, sellername, price) VALUES (?, ?, ?, ?)', 
                [noteId, username, sellername, price], 
                (error) => {
                  if (error) throw error;
                  res.redirect(`/note/${noteId}`);
              });
            });
          } else {
            res.send('Insufficient points to make the purchase.');
          }
        } else {
          res.redirect('/auth/login');
        }
      });
    } else {
      res.send('Note not found');
    }
  });
});

app.get('/mypage', (req, res) => {
  let authStatusUI = authCheck.statusUI(req, res);
  let html = template.myPage(authStatusUI);
  res.send(html);
});

app.get('/purchase-history', (req, res) => {
  let authStatusUI = authCheck.statusUI(req, res);
  let bodyContent = `<h2>구매내역</h2>`;
  let html = template.HTML("구매내역", bodyContent, authStatusUI);
  res.send(html);
});

app.get('/upload-history', (req, res) => {
  let authStatusUI = authCheck.statusUI(req, res);
  let bodyContent = `<h2>업로드내역</h2>`;
  let html = template.HTML("업로드내역", bodyContent, authStatusUI);
  res.send(html);
});

app.get('/edit-profile', (req, res) => {
  let authStatusUI = authCheck.statusUI(req, res);
  let bodyContent = `<h2>회원정보 변경</h2>`;
  let html = template.HTML("회원정보 변경", bodyContent, authStatusUI);
  res.send(html);
});



app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});