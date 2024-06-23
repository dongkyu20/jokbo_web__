module.exports = {
    isOwner: function (request, response) {
      if (request.session.is_logined) {
        return true;
      } else {
        return false;
      }
    },
    statusUI: function (request, response) {
      var authStatusUI = '<button class="been-login-button" onclick="location.href=`/auth/login`">로그인</button> | &nbsp; <button class="been-signup-button" onclick="location.href=`/auth/register`">회원가입</button>';
      if (this.isOwner(request, response)) {
        authStatusUI = `${request.session.nickname}님 환영합니다 | &nbsp; <button class="been-signup-button" onclick="location.href='/auth/logout'">로그아웃</button>`;
      }
      return authStatusUI;
    },
    resUsername: function (request, response) {
      var authUsername = '';
      if (this.isOwner(request, response)){
        authUsername = `${request.session.nickname}`;
      }
      return authUsername;
    },
    resSchool: function (request, response) {
      var authSchool = '';
      if (this.isOwner(request, response)){
        authSchool = `${request.session.nickname}`;
      }
      return authSchool;
    }
  }