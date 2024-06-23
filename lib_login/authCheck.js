module.exports = {
    isOwner: function (request, response) {
      if (request.session.is_logined) {
        return true;
      } else {
        return false;
      }
    },
    statusUI: function (request, response) {
      var authStatusUI = '<button type="button" class="button space-inset-4 text is-5 signin" onclick="location.href=`/auth/login`">로그인</button>';
      if (this.isOwner(request, response)) {
        authStatusUI = `${request.session.nickname}님 환영합니다 | <a href="/auth/logout">로그아웃</a>`;
      }
      return authStatusUI;
    }
  }