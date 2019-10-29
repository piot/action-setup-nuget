import * as fs from 'fs';
import * as path from 'path';

import * as core from '@actions/core';
import * as tc from '@actions/tool-cache';

function correctCacheNameSuffix(toolPath : string, newSuffix:string) : string {
    var directory = path.dirname(toolPath);
    return path.join(directory, newSuffix);
}

async function findExistingNugetOrDownload() : Promise<string> {
  const pathToCachedNuGet = tc.find("nuget", "latest")

  if (pathToCachedNuGet) {
    core.debug(`Found a previously cached nuget at ${pathToCachedNuGet}`);
    return pathToCachedNuGet;
  }

  core.debug("Downloading Nuget tool");
  const downloadedToolPath = await tc.downloadTool("https://dist.nuget.org/win-x86-commandline/latest/nuget.exe");

  // Tool cache seems to be adding a GUID as extension. Rename extension to nuget.exe
  const correctedPath = correctCacheNameSuffix(downloadedToolPath, "nuget.exe")
  fs.renameSync(downloadedToolPath, correctedPath);
  const correctedPathDirectory = path.dirname(correctedPath);

  var cachedToolDir = await tc.cacheDir(correctedPathDirectory, "nuget", "latest");
  core.debug(`cached nuget.exe in tool dir ${cachedToolDir}`);

  return cachedToolDir;
}

async function run() {
  try {
    const toolDirectory = await findExistingNugetOrDownload();
    core.addPath(toolDirectory);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
