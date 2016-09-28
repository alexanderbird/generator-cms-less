'use strict';
var yeoman = require('yeoman-generator');

module.exports = yeoman.Base.extend({
  prompting: function () {
    this.log(
      'Welcome to the CmsLess generator!'
    );

    var prompts = [{
      type: 'input',
      name: 'siteTitle',
      message: 'What is the title of your website?',
      default: 'CmsLess Website',
      store: true
    }];

    return this.prompt(prompts).then(function (props) {
      this.props = props;
    }.bind(this));
  },

  writing: function () {
    var foldersToCopy = ['cms-less-content', 'css', 'js'];
    for(var index in foldersToCopy) { 
      var folder = foldersToCopy[index];
      this.fs.copy(
        this.templatePath(folder + '/**/*'),
        this.destinationPath(folder),
        { globOptions: { dot: true } }
      );
    }

    this.fs.copyTpl(
      this.templatePath('index.html'),
      this.destinationPath('index.html'),
      {
        title: this.props.siteTitle
      }
    );

    this.fs.copy(
      this.templatePath('.htaccess'),
      this.destinationPath('.htaccess')
    );
  },
});
