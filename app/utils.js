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
exports.getRootDirectory = exports.patchCollectionBy = exports.getTreeStructureFromBaseDirectory = exports.getMenuItemsFromBaseDirectory = exports.getDeletedFileEntityMock = exports.getFileEntityFromPath = void 0;
var path = require("path");
var fs = require("fs");
var path_1 = require("path");
var menu_utils_1 = require("../src/app/utils/menu-utils");
var file_utils_1 = require("../src/app/utils/file-utils");
var getFileEntityFromPath = function (filePath) {
    var fileInfo = fs.statSync(filePath);
    var isFolder = fileInfo.isDirectory();
    var getExtension = function (filename) {
        var ext = path.extname(filename || '').split('.');
        return ext[ext.length - 1];
    };
    var getIcon = function (extension) { return extension + '.svg'; };
    var fileExtension = isFolder ? null : getExtension(filePath);
    var icon = isFolder ? null : getIcon(fileExtension);
    return __assign({ filePath: filePath, ino: fileInfo.ino, parentPath: file_utils_1.getDirName(filePath), type: isFolder ? 'folder' : 'file', size: fileInfo.size, createdAt: fileInfo.birthtime, modifiedAt: fileInfo.mtime }, (!isFolder && { fileExtension: fileExtension, icon: icon }));
};
exports.getFileEntityFromPath = getFileEntityFromPath;
/**
 * Since the file entity does not exist after deletion, we need to mock it
 */
var getDeletedFileEntityMock = function (filePath) {
    return {
        filePath: filePath,
        ino: 0,
        parentPath: file_utils_1.getDirName(filePath),
        type: 'file',
        size: 0,
        createdAt: new Date(),
        modifiedAt: new Date(),
    };
};
exports.getDeletedFileEntityMock = getDeletedFileEntityMock;
var getMenuItemsFromBaseDirectory = function (baseDir) {
    var treeStructure = exports.getTreeStructureFromBaseDirectory(baseDir);
    return menu_utils_1.folderStructureToMenuItems(baseDir, treeStructure);
};
exports.getMenuItemsFromBaseDirectory = getMenuItemsFromBaseDirectory;
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
var patchCollectionBy = function (collection, newEl, key) {
    var copy = collection.slice(0);
    var index = copy.findIndex(function (el) { return el[key] === newEl[key]; });
    if (index > -1) {
        copy[index] = newEl;
    }
    else {
        console.error("no element with identifier " + key + " === " + newEl[key] + " found in collection");
    }
    return copy;
};
exports.patchCollectionBy = patchCollectionBy;
var getRootDirectory = function (baseDir) {
    var menuItems = exports.getMenuItemsFromBaseDirectory(baseDir);
    var rootEntity = exports.getFileEntityFromPath(baseDir);
    return __assign(__assign({}, menu_utils_1.getTreeNodeFromFileEntity(rootEntity)), { children: menuItems });
};
exports.getRootDirectory = getRootDirectory;
//# sourceMappingURL=utils.js.map