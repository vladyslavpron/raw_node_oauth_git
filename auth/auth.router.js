import App from "../app/App.js";
import GithubService from "../github/github.service.js";
import AuthController from "./auth.controller.js";
import AuthService from "./auth.service.js";

const authRouter = App.createRouter();
const githubService = new GithubService();
const authService = new AuthService(githubService);
const authController = new AuthController(authService);

authRouter.addEndpoint(
  "GET",
  /^\/auth/,
  authController.redirectFromGithub.bind(authController)
);

authRouter.addEndpoint(
  "GET",
  /^\/login$/,
  authController.oauthGithubLogin.bind(authController)
);

export default authRouter;
