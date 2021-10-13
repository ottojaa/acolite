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
exports.getFileEntityFromPath = void 0;
var path = require("path");
var fs = require("fs");
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
//# sourceMappingURL=utils.js.map