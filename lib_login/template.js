module.exports = {
  HTML: function (title, body, authStatusUI) {
    return `
    <!doctype html>
    <html lang='ko'>
      <head>    
        <title>Login TEST - ${title}</title>
        <meta charset='utf-8' />
        <script src="https://kit.fontawesome.com/b080a42cd9.js" crossorigin="anonymous"></script>
        <script src="http://code.jquery.com/jquery-1.9.1.js"></script>
        <link rel="stylesheet" href="/home_css/big_main.css" />
        <link rel="stylesheet" href="/home_css/small_main.css" />
        <link rel="stylesheet" href="/home_css/accordian.css" />
        <link rel="stylesheet" href="/home_css/switch.css" />
        <link rel="stylesheet" href="/home_css/tooltip.css" />
        <link rel="stylesheet" href="/home_css/mypage.css" /> <!-- 마이페이지 CSS 추가 -->
        <style>
          @font-face {
            font-family: "Dohyeon";
            src: url("./font/DoHyeon-Regular.ttf") format("truetype");
            font-weight: normal;
          }
          body {
            font-family: 'Dohyeon';
            background-color: #f7f7f7;
            margin: 0;
            padding: 0;
          }
        </style>
      </head>
      <body>
        <div id='inflearn' class='main_page is_logged_out is-student-user'>
          <script>window.env = "production"</script>
          <section class="inflab-integrated">
            <header>
              <div class="inflab-integrated__container">
                <ul class="inflab-integrated__service">
                  <li>
                    <a class="active e-integrated-header-inflearn-link" href="/">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      </svg>
                      UniFile
                    </a>
                  </li>
                  <li>
                    <svg>슬로건 입력</svg>
                  </li>
                </ul>
                <ul class="inflab-integrated__links-right">
                  <li>  
                    <button type="button" class="button space-inset-4 text is-5 signin" onclick="location.href='/auth/login'">로그인</button>
                  </li>
                  <li>
                    <button type="button" class="e-signup button space-inset-4 text is-5 is-primary" onclick="location.href='/auth/register'">회원가입</button>
                  </li>
                </ul>
              </div>
            </header>
          </section>
        </div>
        <header id="header">
          <nav class="navbar">
            <div class="container desktop_container">
              <div class="content">
                <div class="brand_header">
                  <a href="/" class="brand_logo e-brand-logo">
                    <span style="width: 80px; display: inline-block">
                      <img src="/home_css/logo.png" alt="Logo">
                    </span>
                  </a>
                </div>
                <div class="navbar-menu">
                  <div class="navbar-left">
                    <div class="has-dropdown is-hoverable navbar-item category_menu content--no-list-style">
                      <a href="/courses?types=ONLINE" class="navbar-item"><span>강의</span></a>
                      <ul class="navbar-dropdown is-boxed">
                        <li><a class="navbar-item" href="/courses/it-programming?types=ONLINE">포도1</a></li>
                        <li><a class="navbar-item" href="/courses/it-programming?types=ONLINE">수박1</a></li>
                        <li><a class="navbar-item" href="/courses/it-programming?types=ONLINE">망고1</a></li>
                        <li><a class="navbar-item" href="/courses/it-programming?types=ONLINE">딸기1</a></li>
                        <li><a class="navbar-item" href="/courses/it-programming?types=ONLINE">사과1</a></li>
                      </ul>
                    </div>
                    <div class="navbar-item">
                      <a href="/roadmaps" class="navbar-item"><span>족보</span></a>
                    </div>
                    <div class="navbar-item">
                      <a href="/mentors" class="navbar-item"><span>과제</span></a>
                    </div>
                    <div class="navbar-item">
                      <a href="/mentors" class="navbar-item"><span>필기노트</span></a>
                    </div>
                    <div class="has-dropdown is-hoverable navbar-item icon_drop_menu">
                      <div class="navbar-dropdown is-boxed is-right"></div>
                    </div>
                  </div>
                  <div class="navbar-right">
                    <div class="search search_bar navbar-item header_search header_search--gnb">
                      <label class="visually-hidden" for="searchbar-input">통합 검색</label>
                      <input type="text" id="searchbar-input" enterkeyhint="go" class="input" placeholder="" data-kv="headerSearchWord">
                      <span class="search__icon e-header-search"><i class="fa-solid fa-magnifying-glass"></i></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </nav>
        </header>
        <div class="login_section">
          ${authStatusUI}
          ${body}
        </div>
      </body>
    </html>
    `;
  },
  myPage: function(user) {
    return `
    <div class="mypage-container">
      <h2>회원정보</h2>
      <div class="profile">
        <img src="${user.profileImage}" alt="Profile Image" class="profile-image">
        <p class="profile-name">${user.name}</p>
        <p class="profile-university">${user.school}</p>
      </div>
      <div class="buttons">
        <button class="btn" onclick="location.href='/main'">메인페이지</button>
        <button class="btn" onclick="location.href='/purchase-history'">구매내역</button>
        <button class="btn" onclick="location.href='/auth/logout'">회원정보변경</button>
      </div>
    </div>
    `;
  }
};
