import AppError from "../utils/AppError.js";
import config from "../utils/config.js";
import request from "../utils/request.js";
import * as fs from "node:fs";

class AuthService {
  usersFilePath = "./auth/users.csv";

  constructor(githubService) {
    this.githubService = githubService;
    this.users = new Map();
    this.loadUsers();
  }

  loadUsers() {
    const data = fs.readFileSync(this.usersFilePath, "utf-8");
    data.split("\n").forEach((user) => {
      if (!user) {
        return;
      }
      const [username, token] = user.split(",");
      this.users.set(username, token);
    });
  }

  addUser({ username, token }) {
    return new Promise((resolve, reject) => {
      fs.appendFile(this.usersFilePath, `${username},${token}\n`, (err) => {
        if (err) {
          reject(err);
        } else {
          this.users.set(username, token);
          resolve();
        }
      });
    });
  }

  getUserByUsername(username) {
    return this.users.get(username);
  }

  async redirectFromGithub(req, res) {
    const code = req.getParam("code");
    const data = await this.githubService.getUserToken(code);
    if (data.error) {
      throw new AppError("Auth error, please try again", 400);
    }
    const githubUser = await this.githubService.getUser(data.access_token);

    this.addUser({ username: githubUser.login, token: data.access_token });

    res.json({ success: true });
    res.end();
  }

  oauthGithubLogin(req, res) {
    this.githubService.oauthRedirect(req, res);
  }
}

export default AuthService;
