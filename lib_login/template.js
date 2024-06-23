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
              <link rel="stylesheet" href="./home_css/nav_and_main.css" />
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
              </style>
          </head>
          <body>
            <header class="been-container">
            <section class="been-header-left">
                <nav>
                    <ul>
                        <li><a href="#">UniFile</a></li>
                        <li><a href="#">|</a></li>
                        <li><a href="#">슬로건 입력</a></li>
                    </ul>
                </nav>
            </section>
            <section class="been-header-right">
                ${authStatusUI}
            </section>
        </header>
    
        <hr class="been-horizontal-line">
        <section class="been-header-logo">
            <img src="./assets/logo.png" alt="로고">
            <nav>
                <ul>
                    <li>  </a></li>
                    <li class="been-dropdown">
                        <a href="/lecture">강의</a>
                        <ul class="been-dropdown-content">
                            <li><a href="#">메뉴1</a></li>
                            <li><a href="#">메뉴2</a></li>
                            <li><a href="#">메뉴3</a></li>
                        </ul>
                    </li>
                    <li class="been-dropdown">
                        <a href="#">과제</a>
                        <ul class="been-dropdown-content">
                            <li><a href="#">메뉴1</a></li>
                            <li><a href="#">메뉴2</a></li>
                            <li><a href="#">메뉴3</a></li>
                        </ul>
                    </li>
                    <li class="been-dropdown">
                        <a href="#">족보</a>
                        <ul class="been-dropdown-content">
                            <li><a href="#">메뉴1</a></li>
                            <li><a href="#">메뉴2</a></li>
                            <li><a href="#">메뉴3</a></li>
                        </ul>
                    </li>
                    <li class="been-dropdown">
                        <a href="#">필기노트</a>
                        <ul class="been-dropdown-content">
                            <li><a href="#">메뉴1</a></li>
                            <li><a href="#">메뉴2</a></li>
                            <li><a href="#">메뉴3</a></li>
                        </ul>
                    </li>
                </ul>
            </nav>
        </section>
              <div class="login_section">
                  ${body}
              </div>
          </body>
      </html>
      `;
  }
}
