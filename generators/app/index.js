'use strict';
var yeoman = require('yeoman-generator');

module.exports = yeoman.Base.extend({
  prompting: function () {
    this.log(
      'Welcome to the CmsLess generator!'
    );

    var prompts = [
      {
        type: 'input',
        name: 'siteTitle',
        message: 'What is the title of your website?',
        default: 'CmsLess Website',
        store: true
      },
      {
        type: 'input',
        name: 'aws_region',
        message: 'Which AWS region will you deploy to?',
        default: 'us-west-1',
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

    return this.prompt(prompts).then(function (props) {
      this.props = props;
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


    ['package.json', 's3_bucket_policy.json', 'template.html'].forEach((file) => {
      this.fs.copyTpl(
        this.templatePath(file),
        this.destinationPath(file),
        this.props
      );
    });
  },
});
