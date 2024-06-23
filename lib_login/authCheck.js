module.exports = {
    isOwner: function (request, response) {
      if (request.session.is_logined) {
        return true;
      } else {
        return false;
      }
    },
    statusUI: function (request, response) {
      var authStatusUI = '<button type="button" class="button space-inset-4 text is-5 signin" onclick="location.href=`/auth/login`">로그인</button></li><li><button type="button" class="e-signup button space-inset-4 text is-5 is-primary" onclick="location.href=`/auth/register`">회원가입</button>';
      if (this.isOwner(request, response)) {
        authStatusUI = `${request.session.nickname}님 환영합니다 | &nbsp; <button type="button" class="e-signup button space-inset-4 text is-5 is-primary" onclick="location.href='/auth/logout'">로그아웃</button>`;
      }
      return authStatusUI;
    },
    resUsername: function (request, response) {
      var authUsername = '';
      if (this.isOwner(request, response)){
        authUsername = `${request.session.nickname}`;
      }
      return authUsername;
    }
  }