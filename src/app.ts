import inquirer from "inquirer";
import chalk from "chalk";
import path from "path";
import {  exec, spawn } from "child_process";
import dotenv from "dotenv";
import * as cheerio from 'cheerio';
import { v4 as uuidv4 } from 'uuid';
import fs, { existsSync, mkdirSync } from "fs";
dotenv.config()

async function Cli() {
  console.log(chalk.yellow("Welcome to my image downloader app ✨"))
  let prompt = await inquirer.prompt([{
    type: "input",
    message: chalk.bold.blue("Please enter your URL"),
    name: "url",
    theme: { prefix: '🌍 ' }
}]);
if (!prompt.url) {
  console.log(chalk.red("We cannot fulfill your request"));
console.log(chalk.green(" Please try again! 🙏"));

}
exec(`curl "${prompt.url}"`, (error, stdout, stderr) => {
  if (error) {
    console.error(chalk.red(`Error fetching URL: ${error.message}`));
  
  }
  if (stderr) {
    console.error(chalk.red(`stderr: ${stderr}`));
  
  }

  // Parse the HTML content with Cheerio
  const $ = cheerio.load(stdout);

  // Array to store image details
  const images: { name?: string; link: string }[] = [];

  // Extract all img tags and their src attributes
  $("img").each((_, element) => {
    const src = element.attribs?.src;

    if (src) {
      const randomId = uuidv4(); // Generate a unique ID
      const name = `${element.attribs?.alt || "file"}_${randomId}`; // Use alt text or fallback to UUID
      const link = src;

      images.push({ name, link }); // Store image details for later use

      // Ensure the /tmp/photos directory exists
      // Ensure the /tmp/photos directory exists
const photosDir = "/tmp/photos";
if (!fs.existsSync(photosDir)) {
  fs.mkdirSync(photosDir, { recursive: true });
  console.log(chalk.green(`Created directory: ${photosDir}`));
}

// Escape special characters in the file name
const safeName = name.replace(/["'\\$]/g, "\\$&"); // Escape quotes, single quotes, and dollar signs

// Create an empty file using touch
exec(
  `touch "${path.join(photosDir, safeName)}"`,
  (downloadError, downloadStdout, downloadStderr) => {
    if (downloadError) {
      console.error(
        chalk.red(`Error creating file for image ${name}: ${downloadError.message}`)
      );
    } else if (downloadStderr) {
      console.error(chalk.red(`stderr: ${downloadStderr}`));
    } else {
      console.log(
        chalk.green(`Successfully created file for image: ${name} at ${photosDir}`)
      );

      // Download the image using curl
      exec(
        `curl -o "${path.join(photosDir, safeName)}" "${link}"`,
        (curlError, curlStdout, curlStderr) => {
          // Extract the file extension from the link or safeName
          const fileExtension = path.extname(path.join(photosDir,safeName)); // You can also use path.extname(link) if needed
      console.log(chalk.yellowBright(fileExtension))
          if (curlError) {
            console.error(
              chalk.red(`Error downloading image ${name}: ${curlError.message}`)
            );
          } else if (curlStderr) {
            console.error(chalk.red(`stderr: ${curlStderr}`));
            console.log(chalk.blue(`File extension: ${fileExtension}`)); // Log the file extension

          } else {
            console.log(
              chalk.green(`Successfully downloaded image: ${name} from ${link}`)
            );
            console.log(chalk.blue(`File extension: ${fileExtension}`)); // Log the file extension
          }
        }
      );
    }
  }
)
 
    }})}
)}



Cli()




