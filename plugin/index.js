const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

/**
 * 
 * @param {import('abell/utils/typedefs.js').ProgramInfo} programInfo 
 */

const generateBlogs = [];
let isPluginWorking = true;

async function addBlogContent({article, contentPath}) {
  console.log(`> Writing blog ${article.title}`);
  const { body_markdown } = await fetch(`https://dev.to/api/articles/${article.id}`).then(res => res.json());
  
  if (!fs.existsSync(contentPath)) {
    fs.mkdirSync(contentPath);
  }

  const pathToArticleDir = path.join(contentPath, article.slug);
  
  if (!fs.existsSync(pathToArticleDir)) {
    fs.mkdirSync(pathToArticleDir);
  }

  fs.writeFileSync(path.join(pathToArticleDir, 'index.md'), body_markdown);

  const metaJSON = {
    ...article,
    $createdAt: article.created_at,
    $modifiedAt: article.edited_at || article.created_at
  }

  fs.writeFileSync(path.join(pathToArticleDir, 'meta.json'), JSON.stringify(metaJSON, {}, 2));

  generateBlogs.push(article.slug);
}


/**
 * Removes the folder
 * @param {String} pathToRemove path to the directory which you want to remove
 */
function rmdirRecursiveSync(pathToRemove) {
  if (fs.existsSync(pathToRemove)) {
    fs.readdirSync(pathToRemove).forEach((file, index) => {
      const curPath = path.join(pathToRemove, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        // recurse
        rmdirRecursiveSync(curPath);
      } else {
        // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(pathToRemove);
  }
}

async function beforeBuild(programInfo) {
  if (fs.existsSync(programInfo.abellConfigs.contentPath)) {
    isPluginWorking = false;
    console.log('\n\n>> The plugin does not support having existing content.');
    console.log(`>> Remove the ${programInfo.abellConfigs.contentPath} directory for the source plugin to work.\n\n`)
    return;
  }

  const articles = await fetch(`https://dev.to/api/articles?username=${programInfo.abellConfigs.pluginConfig.devUsername}`).then(res => res.json());

  for(const article of articles.slice(0, programInfo.abellConfigs.pluginConfig.articleCount)) {
    await addBlogContent({
      article,
      contentPath: programInfo.abellConfigs.contentPath
    });
  }
}

function afterBuild(programInfo) {
  if (isPluginWorking) {
    console.log('Cleaning articles from local project...');
    rmdirRecursiveSync(programInfo.abellConfigs.contentPath);
  }
}

module.exports = { beforeBuild, afterBuild }
