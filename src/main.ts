import * as fs from 'fs';
import * as path from 'path';

import * as core from '@actions/core';
import * as tc from '@actions/tool-cache';

function correctCacheNameSuffix(toolPath : string, newSuffix:string) : string {
    var directory = path.dirname(toolPath);
    return path.join(directory, newSuffix);
}

async function findExistingNugetOrDownload() : Promise< { directory: string; completePath: string; }> {
/*  const pathToCachedNuGet = tc.find("nuget", "latest")

  if (pathToCachedNuGet) {
    core.debug(`Found a previously cached nuget at ${pathToCachedNuGet}`);
    return { directory: pathToCachedNuGet, completePath: path.join(pathToCachedNuGet, "nuget.exe") };
  }
*/
  core.debug("Downloading Nuget tool");
  const downloadedToolPath = await tc.downloadTool("https://dist.nuget.org/win-x86-commandline/latest/nuget.exe");

  // Tool cache seems to be adding a GUID as extension. Rename extension to nuget.exe
  const correctedPath = correctCacheNameSuffix(downloadedToolPath, "nuget.exe")
  fs.renameSync(downloadedToolPath, correctedPath);
  const correctedPathDirectory = path.dirname(correctedPath);
  return {directory:correctedPathDirectory, completePath: correctedPath}
/*
  var cachedToolDir = await tc.cacheDir(correctedPathDirectory, "nuget", "latest");
  core.debug(`cached nuget.exe in tool dir ${cachedToolDir}`);

  return { directory: cachedToolDir, completePath: path.join(pathToCachedNuGet, "nuget.exe") };
  */
}

async function run() {
  try {
    const tool = await findExistingNugetOrDownload();
    core.addPath(tool.directory);

    const localPath = "nuget.exe";

    // Copy it to current directory for easy access.
    fs.copyFileSync(tool.completePath, localPath);
    
    fs.chmodSync(localPath, 0o775);

  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
