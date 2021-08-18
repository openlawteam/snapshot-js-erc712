import dotenv from "dotenv";
dotenv.config({ path: ".env" });

export const SNAPSHOT_HUB_API_URL: string = process.env.SNAPSHOT_HUB_API_URL
  ? process.env.SNAPSHOT_HUB_API_URL
  : "";
