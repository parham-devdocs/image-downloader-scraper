"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const inquirer_1 = __importDefault(require("inquirer"));
const chalk_1 = __importDefault(require("chalk"));
const path_1 = __importDefault(require("path"));
const child_process_1 = require("child_process");
const dotenv_1 = __importDefault(require("dotenv"));
const cheerio = __importStar(require("cheerio"));
const uuid_1 = require("uuid");
const fs_1 = __importDefault(require("fs"));
dotenv_1.default.config();
function Cli() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(chalk_1.default.yellow("Welcome to my image downloader app ✨"));
        let prompt = yield inquirer_1.default.prompt([{
                type: "input",
                message: chalk_1.default.bold.blue("Please enter your URL"),
                name: "url",
                theme: { prefix: '🌍 ' }
            }]);
        if (!prompt.url) {
            console.log(chalk_1.default.red("We cannot fulfill your request"));
            console.log(chalk_1.default.green(" Please try again! 🙏"));
        }
        (0, child_process_1.exec)(`curl "${prompt.url}"`, (error, stdout, stderr) => {
            if (error) {
                console.error(chalk_1.default.red(`Error fetching URL: ${error.message}`));
            }
            if (stderr) {
                console.error(chalk_1.default.red(`stderr: ${stderr}`));
            }
            // Parse the HTML content with Cheerio
            const $ = cheerio.load(stdout);
            // Array to store image details
            const images = [];
            // Extract all img tags and their src attributes
            $("img").each((_, element) => {
                var _a, _b;
                const src = (_a = element.attribs) === null || _a === void 0 ? void 0 : _a.src;
                if (src) {
                    const randomId = (0, uuid_1.v4)(); // Generate a unique ID
                    const name = `${((_b = element.attribs) === null || _b === void 0 ? void 0 : _b.alt) || "file"}_${randomId}`; // Use alt text or fallback to UUID
                    const link = src;
                    images.push({ name, link }); // Store image details for later use
                    // Ensure the /tmp/photos directory exists
                    // Ensure the /tmp/photos directory exists
                    const photosDir = "/tmp/photos";
                    if (!fs_1.default.existsSync(photosDir)) {
                        fs_1.default.mkdirSync(photosDir, { recursive: true });
                        console.log(chalk_1.default.green(`Created directory: ${photosDir}`));
                    }
                    // Escape special characters in the file name
                    const safeName = name.replace(/["'\\$]/g, "\\$&"); // Escape quotes, single quotes, and dollar signs
                    // Create an empty file using touch
                    (0, child_process_1.exec)(`touch "${path_1.default.join(photosDir, safeName)}"`, (downloadError, downloadStdout, downloadStderr) => {
                        if (downloadError) {
                            console.error(chalk_1.default.red(`Error creating file for image ${name}: ${downloadError.message}`));
                        }
                        else if (downloadStderr) {
                            console.error(chalk_1.default.red(`stderr: ${downloadStderr}`));
                        }
                        else {
                            console.log(chalk_1.default.green(`Successfully created file for image: ${name} at ${photosDir}`));
                            // Download the image using curl
                            (0, child_process_1.exec)(`curl -o "${path_1.default.join(photosDir, safeName)}" "${link}"`, (curlError, curlStdout, curlStderr) => {
                                // Extract the file extension from the link or safeName
                                const fileExtension = path_1.default.extname(path_1.default.join(photosDir, safeName)); // You can also use path.extname(link) if needed
                                console.log(chalk_1.default.yellowBright(fileExtension));
                                if (curlError) {
                                    console.error(chalk_1.default.red(`Error downloading image ${name}: ${curlError.message}`));
                                }
                                else if (curlStderr) {
                                    console.error(chalk_1.default.red(`stderr: ${curlStderr}`));
                                    console.log(chalk_1.default.blue(`File extension: ${fileExtension}`)); // Log the file extension
                                }
                                else {
                                    console.log(chalk_1.default.green(`Successfully downloaded image: ${name} from ${link}`));
                                    console.log(chalk_1.default.blue(`File extension: ${fileExtension}`)); // Log the file extension
                                }
                            });
                        }
                    });
                }
            });
        });
    });
}
Cli();
