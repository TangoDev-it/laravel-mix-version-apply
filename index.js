let mix = require('laravel-mix');
let glob = require('glob');
let Log = require('laravel-mix/src/Log');
let File = require('laravel-mix/src/File');

class VersionApply {
    name() {
        return ['versionApply'];
    }

    register(fileInput) {
        this.initFilesArray(fileInput);
        Mix.listen('build', () => this.versionApply());
    }

    initFilesArray(fileInput) {
        let files;
        if(Array.isArray(fileInput)) { // array of strings
            files = fileInput;
        } else if(fileInput.includes('*')) { // glob
            files = glob.sync(fileInput, { nodir: true });
        } else { // single file
            files = [ fileInput ];
        }

        this.files = files.map((filePath) => new File(filePath));        
    }

    versionApply() {
        let manifestEntries = Mix.manifest.manifest;
    
        this.files.forEach(file => {
            let fileContent = file.read();
            let newFileContent = this.replaceVersionEntries(fileContent, manifestEntries);
            if(newFileContent != fileContent) {
                file.write(newFileContent);
            } else {
                Log.error(`Version apply: nothing to do in ${file.name()}`);
            }
        });
        
    }

    replaceVersionEntries(fileContent, manifestEntries) {
        let newFileContent = fileContent;
        for (var key in manifestEntries) {            
            if (manifestEntries.hasOwnProperty(key)) {
                newFileContent = newFileContent.replace(new RegExp(key, 'g'), manifestEntries[key]);                
            }
        }
        return newFileContent;
    }
}

mix.extend('versionApply', new VersionApply());