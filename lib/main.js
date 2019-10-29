"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const core = __importStar(require("@actions/core"));
const tc = __importStar(require("@actions/tool-cache"));
function correctCacheNameSuffix(toolPath, newSuffix) {
    var directory = path.dirname(toolPath);
    return path.join(directory, newSuffix);
}
function findExistingNugetOrDownload() {
    return __awaiter(this, void 0, void 0, function* () {
        /*  const pathToCachedNuGet = tc.find("nuget", "latest")
        
          if (pathToCachedNuGet) {
            core.debug(`Found a previously cached nuget at ${pathToCachedNuGet}`);
            return { directory: pathToCachedNuGet, completePath: path.join(pathToCachedNuGet, "nuget.exe") };
          }
        */
        core.debug("Downloading Nuget tool");
        const downloadedToolPath = yield tc.downloadTool("https://dist.nuget.org/win-x86-commandline/latest/nuget.exe");
        // Tool cache seems to be adding a GUID as extension. Rename extension to nuget.exe
        const correctedPath = correctCacheNameSuffix(downloadedToolPath, "nuget.exe");
        fs.renameSync(downloadedToolPath, correctedPath);
        const correctedPathDirectory = path.dirname(correctedPath);
        return { directory: correctedPathDirectory, completePath: correctedPath };
        /*
          var cachedToolDir = await tc.cacheDir(correctedPathDirectory, "nuget", "latest");
          core.debug(`cached nuget.exe in tool dir ${cachedToolDir}`);
        
          return { directory: cachedToolDir, completePath: path.join(pathToCachedNuGet, "nuget.exe") };
          */
    });
}
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const tool = yield findExistingNugetOrDownload();
            core.addPath(tool.directory);
            // Copy it to current directory for easy access.
            fs.copyFileSync(tool.completePath, "nuget.exe");
        }
        catch (error) {
            core.setFailed(error.message);
        }
    });
}
run();
