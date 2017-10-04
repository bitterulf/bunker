'use strict';
const Generator = require('yeoman-generator');
const chalk = require('chalk');
const yosay = require('yosay');

module.exports = class extends Generator {
    prompting() {
        this.log(yosay(
            'Welcome to the impressive ' + chalk.red('generator-feature') + ' generator!'
        ));

        const prompts = [
            {
                type    : 'input',
                name    : 'name',
                message : 'feature name'
            }
        ];

        return this.prompt(prompts).then(props => {
            this.props = props;
        });
    }

    writing() {
        console.log(this.props.name);

        this.fs.copyTpl(
            this.templatePath('template.css'),
            this.destinationPath('features/'+this.props.name+'/'+this.props.name+'.css'),
            { name: this.props.name }
        );

        this.fs.copyTpl(
            this.templatePath('templateBackend.js'),
            this.destinationPath('features/'+this.props.name+'/'+this.props.name+'Backend.js'),
            { name: this.props.name }
        );

        this.fs.copyTpl(
            this.templatePath('templateFrontend.js'),
            this.destinationPath('features/'+this.props.name+'/'+this.props.name+'Frontend.js'),
            { name: this.props.name }
        );
    }

    install() {
    // this.installDependencies();
    }
};
