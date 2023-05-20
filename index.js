import config from "./utils/config.js";
import App from "./app/App.js";
import authRouter from "./auth/auth.router.js";
import githubRouter from "./github/github.router.js";

const app = new App();

app.mountRouter(authRouter);
app.mountRouter(githubRouter);

app.listen(config.PORT);
