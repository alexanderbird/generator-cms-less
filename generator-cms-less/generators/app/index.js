'use strict';
var yeoman = require('yeoman-generator');

module.exports = yeoman.Base.extend({
  prompting: function () {
    // Have Yeoman greet the user.
    this.log(
      'Welcome to the CmsLess generator!'
    );

    this.log(
      'TODO: check that the .htaccess page is actually copied over'
    );

    var prompts = [{
      type: 'input',
      name: 'siteTitle',
      message: 'What is the title of your website?',
      default: 'CmsLess Website'
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
        this.destinationPath(folder)
      );
    }

    this.fs.copyTpl(
      this.templatePath('index.html'),
      this.destinationPath('index.html'),
      {
        title: this.props.siteTitle
      }
    );
  },

  install: function () {
    this.installDependencies();
  }
});
