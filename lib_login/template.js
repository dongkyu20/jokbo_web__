module.exports = {
  HTML: function (title, body, authStatusUI) {
      return `
      <!doctype html>
      <html lang='ko'>
          <head>
              <title>TEST - ${title}</title>
              <script src="http://code.jquery.com/jquery-1.9.1.js"></script>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.been-0">
              <title>Unifile</title>
              <link rel="stylesheet" href="/home_css/nam-style.css" />
              <link rel="stylesheet" href="/home_css/nav_and_main.css" />
              <link rel="stylesheet" href="/home_css/Gwage-style.css" />
              <link rel="stylesheet" href="/home_css/Jokbo-style.css" />
              <link rel="stylesheet" href="/home_css/Pilgi-style.css" />

              <style>
                  form {
                      display: flex;
                      padding: 30px;
                      flex-direction: column;
                  }
                  .login {
                      border: none;
                      border-bottom: 2px solid #D1D1D4;
                      background: none;
                      padding: 10px;
                      font-weight: 700;
                      transition: .2s;
                      width: 75%;
                      margin: 15px;
                  }
                  .login:active,
                  .login:focus,
                  .login:hover {
                      outline: none;
                      border-bottom-color: #6A679E;
                  }
                  .btn {            
                      border: none;
                      width: 75%;
                      background-color: #6A679E;
                      color: white;
                      padding: 15px 0;
                      font-weight: 600;
                      border-radius: 5px;
                      cursor: pointer;
                      transition: .2s;
                  }
                  .btn:hover {
                      background-color: #595787;
                  }
                  .profile {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding: 20px;
                }
                .profile h2 {
                    margin: 20px 0;
                    font-size: 24px;
                }
                .profile-buttons {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    width: 100%;
                }
                .profile-buttons button {
                    width: 80%;
                    max-width: 300px;
                    margin: 10px 0;
                    padding: 15px 20px;
                    font-size: 18px;
                    cursor: pointer;
                    border: none;
                    background-color: #6A679E;
                    color: white;
                    border-radius: 5px;
                    transition: background-color 0.2s;
                }
                .profile-buttons button:hover {
                    background-color: #595787;
                }
              </style>
          </head>
          <body>
            <header class="been-container">
            <section class="been-header-left">
                <nav>
                    <ul>
                        <li><a href="/main">UniFile</a></li>
                        <li><a href="#">|</a></li>
                        <li><a href="/main">나의 대학 파트너!</a></li>
                    </ul>
                </nav>
            </section>
            <section class="been-header-right">
                ${authStatusUI}
                <a href="/mypage">마이페이지</a> <!-- 마이페이지 버튼 추가 -->
            </section>
        </header>
    
        <hr class="been-horizontal-line">
        <section class="been-header-logo">
        <a href="/main"><img src="/assets/logo.png" alt="로고"></a>
            <nav>
                <ul>
                    <li>  </a></l>
                    <li class="been-dropdown">
                        <a href="/lecture">강의</a>
                        <ul class="been-dropdown-content">
                            <li><a href="/lecture">글목록</a></li>
                            <li><a href="/lecture/">메뉴2</a></li>
                            <li><a href="#">메뉴3</a></li>
                        </ul>
                    </li>
                    <li class="been-dropdown">
                        <a href="/assignment">과제</a>
                        <ul class="been-dropdown-content">
                            <li><a href="#">메뉴1</a></li>
                            <li><a href="#">메뉴2</a></li>
                            <li><a href="#">메뉴3</a></li>
                        </ul>
                    </li>
                    <li class="been-dropdown">
                        <a href="/jokbo">족보</a>
                        <ul class="been-dropdown-content">
                            <li><a href="#">메뉴1</a></li>
                            <li><a href="#">메뉴2</a></li>
                            <li><a href="#">메뉴3</a></li>
                        </ul>
                    </li>
                    <li class="been-dropdown">
                        <a href="note">필기노트</a>
                        <ul class="been-dropdown-content">
                            <li><a href="#">메뉴1</a></li>
                            <li><a href="#">메뉴2</a></li>
                            <li><a href="#">메뉴3</a></li>
                        </ul>
                    </li>
                </ul>
            </nav>
        </section>
              <div>
              <hr>
                  ${body}
              </div>
          </body>
      </html>
      `;
  },
  myPage: function (authStatusUI) {
    return this.HTML("마이페이지", `
      <div class="profile">
        <h2>회원정보</h2>
        <div class="profile-buttons">
            <button onclick="location.href='/purchase-history'">구매내역</button>
            <button onclick="location.href='/upload-history'">업로드내역</button>
            <button onclick="location.href='/edit-profile'">회원정보 변경</button>
        </div>
      </div>
    `, authStatusUI);
  }
}
