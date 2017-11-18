'use strict';
const yeoman = require('yeoman-generator');
const execSync = require('child_process').execSync;
const gitConfig = require('parse-git-config');

module.exports = yeoman.Base.extend({
  prompting: function () {
    this.log(
      'Welcome to the CmsLess generator!'
    );

    const git = gitConfig.sync()
    const repo = git && git['remote "origin"'] && git['remote "origin"'].url

    var prompts = [
      {
        type: 'input',
        name: 'title',
        message: 'What is the title of your website?',
        default: 'CmsLess Website',
        store: true
      },
      {
        type: 'input',
        name: 'aws_region',
        message: 'Which AWS region will you deploy to?',
        default: 'us-east-2',
        store: true
      },
      {
        type: 'input',
        name: 'domain',
        message: 'What domain would you like to deploy to?',
        default: 'example.com',
        store: true
      }
    ];

    if(repo) {
      prompts.push({
        type: 'input',
        name: 'repo',
        message: 'What is your project repository?',
        default: repo,
        store: true
      })
      prompts.push({
        type: 'input',
        name: 'license',
        message: 'What license do you want to use?',
        default: 'MIT',
        store: true
      })
    }

    return this.prompt(prompts).then(function (props) {
      this.props = props;
      this.props.isPrivate = !repo
    }.bind(this));
  },

  writing: function () {
    var foldersToCopy = ['bin', 'src'];
    for(var index in foldersToCopy) { 
      var folder = foldersToCopy[index];
      this.fs.copy(
        this.templatePath(folder + '/**/*'),
        this.destinationPath(folder),
        { globOptions: { dot: true } }
      );
    }


    ['package.json', 's3_bucket_policy.json', 'src/template.html'].forEach((file) => {
      this.fs.copyTpl(
        this.templatePath(file),
        this.destinationPath(file),
        this.props
      );
    });
  },

  install: function () {
    this.log('Running `npm install`')
    execSync('npm install');
    this.log('Run `npm run` for a list of commands')
    this.log('To push to production, `npm run build && npm run deploy`')
  },
});
