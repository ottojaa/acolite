"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTreeStructureFromBaseDirectory = exports.getFileEntityFromPath = void 0;
var path = require("path");
var fs = require("fs");
var path_1 = require("path");
var getFileEntityFromPath = function (filePath) {
    var fileInfo = fs.statSync(filePath);
    var isFolder = fileInfo.isDirectory();
    var getExtension = function (filename) {
        var ext = path.extname(filename || '').split('.');
        return ext[ext.length - 1];
    };
    var getParentPath = function (filePath) {
        var lastIdx = filePath.lastIndexOf('/');
        return filePath.substring(0, lastIdx);
    };
    return __assign({ filePath: filePath, parentPath: getParentPath(filePath), type: isFolder ? 'folder' : 'file', size: fileInfo.size, createdAt: fileInfo.birthtime, modifiedAt: fileInfo.mtime }, (!isFolder && { fileExtension: getExtension(filePath) }));
};
exports.getFileEntityFromPath = getFileEntityFromPath;
var getTreeStructureFromBaseDirectory = function (baseDir) {
    var directoryPath = baseDir;
    var isDirectory = function (path) { return fs.statSync(path).isDirectory(); };
    var getDirectories = function (fileEntity) {
        return fs
            .readdirSync(fileEntity.filePath)
            .map(function (name) { return path_1.join(fileEntity.filePath, name); })
            .filter(isDirectory)
            .map(exports.getFileEntityFromPath);
    };
    var isFile = function (path) { return fs.statSync(path).isFile(); };
    var getFiles = function (fileEntity) {
        return fs
            .readdirSync(fileEntity.filePath)
            .map(function (name) { return path_1.join(fileEntity.filePath, name); })
            .filter(isFile)
            .filter(function (item) { return !/(^|\/)\.[^\/\.]/g.test(item); }) // Filter hidden files such as .DS_Store
            .map(exports.getFileEntityFromPath);
    };
    var getFilesRecursively = function (file) {
        var dirs = getDirectories(file);
        var files = dirs.map(function (dir) {
            return {
                data: dir,
                children: getFilesRecursively(dir).reduce(function (directoryDescendants, descendant) {
                    return directoryDescendants.concat(descendant);
                }, []),
            };
        });
        return files.concat(getFiles(file));
    };
    var rootFolder = exports.getFileEntityFromPath(directoryPath);
    return getFilesRecursively(rootFolder);
};
exports.getTreeStructureFromBaseDirectory = getTreeStructureFromBaseDirectory;
//# sourceMappingURL=utils.js.map