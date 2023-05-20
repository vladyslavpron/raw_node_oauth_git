class AuthController {
  constructor(authService) {
    this.authService = authService;
  }

  redirectFromGithub(req, res) {
    this.authService.redirectFromGithub(req, res);
  }

  oauthGithubLogin(req, res) {
    this.authService.oauthGithubLogin(req, res);
  }
}

export default AuthController;
