import App from "../app/App.js";
import AuthService from "../auth/auth.service.js";
import GithubService from "../github/github.service.js";
import GithubController from "./github.controller.js";

const githubRouter = App.createRouter();
const githubService = new GithubService(new AuthService());
const authService = new AuthService(githubService);
const githubController = new GithubController(githubService);

githubRouter.addEndpoint(
  "GET",
  /^\/repos/,
  githubController.getRepositories.bind(githubController)
);

export default githubRouter;
