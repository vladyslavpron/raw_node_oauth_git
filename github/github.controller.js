class GithubController {
  constructor(githubService) {
    this.githubService = githubService;
  }

  getRepositories(req, res) {
    this.githubService.getRepositories(req, res);
  }
}

export default GithubController;
