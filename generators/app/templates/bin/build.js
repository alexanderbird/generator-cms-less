const TaskRunner = require('./task_runner.js');
const cheerio = require('cheerio');
const fs = require('fs');
const ncp = require('ncp').ncp;
const path = require('path');
const rmdir = require('rmdir');
const toString = require('stream-to-string');

ncp.limit = 16;

const config = {
  directories: {
    src: 'src',
    build: 'build'
  },
  files: {
    template: 'template.html'
  }
}

const cwd = process.cwd();
const srcPath = path.join(cwd, config.directories.src);
const buildPath = path.join(cwd, config.directories.build);

function CopyData(name, source, destination, options) {
  this.name = name;
  this.source = path.join(config.directories.src, source);
  this.destination = path.join(config.directories.build, destination);
  this.options = options || {};
}

function FilterFactory(callback) {
  return (absolutePath) => {
    let relativePath = absolutePath.replace(srcPath + '/', ''); 
    let name = path.basename(relativePath);
    let pathArray = relativePath.split(path.sep);
    return callback({ name, path: pathArray });
  }
}

TaskRunner.AddStep('CLEAN', (yes, no, maybe) => {
  if(fs.existsSync(config.directories.build)) {
    rmdir(config.directories.build, maybe);
  } else {
    yes();
  }
});

TaskRunner.AddStep('CREATE `build` DIRECTORY', (yes, no, maybe) => {
  fs.mkdir(config.directories.build, maybe);
});

let template;

TaskRunner.AddStep('LOAD TEMPLATE', (yes, no, maybe) => {
  let templatePath = path.join(config.directories.src, config.files.template);
  fs.readFile(templatePath, function (err, data) {
    if(err) {
      no(err);
    } else {
      template = cheerio.load(data.toString('utf-8'));
      fs.writeFile(path.join(config.directories.build, '-'), template.html(), maybe);
    }
  });
});

[
  new CopyData('COPY ASSETS', '/assets', '/'),
  new CopyData('ASSEMBLE PAGES', '/partials', '/', {
    filter: FilterFactory(({ name }) => name.match(/(.*\.html|partials)/)),
    transform: (read, write) => {
      toString(read).then((fileContents) => {
        let partial = cheerio.load(fileContents);
        partial('script').each((i, script) => template('body').append(script));
        partial('script').remove();
        template('#cms-less-destination').empty();
        template('#cms-less-destination').append(partial.html());
        write.write(template.html());
        write.end();
      });
    }
  }),
  new CopyData('COPY PARTIALS', '/partials', '/_partials')
].forEach(({ name, source, destination, options }) => {
  TaskRunner.AddStep(name, (yes, no, maybe) => {
    ncp(source, destination, options, maybe);
  });
});

TaskRunner.AddStep('DROP EXTENSIONS', (yes, no, maybe) => {
  fs.readdir(config.directories.build, {}, (err, files) => {
    if(err) {
      no(err);
    } else {
      let toRename = files.filter((f) => f.match(/^.*\.html$/));
      const afterRenamed = [];
      toRename.forEach((file) => {
        afterRenamed.push(new Promise((resolve, reject) => {
          let fileWithPath = path.join(config.directories.build, file);
          fs.rename(fileWithPath, fileWithPath.replace(/\.html$/, ''), (err) => err ? reject(err) : resolve());
        }));
      });
      Promise.all(afterRenamed).then(yes).catch(no);
    }
  });
});

TaskRunner.ExecuteSteps();
