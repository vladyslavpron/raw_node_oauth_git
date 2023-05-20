import * as querystring from "node:querystring";
import config from "../utils/config.js";
import request from "../utils/request.js";
import AppError from "../utils/AppError.js";

class GithubService {
  _OAUTH_URL = "https://github.com/login/oauth/authorize";
  _OAUTH_ACCESS_TOKEN_URL = "https://github.com/login/oauth/access_token";
  _GET_USER_URL = "https://api.github.com/user";
  _GET_USER_REPOSITORIES_URL = "https://api.github.com/user/repos";
  _GET_REPOSITORY_BASE_URL = "https://api.github.com/repos";

  constructor(authService) {
    this.authService = authService;
  }

  buildOauthUrl(scope = "repo") {
    const query = querystring.encode({
      scope,
      client_id: config.GITHUB_CLIENT_ID,
    });
    return this._OAUTH_URL + "?" + query;
  }

  buildGetRepositoryContributorsUrl(owner, repo) {
    return this._GET_REPOSITORY_BASE_URL + `/${owner}/${repo}/contributors`;
  }

  oauthRedirect(req, res) {
    const oauthUrl = this.buildOauthUrl();
    res.redirect(oauthUrl);
    res.end();
  }

  async getUserToken(code) {
    const response = await request({
      method: "POST",
      url: this._OAUTH_ACCESS_TOKEN_URL,
      body: {
        client_id: config.GITHUB_CLIENT_ID,
        client_secret: config.GITHUB_CLIENT_SECRET,
        code: code,
      },
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": "node.js",
      },
    });
    return response.data;
  }

  async getUser(token) {
    const response = await request({
      method: "GET",
      url: this._GET_USER_URL,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": "node.js",
      },
    });
    return response.data;
  }

  async getRepositories(req, res) {
    // There must be some protection, user must be able to  use only his own username, because we are displaying private repositories as well, but I think this is out of current scope
    const username = req.getParam("username");
    if (!username) {
      throw new AppError("Please, provide username", 400);
    }

    const userToken = this.authService.getUserByUsername(username);
    if (!userToken) {
      throw new AppError("User not found", 400);
    }

    const repositories = await this.fetchRepositories(userToken);
    if (repositories.error) {
      throw new AppError(
        "Error occured when fetching repositories of user",
        400
      );
    }

    const [commitsCount, commitsRatio] =
      await this.countRepositoriesCommitsAndRatio(repositories, userToken);

    repositories.forEach((repo, i) => {
      repo.commitsCount = commitsCount[i];
      repo.commitsRatio = commitsRatio[i];
    });

    res.json(repositories);
    res.end();
  }

  async countRepositoriesCommitsAndRatio(repos, userToken) {
    const commitsCount = await Promise.all(
      repos.map(async (repo) => {
        const contributors = await this.fetchRepositoryContributors(
          repo.owner.login,
          repo.name,
          userToken
        );

        return contributors.reduce(
          (acc, contributor) => (acc += contributor.contributions),
          0
        );
      })
    );

    const commitsPercentage = await this.calculateCommitsPercentageRatio(
      commitsCount
    );

    return [commitsCount, commitsPercentage];
  }

  async fetchRepositories(token) {
    const response = await request({
      method: "GET",
      url: this._GET_USER_REPOSITORIES_URL,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "User-Agent": "node.js",
      },
      params: {
        per_page: 5,
      },
    });
    return response.data;
  }

  async fetchRepositoryContributors(owner, repo, token) {
    const response = await request({
      method: "GET",
      url: this.buildGetRepositoryContributorsUrl(owner, repo),
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "User-Agent": "node.js",
      },
      params: {
        per_page: 100,
      },
    });
    return response.data;
  }

  calculateCommitsPercentageRatio(commitCounts) {
    const sum = commitCounts.reduce((acc, commits) => (acc += commits));

    return commitCounts.map((commits) => commits / sum);
  }
}

export default GithubService;
