import Joi from "joi";
import path from "path";
import * as dotenv from "dotenv";

dotenv.config();

const schema = Joi.object({
  PORT: Joi.string().default("3000"),
  GITHUB_CLIENT_ID: Joi.string().required(),
  GITHUB_CLIENT_SECRET: Joi.string().required(),
});

const { error, value: config } = schema.validate(process.env, {
  allowUnknown: true,
  abortEarly: false,
});

if (error) {
  throw new Error(
    "Invalid environment variables:\n" +
      error.details.map((detail) => detail.message).join("\n")
  );
}

export default config;
